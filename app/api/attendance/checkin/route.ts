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

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: session.user.id,
        date: today,
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { message: "Already checked in today" },
        { status: 400 }
      );
    }

    try {
      const attendance = await prisma.attendance.create({
        data: {
          userId: session.user.id,
          checkInTime: new Date(),
          date: today,
          status: "PRESENT",
        },
      });

      return NextResponse.json(attendance, { status: 200 });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.error("Prisma error details:", {
          code: error.code,
          message: error.message,
          meta: error.meta,
        });
        
        if (error.code === 'P2003') {
          return NextResponse.json(
            { message: "User account not found. Please contact support." },
            { status: 400 }
          );
        }
      }
      throw error; // Re-throw other errors to be caught by outer try-catch
    }
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { message: "Error checking in. Please try again." },
      { status: 500 }
    );
  }
}
