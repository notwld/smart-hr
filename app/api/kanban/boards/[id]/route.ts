import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const boardId = params.id
    const userId = session.user.id

    // Get board with full details
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { createdById: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          },
          { visibility: "PUBLIC" },
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
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        lists: {
          include: {
            cards: {
              include: {
                assignedTo: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                },
                comments: true,
                activities: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true
                      }
                    }
                  },
                  orderBy: {
                    createdAt: 'desc'
                  },
                  take: 5
                }
              },
              orderBy: {
                position: 'asc'
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        },
        starredBy: {
          where: {
            userId: userId
          }
        }
      }
    })

    if (!board) {
      return NextResponse.json({ error: "Board not found or access denied" }, { status: 404 })
    }

    // Check if board is starred by current user
    const isStarred = board.starredBy.length > 0

    return NextResponse.json({
      board,
      isStarred
    })

  } catch (error) {
    console.error("Error fetching board:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to edit kanban boards
    const canEditKanban = await hasPermission(session.user.id, "kanban.edit")
    if (!canEditKanban) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const boardId = params.id
    const userId = session.user.id
    const body = await request.json()
    const { title, description, background, visibility } = body

    // Check if user has permission to edit this board
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { createdById: userId },
          {
            members: {
              some: {
                userId: userId,
                role: "ADMIN"
              }
            }
          }
        ]
      }
    })

    if (!board) {
      return NextResponse.json({ error: "Board not found or access denied" }, { status: 404 })
    }

    // Update board
    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(background !== undefined && { background }),
        ...(visibility !== undefined && { visibility })
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
        }
      }
    })

    return NextResponse.json({ board: updatedBoard })

  } catch (error) {
    console.error("Error updating board:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to delete kanban boards
    const canDeleteKanban = await hasPermission(session.user.id, "kanban.delete")
    if (!canDeleteKanban) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const boardId = params.id
    const userId = session.user.id

    // Check if user has permission to delete this board
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { createdById: userId },
          {
            members: {
              some: {
                userId: userId,
                role: "ADMIN"
              }
            }
          }
        ]
      }
    })

    if (!board) {
      return NextResponse.json({ error: "Board not found or access denied" }, { status: 404 })
    }

    // Delete board (cascade will handle related records)
    await prisma.board.delete({
      where: { id: boardId }
    })

    return NextResponse.json({ message: "Board deleted successfully" })

  } catch (error) {
    console.error("Error deleting board:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
