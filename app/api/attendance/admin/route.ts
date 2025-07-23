import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isUserAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminCheck = await isUserAdmin(req);
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const search = url.searchParams.get("search") || "";
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const department = url.searchParams.get("department");
    const status = url.searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};

    // Date range filter
    if (dateFrom || dateTo) {
      whereConditions.date = {};
      if (dateFrom) {
        whereConditions.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        whereConditions.date.lte = endDate;
      }
    }

    // Status filter
    if (status && status !== "all") {
      whereConditions.status = status;
    }

    // User-based filters (search and department)
    const userConditions: any = {};
    
    if (search) {
      userConditions.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department && department !== "all") {
      userConditions.department = { contains: department, mode: 'insensitive' };
    }

    if (Object.keys(userConditions).length > 0) {
      whereConditions.user = userConditions;
    }

    // Get attendance records with user data
    const [attendanceRecords, totalCount] = await Promise.all([
      prisma.attendance.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
              position: true,
              pfp: true,
            },
          },
        },
        orderBy: [
          { date: 'desc' },
          { checkInTime: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where: whereConditions }),
    ]);

    // Get unique departments for filter dropdown
    const departments = await prisma.user.findMany({
      select: { department: true },
      distinct: ['department'],
      orderBy: { department: 'asc' },
    });

    const uniqueDepartments = departments
      .map(d => d.department)
      .filter(dept => dept && dept.trim() !== "");

    return NextResponse.json({
      attendance: attendanceRecords,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      departments: uniqueDepartments,
    });

  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json(
      { message: "Error fetching attendance data" },
      { status: 500 }
    );
  }
} 