import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`PUT /api/admin/users/${params.id}/roles called`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.roleIds || !Array.isArray(data.roleIds)) {
      return NextResponse.json(
        { message: "Role IDs must be an array" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        userRoles: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify all roles exist
    const roles = await prisma.role.findMany({
      where: {
        id: { in: data.roleIds }
      }
    });

    if (roles.length !== data.roleIds.length) {
      return NextResponse.json(
        { message: "One or more roles do not exist" },
        { status: 400 }
      );
    }

    // Get current role IDs
    const currentRoleIds = user.userRoles.map(ur => ur.roleId);
    
    // Determine roles to add and remove
    const rolesToAdd = data.roleIds.filter(id => !currentRoleIds.includes(id));
    const rolesToRemove = currentRoleIds.filter(id => !data.roleIds.includes(id));

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Remove roles
      if (rolesToRemove.length > 0) {
        await tx.userRole.deleteMany({
          where: {
            userId: params.id,
            roleId: { in: rolesToRemove }
          }
        });
      }

      // Add roles
      for (const roleId of rolesToAdd) {
        await tx.userRole.create({
          data: {
            userId: params.id,
            roleId
          }
        });
      }

      // Return updated user with roles
      return tx.user.findUnique({
        where: { id: params.id },
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });
    });

    console.log("Updated user roles");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating user roles:", error);
    return NextResponse.json(
      { message: "Error updating user roles" },
      { status: 500 }
    );
  }
} 