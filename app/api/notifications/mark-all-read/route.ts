import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Update all unread notifications for the current user to READ
    const result = await prisma.notificationRecipient.updateMany({
      where: {
        userId: session.user.id,
        status: 'SENT'
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      }
    });

    return NextResponse.json({
      message: "All notifications marked as read",
      updatedCount: result.count
    });

  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
