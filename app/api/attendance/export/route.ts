import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isUserAdmin } from "@/lib/auth";
import * as XLSX from 'xlsx';

interface AttendanceData {
  employeeName: string;
  clockIn: string;
  clockOut: string;
  breakTime: string;
  workingHours: string;
  present: boolean;
}

/**
 * Format time from DateTime to 12-hour format (HH:MM:SS AM/PM) or return empty string
 */
function formatTime(date: Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { 
    hour12: true, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}

/**
 * Format break time duration in minutes to readable format
 * Shows duration as hours and minutes (e.g., "1h 30m" for 90 minutes)
 */
function formatBreakTime(minutes: number | null | undefined): string {
  if (!minutes || minutes === 0) return '';
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

/**
 * Format working hours to readable format
 * Shows hours with 2 decimal places (e.g., "8.50" for 8.5 hours)
 */
function formatWorkingHours(hours: number | null | undefined): string {
  if (!hours || hours === 0) return '';
  return hours.toFixed(2);
}

/**
 * Get attendance data for a specific date
 */
async function getAttendanceForDate(date: Date): Promise<AttendanceData[]> {
  // Get all active employees
  const employees = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: [
      { firstName: 'asc' },
      { lastName: 'asc' },
    ],
  });

  // Normalize the input date to start of day for comparison
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Get all attendance records for this date
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      date: {
        gte: targetDate,
        lt: nextDay,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Create a map of userId -> attendance record
  const attendanceMap = new Map(
    attendanceRecords.map(record => [record.userId, record])
  );

  // Build attendance data for all employees
  const attendanceData: AttendanceData[] = employees.map(employee => {
    const attendance = attendanceMap.get(employee.id);
    const employeeName = `${employee.firstName} ${employee.lastName}`;

    if (!attendance) {
      return {
        employeeName,
        clockIn: '',
        clockOut: '',
        breakTime: '',
        workingHours: '',
        present: false,
      };
    }

    const isPresent = attendance.status === 'PRESENT' && 
                     (attendance.checkInTime !== null || attendance.checkOutTime !== null);

    return {
      employeeName,
      clockIn: formatTime(attendance.checkInTime),
      clockOut: formatTime(attendance.checkOutTime),
      breakTime: formatBreakTime(attendance.totalBreakTime),
      workingHours: formatWorkingHours(attendance.totalHours),
      present: isPresent,
    };
  });

  return attendanceData;
}

/**
 * Get all dates in a month
 */
function getDatesInMonth(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    dates.push(new Date(year, month - 1, day));
  }
  
  return dates;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminCheck = await isUserAdmin(req);
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const body = await req.json();
    const { year, month } = body;

    if (!year || !month) {
      return NextResponse.json(
        { message: "Year and month are required" },
        { status: 400 }
      );
    }

    // Validate month (1-12)
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { message: "Invalid month. Must be between 1 and 12" },
        { status: 400 }
      );
    }

    // Get all dates in the month
    const dates = getDatesInMonth(year, month);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Process each date
    for (const date of dates) {
      const attendanceData = await getAttendanceForDate(date);
      
      // Convert to worksheet format
      const worksheetData = [
        ['Employee Name', 'Clock In', 'Clock Out', 'Break Time', 'Working Hours', 'Present'],
        ...attendanceData.map(row => [
          row.employeeName,
          row.clockIn,
          row.clockOut,
          row.breakTime,
          row.workingHours,
          row.present ? 'TRUE' : 'FALSE',
        ]),
      ];

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 25 }, // Employee Name
        { wch: 12 }, // Clock In
        { wch: 12 }, // Clock Out
        { wch: 12 }, // Break Time
        { wch: 14 }, // Working Hours
        { wch: 10 }, // Present
      ];

      // Format sheet name (e.g., "2025-10-27 Mon")
      // Excel sheet names are limited to 31 characters and cannot contain: \ / ? * [ ]
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[date.getDay()];
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      let sheetName = `${dateStr} ${dayName}`;
      
      // Ensure sheet name doesn't exceed Excel's 31 character limit
      if (sheetName.length > 31) {
        sheetName = sheetName.substring(0, 31);
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const filename = `attendance-${monthNames[month - 1]}-${year}.xlsx`;

    // Return file as response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting attendance:', error);
    return NextResponse.json(
      { message: "Error exporting attendance data" },
      { status: 500 }
    );
  }
}

