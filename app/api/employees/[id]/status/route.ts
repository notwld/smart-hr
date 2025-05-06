import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { legacyRole: true }
    });

    if (!currentUser || currentUser.legacyRole !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Get the status from the request body
    const { status } = await req.json();
    
    // Validate status
    if (!status || !["ACTIVE", "SUSPENDED", "TERMINATED"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update employee status
    const updatedEmployee = await prisma.user.update({
      where: { id: params.id },
      data: { status },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
      },
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee status:", error);
    return NextResponse.json(
      { message: "Error updating employee status" },
      { status: 500 }
    );
  }
} 