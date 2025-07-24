import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST - Mark message as read
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messageId = params.id;

    // Check if message exists and user has access to it
    const message = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        room: {
          participants: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Mark message as read
    await prisma.messageReadStatus.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId: session.user.id
        }
      },
      update: {
        readAt: new Date()
      },
      create: {
        messageId,
        userId: session.user.id,
        readAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 