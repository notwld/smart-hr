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

    // Calculate total hours and break time
    const calculateStats = (attendance: any[]) => {
      return attendance.reduce((acc, record) => {
        if (record.checkInTime && record.checkOutTime) {
          const totalHours = (record.checkOutTime.getTime() - record.checkInTime.getTime()) / (1000 * 60 * 60);
          const breakHours = (record.totalBreakTime || 0) / 60; // Convert minutes to hours
          const productiveHours = totalHours - breakHours;

          return {
            total: acc.total + totalHours,
            productive: acc.productive + productiveHours,
            break: acc.break + breakHours,
          };
        }
        return acc;
      }, { total: 0, productive: 0, break: 0 });
    };

    // Calculate today's completed hours (if checked out)
    const completedTodayStats = todayAttendance?.checkInTime && todayAttendance?.checkOutTime
      ? (() => {
          const totalHours = (todayAttendance.checkOutTime.getTime() - todayAttendance.checkInTime.getTime()) / (1000 * 60 * 60);
          const breakHours = (todayAttendance.totalBreakTime || 0) / 60;
          return {
            total: totalHours,
            productive: totalHours - breakHours,
            break: breakHours,
          };
        })()
      : { total: 0, productive: 0, break: 0 };

    // Calculate current session hours if checked in but not checked out
    const currentSessionStats = todayAttendance?.checkInTime && !todayAttendance?.checkOutTime
      ? (() => {
          const sessionTotal = (now.getTime() - todayAttendance.checkInTime.getTime()) / (1000 * 60 * 60);
          const sessionBreakHours = (todayAttendance.totalBreakTime || 0) / 60;
          // If currently on break, add current break time
          const currentBreakTime = todayAttendance.breakStartTime && !todayAttendance.breakEndTime
            ? (now.getTime() - todayAttendance.breakStartTime.getTime()) / (1000 * 60 * 60)
            : 0;
          const totalBreakHours = sessionBreakHours + currentBreakTime;
          return {
            total: sessionTotal,
            productive: sessionTotal - totalBreakHours,
            break: totalBreakHours,
          };
        })()
      : { total: 0, productive: 0, break: 0 };

    // Calculate total hours for today
    const todayStats = {
      total: completedTodayStats.total + currentSessionStats.total,
      productive: completedTodayStats.productive + currentSessionStats.productive,
      break: completedTodayStats.break + currentSessionStats.break,
    };

    // Calculate remaining hours for today (8.5 hours minimum)
    const remainingHours = Math.max(0, 8.5 - todayStats.total);

    // Calculate shift progress
    const shiftProgress = (todayStats.total / 8.5) * 100;

    // Get week and month stats
    const weekStats = calculateStats(weekAttendance);
    const monthStats = calculateStats(monthAttendance);

    const stats = {
      today: {
        total: parseFloat(todayStats.total.toFixed(2)),
        productive: parseFloat(todayStats.productive.toFixed(2)),
        break: parseFloat(todayStats.break.toFixed(2)),
        overtime: Math.max(0, todayStats.total - 8.5), // 8.5-hour shift
        remaining: parseFloat(remainingHours.toFixed(2)),
        progress: parseFloat(shiftProgress.toFixed(1)),
      },
      week: {
        total: parseFloat(weekStats.total.toFixed(2)),
        productive: parseFloat(weekStats.productive.toFixed(2)),
        break: parseFloat(weekStats.break.toFixed(2)),
        overtime: Math.max(0, weekStats.total - 42.5), // 8.5 hours * 5 days
        remaining: Math.max(0, 42.5 - weekStats.total),
      },
      month: {
        total: parseFloat(monthStats.total.toFixed(2)),
        productive: parseFloat(monthStats.productive.toFixed(2)),
        break: parseFloat(monthStats.break.toFixed(2)),
        overtime: Math.max(0, monthStats.total - 170), // 8.5 hours * 20 working days
        remaining: Math.max(0, 170 - monthStats.total),
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