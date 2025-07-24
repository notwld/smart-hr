import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>();

// SSE endpoint for real-time chat
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Store the connection
      connections.set(session.user.id, controller);
      
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', userId: session.user.id })}\n\n`);
      
      // Clean up on close
      req.signal.addEventListener('abort', () => {
        connections.delete(session.user.id);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Send message endpoint
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { roomId, content, messageType = 'TEXT', parentMessageId, forwardedFrom } = body;

    // Save message to database
    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: session.user.id,
        content,
        messageType,
        parentMessageId,
        forwardedFrom
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

    // Get room participants
    const participants = await prisma.chatParticipant.findMany({
      where: { roomId },
      select: { userId: true }
    });

    // Broadcast message to all participants except the sender
    const messageData = {
      type: 'new_message',
      message,
      roomId
    };

    participants.forEach(participant => {
      // Don't broadcast to the sender
      if (participant.userId === session.user.id) return;
      
      const controller = connections.get(participant.userId);
      if (controller) {
        try {
          controller.enqueue(`data: ${JSON.stringify(messageData)}\n\n`);
        } catch (error) {
          // Remove dead connection
          connections.delete(participant.userId);
        }
      }
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 