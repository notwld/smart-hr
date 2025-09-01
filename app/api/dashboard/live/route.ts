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

    // Check if user has permission to view dashboard
    const canViewDashboard = await hasPermission(session.user.id, "dashboard.admin")
    if (!canViewDashboard) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // 1. People on break
    const peopleOnBreak = await prisma.attendance.findMany({
      where: {
        breakStartTime: {
          not: null
        },
        breakEndTime: null,
        checkInTime: {
          not: null
        },
        checkOutTime: null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true
          }
        }
      },
      orderBy: {
        breakStartTime: 'desc'
      }
    })

    // 2. Absent employees (no check-in today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const absentEmployees = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        attendance: {
          none: {
            date: {
              gte: today,
              lt: tomorrow
            }
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        email: true
      }
    })

    // 3. Birthdays today
    const currentMonth = today.getMonth() + 1
    const currentDay = today.getDate()

    const birthdaysToday = await prisma.user.findMany({
      where: {
        dateOfBirth: {
          not: null
        },
        status: "ACTIVE"
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        dateOfBirth: true,
        email: true
      }
    }).then(users =>
      users.filter(user => {
        if (!user.dateOfBirth) return false
        const birthMonth = user.dateOfBirth.getMonth() + 1
        const birthDay = user.dateOfBirth.getDate()
        return birthMonth === currentMonth && birthDay === currentDay
      })
    )

    // 4. Expiring hosting (next 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const expiringHosting = await prisma.hosting.findMany({
      where: {
        expiryDate: {
          gte: new Date(),
          lte: thirtyDaysFromNow
        }
      },
      orderBy: {
        expiryDate: 'asc'
      }
    })

    // 5. Employees on leave
    const employeesOnLeave = await prisma.leave.findMany({
      where: {
        status: "APPROVED",
        startDate: {
          lte: new Date()
        },
        endDate: {
          gte: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true
          }
        }
      },
      orderBy: {
        endDate: 'asc'
      }
    })

    // 6. Critical tickets and leaves
    const criticalTickets = await prisma.ticket.findMany({
      where: {
        priority: "CRITICAL",
        status: {
          not: "CLOSED"
        }
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        assignedTo: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const criticalLeaves = await prisma.leave.findMany({
      where: {
        status: "PENDING",
        type: {
          in: ["MATERNITY", "PATERNITY"]
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    // 7. Recently closed tickets (last 24 hours)
    const last24Hours = new Date()
    last24Hours.setHours(last24Hours.getHours() - 24)

    const recentlyClosedTickets = await prisma.ticket.findMany({
      where: {
        status: "CLOSED",
        updatedAt: {
          gte: last24Hours
        }
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        resolvedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      peopleOnBreak: peopleOnBreak.map(item => ({
        id: item.id,
        user: item.user,
        breakStartTime: item.breakStartTime,
        duration: item.breakStartTime ?
          Math.floor((new Date().getTime() - item.breakStartTime.getTime()) / (1000 * 60)) : 0
      })),
      absentEmployees,
      birthdaysToday: birthdaysToday.map(user => ({
        ...user,
        age: user.dateOfBirth ?
          new Date().getFullYear() - user.dateOfBirth.getFullYear() : null
      })),
      expiringHosting: expiringHosting.map(hosting => ({
        ...hosting,
        daysUntilExpiry: Math.ceil((hosting.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      })),
      employeesOnLeave: employeesOnLeave.map(leave => ({
        id: leave.id,
        user: leave.user,
        type: leave.type,
        reason: leave.reason,
        endDate: leave.endDate,
        daysRemaining: Math.ceil((leave.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      })),
      criticalTickets,
      criticalLeaves: criticalLeaves.map(leave => ({
        id: leave.id,
        user: leave.user,
        type: leave.type,
        startDate: leave.startDate,
        daysUntilStart: Math.ceil((leave.startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      })),
      recentlyClosedTickets
    })

  } catch (error) {
    console.error("Error fetching live dashboard data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
