import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Fetch user's chat rooms
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                pfp: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
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
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Calculate unread counts and format response
    const roomsWithUnreadCounts = await Promise.all(
      chatRooms.map(async (room) => {
        const unreadCount = await prisma.chatMessage.count({
          where: {
            roomId: room.id,
            senderId: { not: session.user.id },
            readStatus: {
              none: {
                userId: session.user.id
              }
            }
          }
        });

        return {
          ...room,
          lastMessage: room.messages[0] || null,
          unreadCount,
          messages: undefined // Remove messages array from response
        };
      })
    );

    return NextResponse.json(roomsWithUnreadCounts);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new chat room
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, participantIds, name, description, teamId } = body;

    if (!type || !participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Ensure current user is included in participants
    if (!participantIds.includes(session.user.id)) {
      participantIds.push(session.user.id);
    }

    // For direct messages, check if room already exists
    if (type === 'DIRECT' && participantIds.length === 2) {
      const existingRoom = await prisma.chatRoom.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              userId: { in: participantIds }
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  pfp: true
                }
              }
            }
          }
        }
      });

      if (existingRoom) {
        return NextResponse.json(existingRoom);
      }
    }

    // Create the chat room
    const chatRoom = await prisma.chatRoom.create({
      data: {
        name,
        description,
        type,
        teamId,
        participants: {
          create: participantIds.map(userId => ({
            userId,
            joinedAt: new Date()
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                pfp: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(chatRoom, { status: 201 });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 