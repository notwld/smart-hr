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

    // Get the roleId from the request body
    const { roleId } = await req.json();
    
    // Validate roleId
    if (!roleId) {
      return NextResponse.json(
        { message: "Role ID is required" },
        { status: 400 }
      );
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return NextResponse.json(
        { message: "Role not found" },
        { status: 404 }
      );
    }

    // Check if user already has this role
    const existingUserRole = await prisma.userRole.findFirst({
      where: {
        userId: params.id,
        roleId
      }
    });

    if (existingUserRole) {
      return NextResponse.json(
        { message: "User already has this role" },
        { status: 400 }
      );
    }

    // Add the new role to the user
    await prisma.userRole.create({
      data: {
        userId: params.id,
        roleId
      }
    });

    // Fetch updated user with roles
    const updatedEmployee = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        legacyRole: true,
        userRoles: {
          include: {
            role: true
          }
        }
      },
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee system role:", error);
    return NextResponse.json(
      { message: "Error updating employee system role" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Get the roleId from the request body
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get('roleId');
    
    // Validate roleId
    if (!roleId) {
      return NextResponse.json(
        { message: "Role ID is required" },
        { status: 400 }
      );
    }

    // Check if user has this role
    const existingUserRole = await prisma.userRole.findFirst({
      where: {
        userId: params.id,
        roleId
      }
    });

    if (!existingUserRole) {
      return NextResponse.json(
        { message: "User does not have this role" },
        { status: 400 }
      );
    }

    // Remove the role from the user
    await prisma.userRole.delete({
      where: {
        id: existingUserRole.id
      }
    });

    // Fetch updated user with roles
    const updatedEmployee = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        legacyRole: true,
        userRoles: {
          include: {
            role: true
          }
        }
      },
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Error removing employee system role:", error);
    return NextResponse.json(
      { message: "Error removing employee system role" },
      { status: 500 }
    );
  }
} 