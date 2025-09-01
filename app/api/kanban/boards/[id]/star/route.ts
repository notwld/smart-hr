import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function POST(
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

    // Check if board exists and user has access to it
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
      }
    })

    if (!board) {
      return NextResponse.json({ error: "Board not found or access denied" }, { status: 404 })
    }

    // Check if already starred
    const existingStar = await prisma.boardStar.findUnique({
      where: {
        boardId_userId: {
          boardId: boardId,
          userId: userId
        }
      }
    })

    if (existingStar) {
      return NextResponse.json({ error: "Board already starred" }, { status: 400 })
    }

    // Create star
    await prisma.boardStar.create({
      data: {
        boardId: boardId,
        userId: userId
      }
    })

    return NextResponse.json({ message: "Board starred successfully" })

  } catch (error) {
    console.error("Error starring board:", error)
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

    // Check if user has permission to view kanban boards
    const canViewKanban = await hasPermission(session.user.id, "kanban.view")
    if (!canViewKanban) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const boardId = params.id
    const userId = session.user.id

    // Remove star
    await prisma.boardStar.deleteMany({
      where: {
        boardId: boardId,
        userId: userId
      }
    })

    return NextResponse.json({ message: "Board unstarred successfully" })

  } catch (error) {
    console.error("Error unstarring board:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
