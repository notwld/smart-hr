import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Validate that the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      console.error(`User not found in database: ${session.user.id}`);
      return NextResponse.json(
        { message: "User account not found. Please contact support." },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: session.user.id,
        date: today,
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { message: "No check-in record found for today. Please check in first." },
        { status: 404 }
      );
    }

    // Find active break using new Break model
    const activeBreak = await prisma.break.findFirst({
      where: {
        attendanceId: attendance.id,
        endTime: null,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    // Fallback to old fields for backward compatibility
    if (!activeBreak && !attendance.breakStartTime) {
      return NextResponse.json(
        { message: "No break has been started" },
        { status: 400 }
      );
    }

    if (!activeBreak && attendance.breakEndTime) {
      return NextResponse.json(
        { message: "Break has already ended" },
        { status: 400 }
      );
    }

    const now = new Date();
    let breakDurationMinutes = 0;
    let breakToUpdate = activeBreak;

    if (activeBreak) {
      // Use new Break model
      const breakDurationMs = now.getTime() - activeBreak.startTime.getTime();
      breakDurationMinutes = breakDurationMs / (1000 * 60); // Convert to minutes
    } else if (attendance.breakStartTime) {
      // Fallback to old fields
      const breakDurationMs = now.getTime() - attendance.breakStartTime.getTime();
      breakDurationMinutes = breakDurationMs / (1000 * 60);
    }

    try {
      // Update or create break record
      if (activeBreak) {
        breakToUpdate = await prisma.break.update({
          where: { id: activeBreak.id },
          data: {
            endTime: now,
            duration: parseFloat(breakDurationMinutes.toFixed(2)),
          },
        });
      } else if (attendance.breakStartTime) {
        // Create break record from old data for migration
        breakToUpdate = await prisma.break.create({
          data: {
            attendanceId: attendance.id,
            startTime: attendance.breakStartTime,
            endTime: now,
            duration: parseFloat(breakDurationMinutes.toFixed(2)),
          },
        });
      }

      // Recalculate total break time from all breaks
      const allBreaks = await prisma.break.findMany({
        where: {
          attendanceId: attendance.id,
          endTime: { not: null }, // Only count completed breaks
        },
      });

      const totalBreakTime = allBreaks.reduce((sum, b) => {
        return sum + (b.duration || 0);
      }, 0);

      // Update attendance record
      const updatedAttendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          breakStartTime: null, // Clear break start time when break ends
          breakEndTime: now, // Update old field for backward compatibility
          totalBreakTime: parseFloat(totalBreakTime.toFixed(2)),
        },
        include: {
          breaks: {
            orderBy: {
              startTime: 'desc',
            },
          },
        },
      });

      return NextResponse.json({
        message: "Break ended successfully",
        data: {
          ...updatedAttendance,
          currentBreak: breakToUpdate,
          breakDuration: parseFloat(breakDurationMinutes.toFixed(2)),
        },
      }, { status: 200 });

    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.error("Prisma error details:", {
          code: error.code,
          message: error.message,
          meta: error.meta,
        });

        if (error.code === 'P2025') {
          return NextResponse.json(
            { message: "Attendance record not found" },
            { status: 404 }
          );
        }
      }
      throw error; // Re-throw other errors to be caught by outer try-catch
    }
  } catch (error) {
    console.error("Break end error:", error);
    return NextResponse.json(
      { message: "Error ending break. Please try again." },
      { status: 500 }
    );
  }
}
