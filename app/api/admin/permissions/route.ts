import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    console.log("GET /api/admin/permissions called");

    // Get all permissions
    const permissions = await prisma.permission.findMany({
      orderBy: [
        {
          resource: 'asc'
        },
        {
          action: 'asc'
        }
      ]
    });

    console.log(`Found ${permissions.length} permissions`);
    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Error getting permissions:", error);
    return NextResponse.json(
      { message: "Error getting permissions" },
      { status: 500 }
    );
  }
} 