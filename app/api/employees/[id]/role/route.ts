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

    // Check if user has permission to update roles
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const hasPermission = currentUser?.legacyRole === "ADMIN" || 
      currentUser?.userRoles?.some((ur: any) => 
        ur.role.permissions?.some((rp: any) => 
          rp.permission.name === "users.edit" || 
          rp.permission.name === "roles.assign"
        )
      );

    if (!hasPermission) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get the roleId from the request body
    const { roleId, role: legacyRole } = await req.json();
    
    // Handle both new and legacy role updates
    if (roleId) {
      // New role system
      // Verify the role exists
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      });

      if (!role) {
        return NextResponse.json(
          { message: "Role not found" },
          { status: 404 }
        );
      }

      // Remove existing role assignments for this user
      await prisma.userRole.deleteMany({
        where: { userId: params.id }
      });

      // Assign the new role
      await prisma.userRole.create({
        data: {
          userId: params.id,
          roleId: roleId
        }
      });

      // Update legacy role field for backward compatibility
      let updatedLegacyRole: "ADMIN" | "MANAGER" | "EMPLOYEE" = "EMPLOYEE";
      if (role.name === "Admin") {
        updatedLegacyRole = "ADMIN";
      } else if (role.name === "Team Leader" || role.name === "Manager") {
        updatedLegacyRole = "MANAGER";
      }

      await prisma.user.update({
        where: { id: params.id },
        data: { legacyRole: updatedLegacyRole }
      });

      return NextResponse.json({ 
        message: "Role updated successfully",
        role: role.name 
      });

    } else if (legacyRole) {
      // Legacy role system support
      // Validate role
      if (!["ADMIN", "MANAGER", "EMPLOYEE"].includes(legacyRole)) {
        return NextResponse.json(
          { message: "Invalid role value" },
          { status: 400 }
        );
      }

      // Update employee role
      const updatedEmployee = await prisma.user.update({
        where: { id: params.id },
        data: { legacyRole },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          legacyRole: true,
        },
      });

      return NextResponse.json(updatedEmployee);
    } else {
      return NextResponse.json(
        { message: "Either roleId or role is required" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error updating employee role:", error);
    return NextResponse.json(
      { message: "Error updating employee role" },
      { status: 500 }
    );
  }
} 