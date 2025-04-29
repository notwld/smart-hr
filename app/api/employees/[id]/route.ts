import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const employee = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        emergencyContact: true,
        education: true,
        experience: true,
        documents: true,
        bankDetails: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { message: "Error fetching employee" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const {
      username,
      firstName,
      lastName,
      email,
      cnic,
      password,
      salary,
      address,
      department,
      position,
      joinDate,
      phone,
      dateOfBirth,
      gender,
      maritalStatus,
      image,
      emergencyContact,
      education,
      experience,
      documents,
      bankDetails,
    } = data;

    // Validate required fields
    if (!username || !firstName || !lastName || !email || !cnic || 
        !salary || !address || !department || !position || !joinDate) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate salary is a number
    if (typeof salary !== 'number' || salary < 0) {
      return NextResponse.json(
        { message: "Invalid salary value" },
        { status: 400 }
      );
    }

    // Hash password if provided
    const hashedPassword = password ? await hash(password, 12) : undefined;

    // Update employee with all related data
    const employee = await prisma.user.update({
      where: { id: params.id },
      data: {
        username,
        firstName,
        lastName,
        email,
        cnic,
        ...(hashedPassword && { password: hashedPassword }),
        salary: Number(salary),
        address,
        department,
        position,
        joinDate: new Date(joinDate),
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        maritalStatus,
        image,
        emergencyContact: emergencyContact ? {
          upsert: {
            create: emergencyContact,
            update: emergencyContact,
          },
        } : undefined,
        education: education ? {
          deleteMany: {},
          create: education.map((edu: any) => ({
            ...edu,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        } : undefined,
        experience: experience ? {
          deleteMany: {},
          create: experience.map((exp: any) => ({
            ...exp,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        } : undefined,
        documents: documents ? {
          deleteMany: {},
          create: documents,
        } : undefined,
        bankDetails: bankDetails ? {
          upsert: {
            create: bankDetails,
            update: bankDetails,
          },
        } : undefined,
      },
      include: {
        emergencyContact: true,
        education: true,
        experience: true,
        documents: true,
        bankDetails: true,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { message: "Error updating employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Delete all related records first
    await prisma.emergencyContact.deleteMany({
      where: { userId: params.id },
    });
    await prisma.education.deleteMany({
      where: { userId: params.id },
    });
    await prisma.experience.deleteMany({
      where: { userId: params.id },
    });
    await prisma.document.deleteMany({
      where: { userId: params.id },
    });
    await prisma.bankDetails.deleteMany({
      where: { userId: params.id },
    });

    // Delete the employee
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { message: "Error deleting employee" },
      { status: 500 }
    );
  }
} 