import * as XLSX from 'xlsx';
import { prisma } from '../lib/prisma';

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
 * Generate XLSX file with attendance data for multiple dates
 */
async function generateAttendanceReport(dates: Date[], outputPath: string) {
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

  // Write file
  XLSX.writeFile(workbook, outputPath);
  console.log(`✅ Attendance report generated successfully: ${outputPath}`);
  console.log(`📊 Generated ${dates.length} sheet(s) for the specified dates.`);
}

/**
 * Parse date string in YYYY-MM-DD format
 */
function parseDate(dateStr: string): Date {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
  }
  return date;
}

/**
 * Main function
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    let dates: Date[];
    let outputPath = './attendance-report.xlsx';

    if (args.length === 0) {
      // Default dates from the image: Oct 27-31, 2025
      dates = [
        new Date('2025-10-27'),
        new Date('2025-10-28'),
        new Date('2025-10-29'),
        new Date('2025-10-30'),
        new Date('2025-10-31'),
      ];
    } else {
      // Parse dates from arguments
      // Format: node script.ts 2025-10-27 2025-10-28 ... [output-path]
      const dateArgs = args.filter(arg => !arg.endsWith('.xlsx'));
      const outputArg = args.find(arg => arg.endsWith('.xlsx'));

      if (dateArgs.length === 0) {
        console.error('❌ Please provide at least one date in YYYY-MM-DD format');
        console.log('Usage: npm run generate-attendance [date1] [date2] ... [output.xlsx]');
        console.log('Example: npm run generate-attendance 2025-10-27 2025-10-28 report.xlsx');
        process.exit(1);
      }

      dates = dateArgs.map(parseDate);
      if (outputArg) {
        outputPath = outputArg;
      }
    }

    console.log('📝 Generating attendance report...');
    console.log(`📅 Dates: ${dates.map(d => d.toISOString().split('T')[0]).join(', ')}`);
    console.log(`📄 Output: ${outputPath}`);
    
    await generateAttendanceReport(dates, outputPath);

    // Close Prisma connection
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error generating attendance report:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { generateAttendanceReport, getAttendanceForDate };

