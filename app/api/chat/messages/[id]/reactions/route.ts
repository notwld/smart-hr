import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST - Add or remove a reaction
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
    const { emoji } = await req.json();

    if (!emoji || emoji.trim() === '') {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    // Check if message exists
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user already reacted with this emoji
    const existingReaction = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: session.user.id,
          emoji: emoji.trim()
        }
      }
    });

    if (existingReaction) {
      // Remove the reaction
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id }
      });

      // Broadcast reaction removal
      try {
        const participants = await prisma.chatParticipant.findMany({
          where: { roomId: message.roomId },
          select: { userId: true }
        });

        const reactionData = {
          type: 'reaction_removed',
          messageId,
          userId: session.user.id,
          emoji: emoji.trim(),
          roomId: message.roomId
        };

        // For now, just log the broadcast (we'll need proper connection access)
        console.log('Would broadcast reaction removal to room:', message.roomId);
      } catch (error) {
        console.error('Error broadcasting reaction removal:', error);
      }
      
      return NextResponse.json({ action: 'removed' });
    } else {
      // Add the reaction
      const reaction = await prisma.messageReaction.create({
        data: {
          messageId,
          userId: session.user.id,
          emoji: emoji.trim()
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Broadcast reaction addition
      try {
        const participants = await prisma.chatParticipant.findMany({
          where: { roomId: message.roomId },
          select: { userId: true }
        });

        const reactionData = {
          type: 'reaction_added',
          messageId,
          reaction,
          roomId: message.roomId
        };

        // For now, just log the broadcast (we'll need proper connection access)
        console.log('Would broadcast reaction addition to room:', message.roomId);
      } catch (error) {
        console.error('Error broadcasting reaction addition:', error);
      }

      return NextResponse.json({ action: 'added', reaction });
    }
  } catch (error) {
    console.error('Error handling reaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get reactions for a message
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id;

    const reactions = await prisma.messageReaction.findMany({
      where: { messageId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {} as Record<string, typeof reactions>);

    return NextResponse.json(groupedReactions);
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
