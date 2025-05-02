import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    console.log("GET /api/admin/roles called");

    // Get all roles
    const roles = await prisma.role.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Found ${roles.length} roles`);
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error getting roles:", error);
    return NextResponse.json(
      { message: "Error getting roles" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log("POST /api/admin/roles called");
    
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

    // Check if a role with the same name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: data.name }
    });

    if (existingRole) {
      return NextResponse.json(
        { message: `A role with the name "${data.name}" already exists` },
        { status: 400 }
      );
    }

    // Create the role
    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description || null,
        isDefault: data.isDefault || false
      }
    });

    console.log("Created role:", role);
    return NextResponse.json(role);
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { message: "Error creating role" },
      { status: 500 }
    );
  }
} 