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

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 1. Present employees with live stats (checked in today, not checked out)
    const presentEmployees = await prisma.attendance.findMany({
      where: {
        checkInTime: {
          not: null
        },
        checkOutTime: null,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
            email: true,
            pfp: true
          }
        },
        breaks: {
          orderBy: {
            startTime: 'asc'
          }
        }
      },
      orderBy: {
        checkInTime: 'asc'
      }
    })

    // Calculate live stats for each present employee
    const now = new Date()
    const standardWorkHours = 8 // Standard work day in hours
    const presentEmployeesWithStats = presentEmployees.map(attendance => {
      if (!attendance.checkInTime) return null

      const checkInTime = new Date(attendance.checkInTime)
      const endTime = attendance.checkOutTime ? new Date(attendance.checkOutTime) : now
      
      // Total working hours (in hours)
      const totalWorkingMs = endTime.getTime() - checkInTime.getTime()
      const totalWorkingHours = totalWorkingMs / (1000 * 60 * 60)

      // Build break intervals [startMs, endMs] and merge overlapping ones so duplicate
      // breaks (e.g. from double-click) are not double-counted.
      const completedBreaks = attendance.breaks.filter(b => b.endTime !== null)
      const activeBreak = attendance.breaks.find(b => b.endTime === null)
      const STALE_BREAK_THRESHOLD_MINUTES = 30
      const activeBreakElapsedMinutes = activeBreak
        ? (now.getTime() - new Date(activeBreak.startTime).getTime()) / (1000 * 60)
        : 0
      const currentBreakMinutes =
        activeBreak && activeBreakElapsedMinutes <= STALE_BREAK_THRESHOLD_MINUTES
          ? activeBreakElapsedMinutes
          : 0

      const breakIntervals: Array<[number, number]> = completedBreaks.map(b => [
        new Date(b.startTime).getTime(),
        b.endTime ? new Date(b.endTime).getTime() : now.getTime(),
      ])
      if (activeBreak && currentBreakMinutes > 0) {
        const startMs = new Date(activeBreak.startTime).getTime()
        breakIntervals.push([startMs, startMs + currentBreakMinutes * 60 * 1000])
      }
      breakIntervals.sort((a, b) => a[0] - b[0])
      const merged: Array<[number, number]> = []
      for (const [s, e] of breakIntervals) {
        if (merged.length > 0 && s <= merged[merged.length - 1][1]) {
          merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e)
        } else {
          merged.push([s, e])
        }
      }
      const totalBreakMinutes = merged.reduce((sum, [s, e]) => sum + (e - s) / (1000 * 60), 0)
      const totalBreakHours = totalBreakMinutes / 60

      // Productive hours = Total Working - Break Hours
      const productiveHours = Math.max(0, totalWorkingHours - totalBreakHours)

      // Overtime (hours beyond standard work hours, excluding breaks)
      // Overtime = Productive Hours - Standard Work Hours
      const overtimeHours = Math.max(0, productiveHours - standardWorkHours)
      
      // Adjust productive hours to exclude overtime
      const adjustedProductiveHours = Math.min(productiveHours, standardWorkHours)

      // Create timeline segments
      const timelineSegments: Array<{
        type: 'productive' | 'break' | 'overtime'
        startTime: Date
        endTime: Date | null
        duration: number // in hours
      }> = []

      let currentTime = checkInTime

      // Build timeline from merged break intervals so duplicates don't show twice
      for (const [startMs, endMs] of merged) {
        const breakStart = new Date(startMs)
        const breakEnd = new Date(endMs)
        if (currentTime < breakStart) {
          const productiveDuration = (breakStart.getTime() - currentTime.getTime()) / (1000 * 60 * 60)
          timelineSegments.push({
            type: 'productive',
            startTime: currentTime,
            endTime: breakStart,
            duration: productiveDuration
          })
        }
        const breakDuration = (endMs - startMs) / (1000 * 60 * 60)
        timelineSegments.push({
          type: 'break',
          startTime: breakStart,
          endTime: breakEnd,
          duration: breakDuration
        })
        currentTime = breakEnd
      }

      // Add remaining segment (productive or overtime)
      if (currentTime < endTime) {
        const remainingDuration = (endTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60)
        if (remainingDuration > 0) {
          // Calculate productive time worked so far (excluding breaks)
          const totalWorkedSoFar = (currentTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
          const breaksSoFar = totalBreakMinutes / 60
          const productiveSoFar = totalWorkedSoFar - breaksSoFar
          
          // Determine if remaining time is productive or overtime
          const standardWorkEndTime = new Date(checkInTime)
          standardWorkEndTime.setHours(standardWorkEndTime.getHours() + standardWorkHours)
          
          if (currentTime >= standardWorkEndTime) {
            // All remaining time is overtime
            timelineSegments.push({
              type: 'overtime',
              startTime: currentTime,
              endTime: endTime,
              duration: remainingDuration
            })
          } else if (endTime <= standardWorkEndTime) {
            // All remaining time is productive
            timelineSegments.push({
              type: 'productive',
              startTime: currentTime,
              endTime: endTime,
              duration: remainingDuration
            })
          } else {
            // Split: some productive, some overtime
            const productiveDuration = (standardWorkEndTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60)
            const overtimeDuration = (endTime.getTime() - standardWorkEndTime.getTime()) / (1000 * 60 * 60)
            
            if (productiveDuration > 0) {
              timelineSegments.push({
                type: 'productive',
                startTime: currentTime,
                endTime: standardWorkEndTime,
                duration: productiveDuration
              })
            }
            
            if (overtimeDuration > 0) {
              timelineSegments.push({
                type: 'overtime',
                startTime: standardWorkEndTime,
                endTime: endTime,
                duration: overtimeDuration
              })
            }
          }
        }
      }

      return {
        attendanceId: attendance.id,
        user: attendance.user,
        checkInTime: attendance.checkInTime?.toISOString() || null,
        checkOutTime: attendance.checkOutTime?.toISOString() || null,
        stats: {
          totalWorkingHours: totalWorkingHours,
          productiveHours: adjustedProductiveHours,
          breakHours: totalBreakHours,
          overtimeHours: overtimeHours
        },
        timelineSegments: timelineSegments.map(segment => ({
          ...segment,
          startTime: segment.startTime.toISOString(),
          endTime: segment.endTime?.toISOString() || null
        })),
        breaks: attendance.breaks,
        activeBreak: activeBreak || null
      }
    }).filter(Boolean)

    // 2. People on break (for backward compatibility)
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

    // 3. Absent employees (no check-in today)

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

    // 4. Birthdays today
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

    // 5. Expiring hosting (next 30 days)
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

    // 6. Employees on leave
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

    // 7. Critical tickets and leaves
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

    // 8. Recently closed tickets (last 24 hours)
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
      presentEmployees: presentEmployeesWithStats,
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
