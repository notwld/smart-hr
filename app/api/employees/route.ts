import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { isUserAdmin } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const ITEMS_PER_PAGE = 10;

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";

    // Build where clause
    const where: any = {
      legacyRole: "EMPLOYEE",
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(department && { department }),
      ...(status && { status }),
    };

    // Get total count for pagination
    const total = await prisma.user.count({ where });
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // Get employees with pagination
    const employees = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        joinDate: true,
        phone: true,
        status: true,
        legacyRole: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true
              }
            }
          }
        },
        pfp: true,
      },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
    });

    // Get unique departments for filter
    const departments = await prisma.user.findMany({
      where: { legacyRole: "EMPLOYEE" },
      select: { department: true },
      distinct: ["department"],
    });

    return NextResponse.json({
      employees,
      totalPages,
      departments: departments.map((d) => d.department),
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  console.log("Received POST request to /api/employees");
  try {
    // Check if user is admin
    const adminCheck = await isUserAdmin(req);
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const data = await req.json();
    console.log("Received data:", data);

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
      emergencyContact,
      education,
      experience,
      documents,
      bankDetails,
      image,
    } = data;

    // Validate required fields
    if (!username || !firstName || !lastName || !email || !cnic || !password || 
        !salary || !address || !department || !position || !joinDate) {
      console.log("Missing required fields");
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate salary is a number
    if (typeof salary !== 'number' || salary < 0) {
      console.log("Invalid salary value");
      return NextResponse.json(
        { message: "Invalid salary value" },
        { status: 400 }
      );
    }

    console.log("Creating employee with data:", {
      username,
      firstName,
      lastName,
      email,
      department,
      position,
    });

    // Hash password
    const hashedPassword = await hash(password, 12);

    try {
      // Create employee with all related data
      const employee = await prisma.user.create({
        data: {
          username,
          firstName,
          lastName,
          email,
          cnic,
          password: hashedPassword,
          salary: Number(salary),
          address,
          department,
          position,
          joinDate: new Date(joinDate),
          phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          maritalStatus,
          legacyRole: "EMPLOYEE",
          emergencyContact: emergencyContact ? {
            create: emergencyContact,
          } : undefined,
          education: education ? {
            create: education.map((edu: any) => ({
              ...edu,
              startDate: new Date(edu.startDate),
              endDate: edu.endDate ? new Date(edu.endDate) : undefined,
            })),
          } : undefined,
          experience: experience ? {
            create: experience.map((exp: any) => ({
              ...exp,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : undefined,
            })),
          } : undefined,
          documents: documents ? {
            create: documents,
          } : undefined,
          bankDetails: bankDetails ? {
            create: bankDetails,
          } : undefined,
          image: image ? image : undefined,
        },
        include: {
          emergencyContact: true,
          education: true,
          experience: true,
          documents: true,
          bankDetails: true,
        },
      });

      console.log("Employee created successfully:", employee);
      return NextResponse.json(employee, { status: 201 });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // Handle uniqueness violations
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[];
          if (target?.includes('username')) {
            return NextResponse.json(
              { message: "Username already exists" },
              { status: 400 }
            );
          }
          if (target?.includes('email')) {
            return NextResponse.json(
              { message: "Email already exists" },
              { status: 400 }
            );
          }
          if (target?.includes('cnic')) {
            return NextResponse.json(
              { message: "CNIC already exists" },
              { status: 400 }
            );
          }
          return NextResponse.json(
            { message: `Unique constraint failed on: ${target?.join(', ')}` },
            { status: 400 }
          );
        }
      }
      throw error; // Re-throw for general error handling
    }
  } catch (error: any) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { message: "Error creating employee" },
      { status: 500 }
    );
  }
} 