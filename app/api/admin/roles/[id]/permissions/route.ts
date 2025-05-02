import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/admin/roles/${params.id}/permissions called`);
    
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

    // Get role permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: params.id },
      include: {
        permission: true
      }
    });

    console.log(`Found ${rolePermissions.length} permissions for role ${role.name}`);
    return NextResponse.json(rolePermissions);
  } catch (error) {
    console.error("Error getting role permissions:", error);
    return NextResponse.json(
      { message: "Error getting role permissions" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`POST /api/admin/roles/${params.id}/permissions called`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.permissionId) {
      return NextResponse.json(
        { message: "Permission ID is required" },
        { status: 400 }
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

    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: data.permissionId }
    });

    if (!permission) {
      return NextResponse.json(
        { message: "Permission not found" },
        { status: 404 }
      );
    }

    // Check if the role permission already exists
    const existingRolePermission = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: params.id,
          permissionId: data.permissionId
        }
      }
    });

    if (existingRolePermission) {
      return NextResponse.json(existingRolePermission);
    }

    // Create the role permission
    const rolePermission = await prisma.rolePermission.create({
      data: {
        roleId: params.id,
        permissionId: data.permissionId
      }
    });

    console.log("Created role permission:", rolePermission);
    return NextResponse.json(rolePermission);
  } catch (error) {
    console.error("Error creating role permission:", error);
    return NextResponse.json(
      { message: "Error creating role permission" },
      { status: 500 }
    );
  }
} 