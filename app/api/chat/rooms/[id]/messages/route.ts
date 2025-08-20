import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Fetch messages for a specific room
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = params.id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    // Check if user is a participant in this room
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        roomId,
        userId: session.user.id
      }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Build query conditions
    const where: any = {
      roomId,
      isDeleted: false
    };

    if (before) {
      where.createdAt = {
        lt: new Date(before)
      };
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            pfp: true
          }
        },
        parentMessage: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                pfp: true
              }
            }
          }
        },
        replies: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                pfp: true
              }
            }
          }
        },
        readStatus: {
          where: {
            userId: session.user.id
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: limit
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = params.id;
    const { content, messageType = 'TEXT', fileUrl, fileName, fileSize, mimeType, parentMessageId } = await req.json();

    if (!content?.trim() && !fileUrl) {
      return NextResponse.json({ error: 'Message content or file is required' }, { status: 400 });
    }

    // Check if user is a participant in this room
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        roomId,
        userId: session.user.id
      }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Determine message type based on file
    let finalMessageType = messageType;
    if (fileUrl && mimeType) {
      if (mimeType.startsWith('image/')) {
        finalMessageType = 'IMAGE';
      } else if (mimeType.startsWith('video/')) {
        finalMessageType = 'VIDEO';
      } else if (mimeType.startsWith('audio/')) {
        finalMessageType = 'AUDIO';
      } else {
        finalMessageType = 'FILE';
      }
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: session.user.id,
        content: content?.trim() || '',
        messageType: finalMessageType,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        parentMessageId
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            pfp: true
          }
        },
        parentMessage: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Update room's updatedAt timestamp
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 