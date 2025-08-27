import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for creating tickets
const createTicketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["TECHNICAL", "HR", "LEAVE", "PAYROLL", "EQUIPMENT", "ACCESS", "TRAINING", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  dueDate: z.string().optional().refine((date) => {
    if (!date) return true;
    // Accept both YYYY-MM-DD format and ISO datetime format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return dateRegex.test(date) || dateTimeRegex.test(date);
  }, {
    message: "Invalid date format. Please provide date in YYYY-MM-DD format."
  }),
  tags: z.array(z.string()).optional(),
  assignedToId: z.string().optional(),
});

// Generate ticket number
function generateTicketNumber(): string {
  const prefix = "TKT";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

// GET /api/tickets - List tickets with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "all";
    const priority = searchParams.get("priority") || "all";
    const category = searchParams.get("category") || "all";
    const assignedTo = searchParams.get("assignedTo") || "all";
    const createdBy = searchParams.get("createdBy") || "all";
    const search = searchParams.get("search") || "";

    // Build where clause
    const where: any = {};

    if (status !== "all") {
      where.status = status;
    }

    if (priority !== "all") {
      where.priority = priority;
    }

    if (category !== "all") {
      where.category = category;
    }

    if (assignedTo !== "all") {
      where.assignedToId = assignedTo;
    }

    if (createdBy !== "all") {
      where.createdById = createdBy;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { createdBy: { firstName: { contains: search, mode: "insensitive" } } },
        { createdBy: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Handle special case for current user's tickets
    if (createdBy === "current") {
      where.createdById = session.user.id;
    }

    if (assignedTo === "current") {
      where.assignedToId = session.user.id;
    }

    // If user is not admin and no specific filters were applied, show their own tickets or tickets assigned to them
    const userRole = session.user.role;
    if (userRole !== "ADMIN" && createdBy !== "current" && assignedTo !== "current") {
      where.OR = [
        { createdById: session.user.id },
        { assignedToId: session.user.id },
        ...(where.OR || [])
      ];
    }

    const [tickets, totalCount] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
              pfp: true,
            }
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
              pfp: true,
            }
          },
          resolvedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          comments: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              author: {
                select: {
                  firstName: true,
                  lastName: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 1, // Only get the latest comment for preview
          },
          _count: {
            select: {
              comments: true,
              attachments: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    // Get filter options
    const [categories, priorities, statuses, assignees] = await Promise.all([
      prisma.ticket.findMany({
        select: { category: true },
        distinct: ['category'],
      }),
      prisma.ticket.findMany({
        select: { priority: true },
        distinct: ['priority'],
      }),
      prisma.ticket.findMany({
        select: { status: true },
        distinct: ['status'],
      }),
      prisma.user.findMany({
        where: {
          AND: [
            // Exclude admins - they shouldn't be assigned tickets, they assign them
            {
              NOT: {
                OR: [
                  { legacyRole: "ADMIN" },
                  { userRoles: { some: { role: { name: "Admin" } } } }
                ]
              }
            },
            // Only include users who are employees (have Employee role or legacy role)
            {
              OR: [
                { legacyRole: "EMPLOYEE" },
                { userRoles: { some: { role: { name: "Employee" } } } }
              ]
            }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
        },
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' }
        ]
      })
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      filters: {
        categories: categories.map(c => c.category),
        priorities: priorities.map(p => p.priority),
        statuses: statuses.map(s => s.status),
        assignees,
      },
      currentUserId: session.user.id
    });

  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTicketSchema.parse(body);

    const ticketNumber = generateTicketNumber();

    // Create ticket with activity log
    const ticket = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.ticket.create({
        data: {
          ticketNumber,
          title: validatedData.title,
          description: validatedData.description,
          category: validatedData.category,
          priority: validatedData.priority,
          createdById: session.user.id,
          assignedToId: validatedData.assignedToId || null,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate + 'T23:59:59Z') : null,
          tags: validatedData.tags || [],
        },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
            }
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
            }
          }
        }
      });

      // Create initial activity log
      await tx.ticketActivity.create({
        data: {
          ticketId: newTicket.id,
          userId: session.user.id,
          action: "CREATED",
          description: `Ticket created`,
          metadata: {
            category: validatedData.category,
            priority: validatedData.priority,
          }
        }
      });

      // If assigned to someone, create assignment activity
      if (validatedData.assignedToId) {
        await tx.ticketActivity.create({
          data: {
            ticketId: newTicket.id,
            userId: session.user.id,
            action: "ASSIGNED",
            description: `Ticket assigned to ${newTicket.assignedTo?.firstName} ${newTicket.assignedTo?.lastName}`,
            newValue: validatedData.assignedToId,
          }
        });
      }

      return newTicket;
    });

    return NextResponse.json(ticket, { status: 201 });

  } catch (error) {
    console.error("Error creating ticket:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
