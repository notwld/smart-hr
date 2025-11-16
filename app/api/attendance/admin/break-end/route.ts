import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { isUserAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Check if user is admin
    const adminCheck = await isUserAdmin(req);
    if (!adminCheck.isAdmin) {
      return adminCheck.response || NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { attendanceId } = body;

    if (!attendanceId) {
      return NextResponse.json(
        { message: "Attendance ID is required" },
        { status: 400 }
      );
    }

    // Find the attendance record
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!attendance) {
      return NextResponse.json(
        { message: "Attendance record not found" },
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
        { message: "No break has been started for this attendance record" },
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
      breakDurationMinutes = breakDurationMs / (1000 * 60);
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
        message: `Break ended successfully for ${attendance.user.firstName} ${attendance.user.lastName}`,
        data: {
          ...updatedAttendance,
          currentBreak: breakToUpdate,
          breakDuration: parseFloat(breakDurationMinutes.toFixed(2))
        }
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
    console.error("Admin break end error:", error);
    return NextResponse.json(
      { message: "Error ending break. Please try again." },
      { status: 500 }
    );
  }
}

