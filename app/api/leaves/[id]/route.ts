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

    if (user.role === "MANAGER" && leave.managerId === user.id) {
      // Manager approval
      updateData = {
        managerStatus: status,
        managerComment: comment,
      };

      // If manager approves, set admin status to pending
      if (status === "APPROVED") {
        updateData.adminStatus = "PENDING";
      } else if (status === "REJECTED") {
        updateData.status = "REJECTED";
      }
    } else if (user.role === "ADMIN") {
      // Admin approval
      updateData = {
        adminStatus: status,
        adminComment: comment,
      };

      // If admin approves, set final status to approved
      if (status === "APPROVED") {
        updateData.status = "APPROVED";
      } else if (status === "REJECTED") {
        updateData.status = "REJECTED";
      }
    } else {
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