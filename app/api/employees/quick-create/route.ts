import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { sendCredentialsEmail } from "@/lib/nodemailer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, email, password, username, department, position } = body || {};

    if (!firstName || !lastName || !email || !password || !username || !department || !position) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Basic duplicates check
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) {
      return NextResponse.json({ error: "Email or username already exists" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    // Create minimal user with sensible defaults to satisfy schema
    const user = await prisma.user.create({
      data: {
        username,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        // quick-create placeholders
        cnic: `TEMP-${Date.now()}`,
        salary: 0,
        address: "",
        department,
        position,
        joinDate: new Date(),
        status: "ACTIVE",
      },
    });

    // Assign default role if exists
    const employeeRole = await prisma.role.findFirst({ where: { name: "Employee" } });
    if (employeeRole) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: employeeRole.id } });
    }

    try {
      await sendCredentialsEmail({
        to: email,
        firstName,
        lastName,
        username,
        password,
      });
    } catch (e) {
      // Don't fail creation on email error
      console.error("Failed to send credentials email:", e);
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error("Quick-create employee error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


