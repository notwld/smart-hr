import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isUserAdmin } from "@/lib/auth";

// Debug: Ensure prisma is imported correctly
console.log("Hosting API - Prisma client loaded:", !!prisma);
console.log("Prisma client properties:", Object.keys(prisma));
console.log("Has hosting property:", 'hosting' in prisma);

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
    const status = searchParams.get("status") || "";
    const durationType = searchParams.get("durationType") || "";

    // Build where clause
    const where: any = {
      ...(search && {
        OR: [
          { domain: { contains: search, mode: "insensitive" } },
          { client: { 
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } }
            ]
          } },
        ],
      }),
      ...(durationType && { durationType }),
    };

    // Add status filter (active, expired, expiring soon)
    if (status === "expired") {
      where.expiryDate = { lt: new Date() };
    } else if (status === "expiring") {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      where.expiryDate = { 
        gte: new Date(),
        lte: nextWeek 
      };
    } else if (status === "active") {
      where.expiryDate = { gte: new Date() };
    }

    // Get total count for pagination
    const total = await (prisma as any).hosting.count({ where });
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // Get hostings with pagination
    const hostings = await (prisma as any).hosting.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        }
      },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
    });

    // Get unique duration types for filter
    const durationTypes = await (prisma as any).hosting.findMany({
      select: { durationType: true },
      distinct: ["durationType"],
    });

    return NextResponse.json({
      hostings,
      totalPages,
      durationTypes: durationTypes.map((d) => d.durationType),
    });
  } catch (error) {
    console.error("Error fetching hostings:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log("POST /api/hosting - Starting");
    console.log("Prisma instance:", typeof prisma, !!prisma);
    
    // Check if user is admin
    const adminCheck = await isUserAdmin(req);
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const data = await req.json();
    console.log("Request data:", data);
    
    const {
      clientId,
      domain,
      cost,
      startDate,
      expiryDate,
      durationType,
      notes,
    } = data;

    // Validate required fields
    if (!clientId || !domain || !cost || !startDate || !expiryDate || !durationType) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate cost is a number
    if (typeof cost !== 'number' || cost < 0) {
      return NextResponse.json(
        { message: "Invalid cost value" },
        { status: 400 }
      );
    }

    // Check if client exists
    const client = await prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Check if domain already exists
    console.log("Checking for existing domain:", domain);
    const existingHosting = await (prisma as any).hosting.findFirst({
      where: { domain }
    });
    console.log("Existing hosting check result:", existingHosting);

    if (existingHosting) {
      return NextResponse.json(
        { message: "Domain already exists" },
        { status: 400 }
      );
    }

    // Create hosting
    const hosting = await (prisma as any).hosting.create({
      data: {
        clientId,
        domain,
        cost: Number(cost),
        startDate: new Date(startDate),
        expiryDate: new Date(expiryDate),
        durationType,
        notes,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        }
      }
    });

    return NextResponse.json({
      message: "Hosting created successfully",
      hosting,
    });
  } catch (error) {
    console.error("Error creating hosting:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 