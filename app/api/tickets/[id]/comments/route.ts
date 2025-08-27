import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
  isInternal: z.boolean().default(false),
  attachments: z.array(z.string()).optional(),
});

// GET /api/tickets/[id]/comments - Get ticket comments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: ticketId } = params;

    // Check if ticket exists and user has access
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        createdById: true,
        assignedToId: true,
      }
    });

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    // Check permissions
    const userRole = session.user.role;
    const canAccess = userRole === "ADMIN" ||
                     ticket.createdById === session.user.id ||
                     ticket.assignedToId === session.user.id;

    if (!canAccess) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const comments = await prisma.ticketComment.findMany({
      where: {
        ticketId,
        // Non-admin users can't see internal comments unless they are the creator or assignee
        ...(userRole !== "ADMIN" && ticket.createdById !== session.user.id && ticket.assignedToId !== session.user.id
          ? { isInternal: false }
          : {})
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            pfp: true,
            department: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(comments);

  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tickets/[id]/comments - Add comment to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: ticketId } = params;
    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);

    // Check if ticket exists and user has access
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        createdById: true,
        assignedToId: true,
        status: true,
      }
    });

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    // Check permissions
    const userRole = session.user.role;
    const canComment = userRole === "ADMIN" ||
                      ticket.createdById === session.user.id ||
                      ticket.assignedToId === session.user.id;

    if (!canComment) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Only admins can create internal comments
    if (validatedData.isInternal && userRole !== "ADMIN") {
      validatedData.isInternal = false;
    }

    // Create comment and activity log
    const comment = await prisma.$transaction(async (tx) => {
      const newComment = await tx.ticketComment.create({
        data: {
          content: validatedData.content,
          ticketId,
          authorId: session.user.id,
          isInternal: validatedData.isInternal,
          attachments: validatedData.attachments || [],
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              pfp: true,
              department: true,
            }
          }
        }
      });

      // Create activity log
      await tx.ticketActivity.create({
        data: {
          ticketId,
          userId: session.user.id,
          action: validatedData.isInternal ? "INTERNAL_COMMENT_ADDED" : "COMMENT_ADDED",
          description: validatedData.isInternal
            ? "Added internal comment"
            : "Added comment",
        }
      });

      // Update ticket's updatedAt timestamp
      await tx.ticket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() }
      });

      return newComment;
    });

    return NextResponse.json(comment, { status: 201 });

  } catch (error) {
    console.error("Error creating comment:", error);

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