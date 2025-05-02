import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { startDate, endDate, type, reason } = data;

    // Validate required fields
    if (!startDate || !endDate || !type || !reason) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the user's team and team leader
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        teams: {
          include: {
            team: {
              include: {
                leader: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has a team leader
    const teamMembership = user.teams.length > 0 ? user.teams[0] : null;
    const teamLeader = teamMembership?.team?.leader;
    
    if (!teamLeader) {
      return NextResponse.json(
        { message: "You need to be part of a team with a team leader to apply for leave" },
        { status: 400 }
      );
    }

    // Get an admin for approval (first admin found)
    const admin = await prisma.user.findFirst({
      where: { legacyRole: "ADMIN" },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "No admin found in the system to approve leave requests" },
        { status: 400 }
      );
    }

    // Create leave request with both team leader and admin approval flow
    const leave = await prisma.leave.create({
      data: {
        userId: session.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason,
        managerId: teamLeader.id,
        adminId: admin.id,
        status: "PENDING",
        managerStatus: "PENDING",
        adminStatus: "PENDING",
      },
    });

    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { message: "Error creating leave request" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    // Build where clause
    const where: any = {
      OR: [
        { userId: session.user.id },
        { managerId: session.user.id },
        { adminId: session.user.id },
      ],
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            department: true,
          },
        },
        manager: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        admin: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leaves);
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json(
      { message: "Error fetching leaves" },
      { status: 500 }
    );
  }
} 