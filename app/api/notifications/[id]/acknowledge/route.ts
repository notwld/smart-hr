import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: notificationId } = params;

    // Update the notification recipient status to READ
    const updatedRecipient = await prisma.notificationRecipient.update({
      where: {
        notificationId_userId: {
          notificationId: notificationId,
          userId: session.user.id,
        }
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      }
    });

    return NextResponse.json({
      message: "Notification acknowledged successfully",
      recipient: updatedRecipient
    });

  } catch (error) {
    console.error("Error acknowledging notification:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
