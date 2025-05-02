import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; permissionId: string } }
) {
  try {
    console.log(`DELETE /api/admin/roles/${params.id}/permissions/${params.permissionId} called`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: params.id }
    });

    if (!role) {
      return NextResponse.json(
        { message: "Role not found" },
        { status: 404 }
      );
    }

    // Check if the role permission exists
    const rolePermission = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: params.id,
          permissionId: params.permissionId
        }
      }
    });

    if (!rolePermission) {
      return NextResponse.json(
        { message: "Role permission not found" },
        { status: 404 }
      );
    }

    // Delete the role permission
    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId: params.id,
          permissionId: params.permissionId
        }
      }
    });

    console.log("Deleted role permission");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role permission:", error);
    return NextResponse.json(
      { message: "Error deleting role permission" },
      { status: 500 }
    );
  }
} 