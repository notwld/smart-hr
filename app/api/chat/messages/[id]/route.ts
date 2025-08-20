import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Fetch a single message
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message = await prisma.chatMessage.findUnique({
      where: {
        id: params.id
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
                email: true,
                pfp: true
              }
            }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user has access to this message (verify room participation)
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: message.roomId,
        participants: {
          some: {
            userId: session.user.id
          }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Edit a message
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messageId = params.id;
    const { content } = await req.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check if message exists and user is the sender
    const existingMessage = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        senderId: session.user.id
      }
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found or access denied' }, { status: 404 });
    }

    // Update the message
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date()
      },
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
    });

    // Broadcast message edit to room participants
    try {
      const participants = await prisma.chatParticipant.findMany({
        where: { roomId: existingMessage.roomId },
        select: { userId: true }
      });

      // Import the broadcast function (we'll need to make it available)
      const messageData = {
        type: 'message_edited',
        message: updatedMessage,
        roomId: existingMessage.roomId
      };

      // Broadcast to all participants except the editor
      participants.forEach(participant => {
        if (participant.userId === session.user.id) return;
        
        // We'll need to access the connections map - for now just console log
        console.log('Would broadcast edit to:', participant.userId);
      });
    } catch (error) {
      console.error('Error broadcasting message edit:', error);
    }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error editing message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a message (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messageId = params.id;

    // Check if message exists and user is the sender
    const existingMessage = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        senderId: session.user.id
      }
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found or access denied' }, { status: 404 });
    }

    // Soft delete the message
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: '[Message deleted]',
        updatedAt: new Date()
      }
    });

    // Broadcast message deletion to room participants
    try {
      const participants = await prisma.chatParticipant.findMany({
        where: { roomId: existingMessage.roomId },
        select: { userId: true }
      });

      const messageData = {
        type: 'message_deleted',
        messageId: messageId,
        roomId: existingMessage.roomId
      };

      // Broadcast to all participants except the deleter
      participants.forEach(participant => {
        if (participant.userId === session.user.id) return;
        
        // We'll need to access the connections map - for now just console log
        console.log('Would broadcast delete to:', participant.userId);
      });
    } catch (error) {
      console.error('Error broadcasting message deletion:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 