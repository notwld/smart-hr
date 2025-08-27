import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  targetRole: z.string().optional(),
  targetDepartment: z.string().optional(),
  targetUserIds: z.array(z.string()).optional(),
  sendAt: z.string().datetime().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        recipients: {
          select: {
            id: true,
            userId: true,
            status: true,
            readAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createNotificationSchema.parse(body);

    // Build recipient criteria
    let recipientCriteria: any = {
      status: "ACTIVE"
    };

    if (validatedData.targetRole) {
      if (validatedData.targetRole === "ADMIN") {
        recipientCriteria.OR = [
          { legacyRole: "ADMIN" },
          { userRoles: { some: { role: { name: "Admin" } } } }
        ];
      } else if (validatedData.targetRole === "EMPLOYEE") {
        recipientCriteria.legacyRole = "EMPLOYEE";
        recipientCriteria.userRoles = {
          none: { role: { name: "Admin" } }
        };
      }
    }

    if (validatedData.targetDepartment) {
      recipientCriteria.department = validatedData.targetDepartment;
    }

    if (validatedData.targetUserIds && validatedData.targetUserIds.length > 0) {
      recipientCriteria.id = { in: validatedData.targetUserIds };
    }

    // Get target recipients
    const recipients = await prisma.user.findMany({
      where: recipientCriteria,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    if (recipients.length === 0) {
      return NextResponse.json(
        { message: "No recipients found matching the criteria" },
        { status: 400 }
      );
    }

    // Create notification and recipients in transaction
    const notification = await prisma.$transaction(async (tx) => {
      const newNotification = await tx.notification.create({
        data: {
          title: validatedData.title,
          message: validatedData.message,
          priority: validatedData.priority,
          createdById: session.user.id,
          targetRole: validatedData.targetRole,
          targetDepartment: validatedData.targetDepartment,
          targetUserIds: validatedData.targetUserIds || [],
          sendAt: validatedData.sendAt ? new Date(validatedData.sendAt) : null,
          status: validatedData.sendAt ? "SCHEDULED" : "SENT",
          sentAt: validatedData.sendAt ? null : new Date(),
          recipientCount: recipients.length,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      // Create recipient records
      const recipientRecords = recipients.map(recipient => ({
        notificationId: newNotification.id,
        userId: recipient.id,
        status: validatedData.sendAt ? "PENDING" : "SENT",
      }));

      await tx.notificationRecipient.createMany({
        data: recipientRecords
      });

      // If immediate send (not scheduled)
      if (!validatedData.sendAt) {
        // Here you would implement actual notification sending logic
        // For now, we'll just simulate it
        console.log(`Sending notification to ${recipients.length} recipients:`, recipients.map(r => r.email));

        // Update recipient statuses to sent
        await tx.notificationRecipient.updateMany({
          where: { notificationId: newNotification.id },
          data: { status: "SENT" }
        });
      }

      return newNotification;
    });

    return NextResponse.json({
      ...notification,
      recipients: recipients.length
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating notification:", error);

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
