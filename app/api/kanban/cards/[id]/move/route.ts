import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

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

    const cardId = params.id
    const userId = session.user.id
    const body = await request.json()
    const { listId, position } = body

    if (!listId || position === undefined) {
      return NextResponse.json({ error: "List ID and position are required" }, { status: 400 })
    }

    // Check if user has access to both the source and destination boards
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        list: {
          board: {
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
          }
        }
      },
      include: {
        list: {
          include: {
            board: true
          }
        }
      }
    })

    if (!card) {
      return NextResponse.json({ error: "Card not found or access denied" }, { status: 404 })
    }

    // Check if destination list is accessible
    const destinationList = await prisma.list.findFirst({
      where: {
        id: listId,
        board: {
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
        }
      },
      include: {
        board: true
      }
    })

    if (!destinationList) {
      return NextResponse.json({ error: "Destination list not found or access denied" }, { status: 404 })
    }

    const isSameList = card.listId === listId
    const oldListId = card.listId
    const oldPosition = card.position

    // Use a transaction to update positions
    await prisma.$transaction(async (tx) => {
      if (isSameList) {
        // Moving within the same list
        if (position > oldPosition) {
          // Moving down: shift cards between old and new position up
          await tx.card.updateMany({
            where: {
              listId,
              position: {
                gt: oldPosition,
                lte: position
              }
            },
            data: {
              position: {
                decrement: 1
              }
            }
          })
        } else if (position < oldPosition) {
          // Moving up: shift cards between new and old position down
          await tx.card.updateMany({
            where: {
              listId,
              position: {
                gte: position,
                lt: oldPosition
              }
            },
            data: {
              position: {
                increment: 1
              }
            }
          })
        }

        // Update the card position
        await tx.card.update({
          where: { id: cardId },
          data: { position }
        })
      } else {
        // Moving to a different list
        // Shift cards in the source list up
        await tx.card.updateMany({
          where: {
            listId: oldListId,
            position: {
              gt: oldPosition
            }
          },
          data: {
            position: {
              decrement: 1
            }
          }
        })

        // Shift cards in the destination list down
        await tx.card.updateMany({
          where: {
            listId,
            position: {
              gte: position
            }
          },
          data: {
            position: {
              increment: 1
            }
          }
        })

        // Update the card
        await tx.card.update({
          where: { id: cardId },
          data: {
            listId,
            position
          }
        })
      }
    })

    // Create activity log
    const action = isSameList ? "moved" : "moved"
    const description = isSameList
      ? `Card "${card.title}" was moved to position ${position + 1}`
      : `Card "${card.title}" was moved to "${destinationList.board.title}"`

    await prisma.cardActivity.create({
      data: {
        cardId: card.id,
        userId: userId,
        action,
        description,
        oldValue: isSameList ? `${oldListId}:${oldPosition}` : oldListId,
        newValue: isSameList ? `${listId}:${position}` : listId
      }
    })

    return NextResponse.json({ message: "Card moved successfully" })

  } catch (error) {
    console.error("Error moving card:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
