import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: { userId: session.user.id, date: today },
    });

    if (!attendance) {
      return NextResponse.json({ message: "No check-in record found" }, { status: 404 });
    }

    if (attendance.checkOutTime) {
      return NextResponse.json({ message: "Already checked out" }, { status: 400 });
    }

    const now = new Date();
    const totalHours =
      (now.getTime() - new Date(attendance.checkInTime!).getTime()) /
      (1000 * 60 * 60);

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: now,
        totalHours: parseFloat(totalHours.toFixed(2)),
      },
    });

    return NextResponse.json(updatedAttendance, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error checking out" }, { status: 500 });
  }
}
