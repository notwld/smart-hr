import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get notifications for the current user
    const notifications = await prisma.notificationRecipient.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        notification: {
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
        }
      },
      orderBy: {
        notification: {
          createdAt: 'desc'
        }
      },
      take: 50 // Limit to recent 50 notifications
    });

    // Format the response
    const formattedNotifications = notifications.map(recipient => ({
      id: recipient.notification.id,
      title: recipient.notification.title,
      message: recipient.notification.message,
      priority: recipient.notification.priority,
      status: recipient.notification.status,
      type: recipient.notification.type,
      createdById: recipient.notification.createdById,
      createdBy: recipient.notification.createdBy,
      createdAt: recipient.notification.createdAt.toISOString(),
      updatedAt: recipient.notification.updatedAt.toISOString(),
      recipientStatus: recipient.status,
    }));

    // Count unread notifications
    const unreadCount = notifications.filter(n => n.status === 'SENT').length;

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount
    });

  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
