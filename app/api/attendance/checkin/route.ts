import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
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
    console.error("Check-in error:", error);
    return NextResponse.json(
      { message: "Error checking in" },
      { status: 500 }
    );
  }
}
