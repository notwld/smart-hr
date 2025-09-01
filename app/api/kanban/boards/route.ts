import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to view kanban boards
    const canViewKanban = await hasPermission(session.user.id, "kanban.view")
    if (!canViewKanban) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const userId = session.user.id

    // Get user's boards (created by user or user is a member)
    const userBoards = await prisma.board.findMany({
      where: {
        OR: [
          { createdById: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          },
          {
            visibility: "PUBLIC"
          },
          {
            visibility: "TEAM",
            team: {
              members: {
                some: {
                  userId: userId
                }
              }
            }
          }
        ]
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        team: {
          select: {
            name: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        lists: {
          include: {
            cards: true
          }
        },
        starredBy: {
          where: {
            userId: userId
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Get starred boards
    const starredBoards = await prisma.board.findMany({
      where: {
        starredBy: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        team: {
          select: {
            name: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        lists: {
          include: {
            cards: true
          }
        },
        starredBy: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      boards: userBoards,
      starredBoards: starredBoards
    })

  } catch (error) {
    console.error("Error fetching boards:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to create kanban boards
    const canCreateKanban = await hasPermission(session.user.id, "kanban.create")
    if (!canCreateKanban) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, background, visibility, teamId } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: "Board title is required" }, { status: 400 })
    }

    // Validate visibility and team
    if (visibility === 'TEAM' && !teamId) {
      return NextResponse.json({ error: "Team ID is required for team boards" }, { status: 400 })
    }

    if (visibility === 'TEAM') {
      // Check if user is a member of the team
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          teamId: teamId,
          userId: session.user.id
        }
      })

      if (!teamMember) {
        return NextResponse.json({ error: "You are not a member of this team" }, { status: 403 })
      }
    }

    // Create the board
    const board = await prisma.board.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        background,
        visibility,
        createdById: session.user.id,
        teamId: visibility === 'TEAM' ? teamId : null,
        members: {
          create: {
            userId: session.user.id,
            role: 'ADMIN'
          }
        }
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        team: {
          select: {
            name: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        lists: {
          include: {
            cards: true
          }
        }
      }
    })

    // Create default lists for the board
    const defaultLists = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 }
    ]

    for (const listData of defaultLists) {
      await prisma.list.create({
        data: {
          title: listData.title,
          position: listData.position,
          boardId: board.id
        }
      })
    }

    return NextResponse.json({
      board: {
        ...board,
        lists: defaultLists.map(list => ({ ...list, cards: [] }))
      }
    })

  } catch (error) {
    console.error("Error creating board:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
