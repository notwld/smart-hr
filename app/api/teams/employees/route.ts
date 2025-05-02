import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Get all employees for team management
    const employees = await prisma.user.findMany({
      where: {
        legacyRole: "EMPLOYEE",
        status: "ACTIVE"  // Only include active employees
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        legacyRole: true
      },
      orderBy: [
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