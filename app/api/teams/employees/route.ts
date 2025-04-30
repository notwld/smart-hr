import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get all employees for team management
    const employees = await prisma.user.findMany({
      where: {
        role: {
          in: ["EMPLOYEE", "MANAGER"]  // Include both employees and managers
        },
        status: "ACTIVE"  // Only include active employees
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        role: true
      },
      orderBy: [
        { role: "desc" },  // Managers first
        { lastName: "asc" }
      ]
    });

    // Return as a plain array
    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error("Error fetching employees for team management:", error);
    return NextResponse.json({ message: "Error fetching employees" }, { status: 500 });
  }
} 