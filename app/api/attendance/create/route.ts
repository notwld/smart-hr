import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isUserAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminCheck = await isUserAdmin(req);
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const body = await req.json();
    const { userId, date, checkInTime, checkOutTime, status = "PRESENT" } = body;

    // Validate required fields
    if (!userId || !date) {
      return NextResponse.json(
        { message: "User ID and date are required" },
        { status: 400 }
      );
    }

    // Validate that the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Parse date and ensure it's at the start of the day
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists for this date
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: attendanceDate,
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { message: "Attendance record already exists for this date" },
        { status: 400 }
      );
    }

    // Calculate total hours if both check-in and check-out are provided
    let totalHours = null;
    let checkIn = null;
    let checkOut = null;

    if (checkInTime) {
      checkIn = new Date(`${date}T${checkInTime}`);
    }

    if (checkOutTime) {
      checkOut = new Date(`${date}T${checkOutTime}`);
    }

    if (checkIn && checkOut) {
      totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: attendanceDate,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        totalHours,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      { message: "Error creating attendance record" },
      { status: 500 }
    );
  }
}

// Get all users for the dropdown in the frontend
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminCheck = await isUserAdmin(req);
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
} 