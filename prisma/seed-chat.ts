import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // 1. Create or update the General chat room
  const generalRoom = await prisma.chatRoom.upsert({
    where: { id: 'general-chat-room' },
    update: {},
    create: {
      id: 'general-chat-room',
      name: 'General',
      description: 'Company-wide general chat for all employees',
      type: 'GENERAL',
    },
  })

  // 2. Add all employees to the general chat
  const allUsers = await prisma.user.findMany({
    where: {
      status: 'ACTIVE'
    },
    select: { id: true, firstName: true, lastName: true }
  })

  // Add all users to general chat if they're not already participants
  for (const user of allUsers) {
    await prisma.chatParticipant.upsert({
      where: {
        roomId_userId: {
          roomId: generalRoom.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        roomId: generalRoom.id,
        userId: user.id,
        isActive: true,
      },
    })
  }

  // 3. Create team chat rooms for existing teams
  const teams = await prisma.team.findMany({
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  })

  for (const team of teams) {
    // Check if team chat room already exists
    const existingTeamRoom = await prisma.chatRoom.findFirst({
      where: { teamId: team.id }
    })

    let teamRoom;
    if (existingTeamRoom) {
      teamRoom = existingTeamRoom;
    } else {
      // Create team chat room
      teamRoom = await prisma.chatRoom.create({
        data: {
          name: `${team.name} Team`,
          description: `Team chat for ${team.name}`,
          type: 'TEAM',
          teamId: team.id,
        },
      })
    }

    // Add all team members to the team chat
    for (const member of team.members) {
      await prisma.chatParticipant.upsert({
        where: {
          roomId_userId: {
            roomId: teamRoom.id,
            userId: member.userId,
          },
        },
        update: {},
        create: {
          roomId: teamRoom.id,
          userId: member.userId,
          isActive: true,
        },
      })
    }
  }

  // 4. Create welcome messages
  const adminUser = await prisma.user.findFirst({
    where: {
      userRoles: {
        some: {
          role: {
            name: 'Admin'
          }
        }
      }
    }
  })

  if (adminUser) {
    // Add welcome message to general chat
    await prisma.chatMessage.create({
      data: {
        roomId: generalRoom.id,
        senderId: adminUser.id,
        content: '👋 Welcome to the company chat! This is where we can all communicate and collaborate.',
        messageType: 'TEXT',
      },
    })
  }

}

main()
  .catch((e) => {
    console.error('❌ Error seeding chat system:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
