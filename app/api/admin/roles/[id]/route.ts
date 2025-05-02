import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/admin/roles/${params.id} called`);
    
    // Get role by ID
    const role = await prisma.role.findUnique({
      where: { id: params.id }
    });

    if (!role) {
      return NextResponse.json(
        { message: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error getting role:", error);
    return NextResponse.json(
      { message: "Error getting role" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`PUT /api/admin/roles/${params.id} called`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { message: "Role name is required" },
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

    // Check if another role with the same name exists
    if (data.name !== role.name) {
      const existingRole = await prisma.role.findUnique({
        where: { name: data.name }
      });

      if (existingRole) {
        return NextResponse.json(
          { message: `A role with the name "${data.name}" already exists` },
          { status: 400 }
        );
      }
    }

    // Update the role
    const updatedRole = await prisma.role.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        isDefault: data.isDefault
      }
    });

    console.log("Updated role:", updatedRole);
    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { message: "Error updating role" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`DELETE /api/admin/roles/${params.id} called`);
    
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

    // Check if this is the only default role
    if (role.isDefault) {
      const defaultRoles = await prisma.role.findMany({
        where: { isDefault: true }
      });

      if (defaultRoles.length === 1 && defaultRoles[0].id === params.id) {
        return NextResponse.json(
          { message: "Cannot delete the only default role" },
          { status: 400 }
        );
      }
    }

    // Delete the role
    await prisma.role.delete({
      where: { id: params.id }
    });

    console.log("Deleted role");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    
    // Check for foreign key constraint errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { message: "Cannot delete this role because it is still assigned to users" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error deleting role" },
      { status: 500 }
    );
  }
} 