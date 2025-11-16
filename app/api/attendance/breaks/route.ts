import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

/**
 * CEO Query Endpoint: Get all breaks with filters
 * Query parameters:
 * - date: specific date (YYYY-MM-DD) - optional
 * - dateFrom: start date (YYYY-MM-DD) - optional
 * - dateTo: end date (YYYY-MM-DD) - optional
 * - userId: specific employee ID - optional
 * - employeeName: search by employee name - optional
 * - department: filter by department - optional
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Check if user has permission to view breaks (CEO/Admin)
    const canViewBreaks = await hasPermission(session.user.id, "attendance.view") || 
                          await hasPermission(session.user.id, "dashboard.admin");
    
    if (!canViewBreaks) {
      return NextResponse.json(
        { message: "Access denied. You don't have permission to view breaks." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const userId = searchParams.get("userId");
    const employeeName = searchParams.get("employeeName");
    const department = searchParams.get("department");

    // Build where conditions for attendance
    const attendanceWhere: any = {};

    // Date filters
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      attendanceWhere.date = {
        gte: targetDate,
        lt: nextDay,
      };
    } else if (dateFrom || dateTo) {
      attendanceWhere.date = {};
      if (dateFrom) {
        const startDate = new Date(dateFrom);
        startDate.setHours(0, 0, 0, 0);
        attendanceWhere.date.gte = startDate;
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        attendanceWhere.date.lte = endDate;
      }
    }

    // User filters
    const userWhere: any = {};
    if (userId) {
      attendanceWhere.userId = userId;
    }
    if (employeeName) {
      userWhere.OR = [
        { firstName: { contains: employeeName, mode: 'insensitive' } },
        { lastName: { contains: employeeName, mode: 'insensitive' } },
      ];
    }
    if (department) {
      userWhere.department = { contains: department, mode: 'insensitive' };
    }

    if (Object.keys(userWhere).length > 0) {
      attendanceWhere.user = userWhere;
    }

    // Fetch attendance records with breaks
    const attendanceRecords = await prisma.attendance.findMany({
      where: attendanceWhere,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            position: true,
          },
        },
        breaks: {
          where: {
            endTime: { not: null }, // Only completed breaks
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { user: { firstName: 'asc' } },
      ],
    });

    // Format response for CEO view
    const breaksData = attendanceRecords.flatMap((attendance) => {
      return attendance.breaks.map((breakRecord) => ({
        id: breakRecord.id,
        date: attendance.date.toISOString().split('T')[0],
        employeeId: attendance.user.id,
        employeeName: `${attendance.user.firstName} ${attendance.user.lastName}`,
        employeeEmail: attendance.user.email,
        department: attendance.user.department,
        position: attendance.user.position,
        breakStartTime: breakRecord.startTime.toISOString(),
        breakEndTime: breakRecord.endTime?.toISOString() || null,
        duration: breakRecord.duration, // in minutes
        formattedDuration: breakRecord.duration
          ? `${Math.floor(breakRecord.duration / 60)}h ${Math.floor(breakRecord.duration % 60)}m`
          : null,
        attendanceId: attendance.id,
        checkInTime: attendance.checkInTime?.toISOString() || null,
        checkOutTime: attendance.checkOutTime?.toISOString() || null,
      }));
    });

    // Summary statistics
    const summary = {
      totalBreaks: breaksData.length,
      totalBreakTime: breaksData.reduce((sum, b) => sum + (b.duration || 0), 0),
      uniqueEmployees: new Set(breaksData.map((b) => b.employeeId)).size,
      dateRange: {
        from: dateFrom || date || null,
        to: dateTo || date || null,
      },
    };

    return NextResponse.json({
      breaks: breaksData,
      summary,
      filters: {
        date,
        dateFrom,
        dateTo,
        userId,
        employeeName,
        department,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching breaks:", error);
    return NextResponse.json(
      { message: "Error fetching breaks data" },
      { status: 500 }
    );
  }
}

