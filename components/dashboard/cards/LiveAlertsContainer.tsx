"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { BreakAlertCard } from "./BreakAlertCard"
import { AbsentAlertCard } from "./AbsentAlertCard"
import { BirthdayAlertCard } from "./BirthdayAlertCard"
import { HostingExpiryCard } from "./HostingExpiryCard"
import { LeaveAlertCard } from "./LeaveAlertCard"
import { CriticalTicketCard } from "./CriticalTicketCard"
import { CriticalLeaveCard } from "./CriticalLeaveCard"
import { ClosedTicketCard } from "./ClosedTicketCard"
import { EmployeeLiveStats } from "./EmployeeLiveStats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface LiveData {
  presentEmployees?: Array<{
    attendanceId: string
    user: any
    checkInTime: string | Date
    checkOutTime: string | Date | null
    stats: {
      totalWorkingHours: number
      productiveHours: number
      breakHours: number
      overtimeHours: number
    }
    timelineSegments: Array<{
      type: 'productive' | 'break' | 'overtime'
      startTime: string | Date
      endTime: string | Date | null
      duration: number
    }>
    breaks: Array<any>
    activeBreak: any | null
  }>
  peopleOnBreak: Array<{
    id: string
    user: any
    breakStartTime: Date
    duration: number
  }>
  absentEmployees: Array<any>
  birthdaysToday: Array<any>
  expiringHosting: Array<any>
  employeesOnLeave: Array<any>
  criticalTickets: Array<any>
  criticalLeaves: Array<any>
  recentlyClosedTickets: Array<any>
}

interface LiveAlertsContainerProps {
  className?: string
}

export function LiveAlertsContainer({ className }: LiveAlertsContainerProps) {
  const [data, setData] = useState<LiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set())

  const fetchLiveData = async () => {
    try {
      const response = await axios.get("/api/dashboard/live")
      setData(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching live dashboard data:", error)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchLiveData()

    // Set up polling every 7 seconds
    const interval = setInterval(fetchLiveData, 7000)

    return () => clearInterval(interval)
  }, [])

  const dismissCard = (cardId: string) => {
    setDismissedCards(prev => new Set(prev).add(cardId))
  }

  if (loading || !data) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  const peopleOnBreak = data.peopleOnBreak ?? []
  const birthdaysToday = data.birthdaysToday ?? []
  const expiringHosting = data.expiringHosting ?? []
  const employeesOnLeave = data.employeesOnLeave ?? []
  const criticalTickets = data.criticalTickets ?? []
  const criticalLeaves = data.criticalLeaves ?? []
  const recentlyClosedTickets = data.recentlyClosedTickets ?? []
  const absentEmployees = data.absentEmployees ?? []

  const allCards = [
    // People on break
    ...peopleOnBreak.filter((item) => item?.id != null).map((item) => ({
      id: `break-${item.id}`,
      component: (
        <BreakAlertCard
          key={`break-${item.id}`}
          attendanceId={item.id}
          user={item.user ?? {}}
          breakStartTime={item.breakStartTime ?? new Date()}
          duration={item.duration ?? 0}
          onDismiss={() => dismissCard(`break-${item.id}`)}
          onBreakEnded={() => {
            dismissCard(`break-${item.id}`)
            fetchLiveData()
          }}
        />
      )
    })),

    // Birthdays
    ...birthdaysToday.filter((e) => e?.id != null).map((employee) => ({
      id: `birthday-${employee.id}`,
      component: (
        <BirthdayAlertCard
          key={`birthday-${employee.id}`}
          user={employee}
          age={employee.age ?? null}
          onDismiss={() => dismissCard(`birthday-${employee.id}`)}
        />
      )
    })),

    // Expiring hosting
    ...expiringHosting.filter((h) => h?.id != null).map((hosting) => ({
      id: `hosting-${hosting.id}`,
      component: (
        <HostingExpiryCard
          key={`hosting-${hosting.id}`}
          hosting={hosting}
          daysUntilExpiry={hosting.daysUntilExpiry ?? 0}
          onDismiss={() => dismissCard(`hosting-${hosting.id}`)}
        />
      )
    })),

    // Employees on leave
    ...employeesOnLeave.filter((l) => l?.id != null).map((leave) => ({
      id: `leave-${leave.id}`,
      component: (
        <LeaveAlertCard
          key={`leave-${leave.id}`}
          leave={leave}
          onDismiss={() => dismissCard(`leave-${leave.id}`)}
        />
      )
    })),

    // Critical tickets
    ...criticalTickets.filter((t) => t?.id != null).map((ticket) => ({
      id: `critical-ticket-${ticket.id}`,
      component: (
        <CriticalTicketCard
          key={`critical-ticket-${ticket.id}`}
          ticket={ticket}
          onDismiss={() => dismissCard(`critical-ticket-${ticket.id}`)}
        />
      )
    })),

    // Critical leaves
    ...criticalLeaves.filter((l) => l?.id != null).map((leave) => ({
      id: `critical-leave-${leave.id}`,
      component: (
        <CriticalLeaveCard
          key={`critical-leave-${leave.id}`}
          leave={leave}
          onDismiss={() => dismissCard(`critical-leave-${leave.id}`)}
        />
      )
    })),

    // Recently closed tickets
    ...recentlyClosedTickets.filter((t) => t?.id != null).map((ticket) => ({
      id: `closed-ticket-${ticket.id}`,
      component: (
        <ClosedTicketCard
          key={`closed-ticket-${ticket.id}`}
          ticket={ticket}
          onDismiss={() => dismissCard(`closed-ticket-${ticket.id}`)}
        />
      )
    })),

    // Absent employees (lowest priority - shown last)
    ...absentEmployees.filter((e) => e?.id != null).map((employee) => ({
      id: `absent-${employee.id}`,
      component: (
        <AbsentAlertCard
          key={`absent-${employee.id}`}
          user={employee}
          onDismiss={() => dismissCard(`absent-${employee.id}`)}
        />
      )
    }))
  ]

  // Filter out dismissed cards
  const visibleCards = allCards.filter(card => !dismissedCards.has(card.id))

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Present Employees with Live Stats */}
      {(data.presentEmployees?.length ?? 0) > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-600" />
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({(data.presentEmployees ?? []).length} {(data.presentEmployees ?? []).length === 1 ? "employee" : "employees"})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {(data.presentEmployees ?? [])
                .filter((e) => e?.attendanceId != null)
                .map((employee) => (
                  <EmployeeLiveStats
                    key={employee.attendanceId}
                    attendanceId={employee.attendanceId}
                    user={employee.user ?? {}}
                    checkInTime={employee.checkInTime}
                    checkOutTime={employee.checkOutTime ?? null}
                    stats={employee.stats ?? { totalWorkingHours: 0, productiveHours: 0, breakHours: 0, overtimeHours: 0 }}
                    timelineSegments={employee.timelineSegments ?? []}
                    activeBreak={employee.activeBreak ?? null}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Alerts */}
      {visibleCards.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visibleCards.map(card => card.component)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(data.presentEmployees?.length ?? 0) === 0 && visibleCards.length === 0 && (
        <div className={`text-center py-8 ${className}`}>
          <div className="text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm">No employees present and no active alerts at the moment.</p>
          </div>
        </div>
      )}
    </div>
  )
}
