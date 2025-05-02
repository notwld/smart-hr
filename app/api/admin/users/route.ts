import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    console.log("GET /api/admin/users called");

    // Get all users with their roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        legacyRole: true,
        status: true,
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    console.log(`Found ${users.length} users`);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    return NextResponse.json(
      { message: "Error getting users" },
      { status: 500 }
    );
  }
} 