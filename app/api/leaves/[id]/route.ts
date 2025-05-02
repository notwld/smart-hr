import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { status, comment } = data;

    // Get the leave request
    const leave = await prisma.leave.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!leave) {
      return NextResponse.json(
        { message: "Leave request not found" },
        { status: 404 }
      );
    }

    // Check if user is manager or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    let updateData: any = {};

    // Handle team leader approval
    if (leave.managerId === user.id && leave.managerStatus === "PENDING") {
      updateData = {
        managerStatus: status,
        managerComment: comment,
      };

      // If team leader rejects, the overall status becomes rejected
      if (status === "REJECTED") {
        updateData.status = "REJECTED";
        updateData.adminStatus = "REJECTED"; // Auto-reject for admin as well
      }

      // If team leader approves, we keep overall status as pending and wait for admin
    } 
    // Handle admin approval
    else if (user.legacyRole === "ADMIN" && leave.adminId === user.id) {
      // Check if team leader has already approved this leave
      if (leave.managerStatus !== "APPROVED" && status === "APPROVED") {
        return NextResponse.json(
          { message: "Team leader approval is required before admin can approve" },
          { status: 400 }
        );
      }

      // Check if this leave is still pending admin approval
      if (leave.adminStatus !== "PENDING") {
        return NextResponse.json(
          { message: "This leave request has already been processed by you" },
          { status: 400 }
        );
      }

      updateData = {
        adminStatus: status,
        adminComment: comment,
      };

      // If admin approves and team leader has already approved, the overall status becomes approved
      if (status === "APPROVED" && leave.managerStatus === "APPROVED") {
        updateData.status = "APPROVED";
      } 
      // If admin rejects, the overall status becomes rejected
      else if (status === "REJECTED") {
        updateData.status = "REJECTED";
      }
    } 
    else {
      return NextResponse.json(
        { message: "Unauthorized to approve this request" },
        { status: 403 }
      );
    }

    // Update leave request
    const updatedLeave = await prisma.leave.update({
      where: { id: params.id },
      data: updateData,
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
    });

    return NextResponse.json(updatedLeave);
  } catch (error) {
    console.error("Error updating leave request:", error);
    return NextResponse.json(
      { message: "Error updating leave request" },
      { status: 500 }
    );
  }
} 