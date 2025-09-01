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

    if (!attendance.checkInTime) {
      return NextResponse.json(
        { message: "No check-in time found. Please check in first." },
        { status: 400 }
      );
    }

    if (attendance.checkOutTime) {
      return NextResponse.json(
        { message: "Cannot start break after check-out" },
        { status: 400 }
      );
    }

    if (attendance.breakStartTime && !attendance.breakEndTime) {
      return NextResponse.json(
        { message: "A break is already in progress" },
        { status: 400 }
      );
    }

    const now = new Date();

    try {
      const updatedAttendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          breakStartTime: now,
          breakEndTime: null, // Clear any previous break end time
        },
      });

      return NextResponse.json({
        message: "Break started successfully",
        data: updatedAttendance
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
    console.error("Break start error:", error);
    return NextResponse.json(
      { message: "Error starting break. Please try again." },
      { status: 500 }
    );
  }
}
