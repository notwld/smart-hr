import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get today's attendance
    const todayAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: startOfDay,
      },
    });

    // Get this week's attendance
    const weekAttendance = await prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: startOfWeek,
        },
      },
    });

    // Get this month's attendance
    const monthAttendance = await prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
        },
      },
    });

    // Calculate total hours
    const calculateTotalHours = (attendance: any[]) => {
      return attendance.reduce((total, record) => {
        if (record.checkInTime && record.checkOutTime) {
          const hours = (record.checkOutTime.getTime() - record.checkInTime.getTime()) / (1000 * 60 * 60);
          return total + hours;
        }
        return total;
      }, 0);
    };

    // Calculate today's hours
    const todayHours = todayAttendance?.checkInTime && todayAttendance?.checkOutTime
      ? (todayAttendance.checkOutTime.getTime() - todayAttendance.checkInTime.getTime()) / (1000 * 60 * 60)
      : 0;

    // Calculate current session hours if checked in but not checked out
    const currentSessionHours = todayAttendance?.checkInTime && !todayAttendance?.checkOutTime
      ? (now.getTime() - todayAttendance.checkInTime.getTime()) / (1000 * 60 * 60)
      : 0;

    // Calculate remaining hours for today
    const totalHoursToday = todayHours + currentSessionHours;
    const remainingHours = Math.max(0, 9 - totalHoursToday); // 9 hours shift

    // Calculate shift progress
    const shiftProgress = (totalHoursToday / 9) * 100;

    const stats = {
      today: {
        total: totalHoursToday,
        productive: totalHoursToday * 0.8, // Assuming 80% productivity
        break: totalHoursToday * 0.2, // Assuming 20% break time
        overtime: Math.max(0, totalHoursToday - 9), // 9-hour shift
        remaining: remainingHours,
        progress: shiftProgress,
      },
      week: {
        total: calculateTotalHours(weekAttendance),
        productive: calculateTotalHours(weekAttendance) * 0.8,
        break: calculateTotalHours(weekAttendance) * 0.2,
        overtime: Math.max(0, calculateTotalHours(weekAttendance) - 45), // 9 hours * 5 days
        remaining: Math.max(0, 45 - calculateTotalHours(weekAttendance)),
      },
      month: {
        total: calculateTotalHours(monthAttendance),
        productive: calculateTotalHours(monthAttendance) * 0.8,
        break: calculateTotalHours(monthAttendance) * 0.2,
        overtime: Math.max(0, calculateTotalHours(monthAttendance) - 180), // 9 hours * 20 working days
        remaining: Math.max(0, 180 - calculateTotalHours(monthAttendance)),
      },
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    return NextResponse.json(
      { message: "Error fetching attendance statistics" },
      { status: 500 }
    );
  }
} 