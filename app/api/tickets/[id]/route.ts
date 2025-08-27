import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTicketSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  category: z.enum(["TECHNICAL", "HR", "LEAVE", "PAYROLL", "EQUIPMENT", "ACCESS", "TRAINING", "OTHER"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED", "CANCELLED"]).optional(),
  assignedToId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/tickets/[id] - Get specific ticket
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
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
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                pfp: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                pfp: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    // Check permissions - users can only view their own tickets or tickets assigned to them, unless they're admin
    const userRole = session.user.role;
    if (userRole !== "ADMIN" && 
        ticket.createdById !== session.user.id && 
        ticket.assignedToId !== session.user.id) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(ticket);

  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/tickets/[id] - Update ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = updateTicketSchema.parse(body);

    // Get current ticket to check permissions and track changes
    const currentTicket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        assignedTo: { select: { firstName: true, lastName: true } }
      }
    });

    if (!currentTicket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    // Check permissions
    const userRole = session.user.role;
    const canUpdate = userRole === "ADMIN" || 
                     currentTicket.createdById === session.user.id || 
                     currentTicket.assignedToId === session.user.id;

    if (!canUpdate) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Track changes for activity log
    const changes: Array<{action: string, description: string, oldValue?: string, newValue?: string}> = [];

    if (validatedData.status && validatedData.status !== currentTicket.status) {
      changes.push({
        action: "STATUS_CHANGED",
        description: `Status changed from ${currentTicket.status} to ${validatedData.status}`,
        oldValue: currentTicket.status,
        newValue: validatedData.status
      });
    }

    if (validatedData.priority && validatedData.priority !== currentTicket.priority) {
      changes.push({
        action: "PRIORITY_CHANGED",
        description: `Priority changed from ${currentTicket.priority} to ${validatedData.priority}`,
        oldValue: currentTicket.priority,
        newValue: validatedData.priority
      });
    }

    if (validatedData.assignedToId !== undefined && validatedData.assignedToId !== currentTicket.assignedToId) {
      const newAssignee = validatedData.assignedToId ? 
        await prisma.user.findUnique({
          where: { id: validatedData.assignedToId },
          select: { firstName: true, lastName: true }
        }) : null;

      const oldAssigneeName = currentTicket.assignedTo ? 
        `${currentTicket.assignedTo.firstName} ${currentTicket.assignedTo.lastName}` : "Unassigned";
      const newAssigneeName = newAssignee ? 
        `${newAssignee.firstName} ${newAssignee.lastName}` : "Unassigned";

      changes.push({
        action: "ASSIGNMENT_CHANGED",
        description: `Assigned from ${oldAssigneeName} to ${newAssigneeName}`,
        oldValue: currentTicket.assignedToId || null,
        newValue: validatedData.assignedToId || null
      });
    }

    // Update ticket and create activity logs
    const updatedTicket = await prisma.$transaction(async (tx) => {
      // Update the ticket
      const ticket = await tx.ticket.update({
        where: { id },
        data: {
          ...validatedData,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
          resolvedAt: validatedData.status === "RESOLVED" || validatedData.status === "CLOSED" 
            ? new Date() 
            : validatedData.status === "OPEN" || validatedData.status === "IN_PROGRESS"
            ? null 
            : undefined,
          resolvedById: validatedData.status === "RESOLVED" || validatedData.status === "CLOSED" 
            ? session.user.id 
            : validatedData.status === "OPEN" || validatedData.status === "IN_PROGRESS"
            ? null 
            : undefined,
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
          },
          resolvedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      // Create activity logs for changes
      for (const change of changes) {
        await tx.ticketActivity.create({
          data: {
            ticketId: id,
            userId: session.user.id,
            action: change.action,
            description: change.description,
            oldValue: change.oldValue,
            newValue: change.newValue,
          }
        });
      }

      // If no specific changes tracked, create general update log
      if (changes.length === 0) {
        await tx.ticketActivity.create({
          data: {
            ticketId: id,
            userId: session.user.id,
            action: "UPDATED",
            description: `Ticket updated`,
            metadata: validatedData as any,
          }
        });
      }

      return ticket;
    });

    return NextResponse.json(updatedTicket);

  } catch (error) {
    console.error("Error updating ticket:", error);
    
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

// DELETE /api/tickets/[id] - Delete ticket (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    // Delete ticket (this will cascade delete comments, attachments, and activities)
    await prisma.ticket.delete({ where: { id } });

    return NextResponse.json({ message: "Ticket deleted successfully" });

  } catch (error) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
