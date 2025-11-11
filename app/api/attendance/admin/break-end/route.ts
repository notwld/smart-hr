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

    if (!attendance.breakStartTime) {
      return NextResponse.json(
        { message: "No break has been started for this attendance record" },
        { status: 400 }
      );
    }

    if (attendance.breakEndTime) {
      return NextResponse.json(
        { message: "Break has already ended" },
        { status: 400 }
      );
    }

    const now = new Date();
    const breakDurationMs = now.getTime() - attendance.breakStartTime.getTime();
    const breakDurationMinutes = breakDurationMs / (1000 * 60); // Convert to minutes

    // Calculate new total break time
    const currentTotalBreakTime = attendance.totalBreakTime || 0;
    const newTotalBreakTime = currentTotalBreakTime + breakDurationMinutes;

    try {
      const updatedAttendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          breakEndTime: now,
          totalBreakTime: parseFloat(newTotalBreakTime.toFixed(2)),
        },
      });

      return NextResponse.json({
        message: `Break ended successfully for ${attendance.user.firstName} ${attendance.user.lastName}`,
        data: {
          ...updatedAttendance,
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

