import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to create kanban cards
    const canCreateKanban = await hasPermission(session.user.id, "kanban.create")
    if (!canCreateKanban) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, listId, priority, assignedToId, dueDate, labels } = body

    if (!title?.trim() || !listId) {
      return NextResponse.json({ error: "Title and list ID are required" }, { status: 400 })
    }

    // Check if user has access to the board containing this list
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        board: {
          OR: [
            { createdById: session.user.id },
            {
              members: {
                some: {
                  userId: session.user.id
                }
              }
            },
            { visibility: "PUBLIC" },
            {
              visibility: "TEAM",
              team: {
                members: {
                  some: {
                    userId: session.user.id
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

    if (!list) {
      return NextResponse.json({ error: "List not found or access denied" }, { status: 404 })
    }

    // Get the highest position in the list
    const maxPosition = await prisma.card.findFirst({
      where: { listId },
      orderBy: { position: 'desc' },
      select: { position: true }
    })

    const newPosition = (maxPosition?.position || 0) + 1

    // Create the card
    const card = await prisma.card.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        position: newPosition,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        labels: labels || [],
        listId,
        assignedToId: assignedToId || null,
        createdById: session.user.id
      },
      include: {
        assignedTo: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        comments: true
      }
    })

    // Create activity log
    await prisma.cardActivity.create({
      data: {
        cardId: card.id,
        userId: session.user.id,
        action: "created",
        description: `Card "${card.title}" was created`
      }
    })

    return NextResponse.json({ card })

  } catch (error) {
    console.error("Error creating card:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
