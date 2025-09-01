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

interface LiveData {
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

  const allCards = [
    // People on break
    ...data.peopleOnBreak.map(item => ({
      id: `break-${item.id}`,
      component: (
        <BreakAlertCard
          key={`break-${item.id}`}
          user={item.user}
          breakStartTime={new Date(item.breakStartTime)}
          duration={item.duration}
          onDismiss={() => dismissCard(`break-${item.id}`)}
        />
      )
    })),

    // Birthdays
    ...data.birthdaysToday.map(employee => ({
      id: `birthday-${employee.id}`,
      component: (
        <BirthdayAlertCard
          key={`birthday-${employee.id}`}
          user={employee}
          age={employee.age}
          onDismiss={() => dismissCard(`birthday-${employee.id}`)}
        />
      )
    })),

    // Expiring hosting
    ...data.expiringHosting.map(hosting => ({
      id: `hosting-${hosting.id}`,
      component: (
        <HostingExpiryCard
          key={`hosting-${hosting.id}`}
          hosting={hosting}
          daysUntilExpiry={hosting.daysUntilExpiry}
          onDismiss={() => dismissCard(`hosting-${hosting.id}`)}
        />
      )
    })),

    // Employees on leave
    ...data.employeesOnLeave.map(leave => ({
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
    ...data.criticalTickets.map(ticket => ({
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
    ...data.criticalLeaves.map(leave => ({
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
    ...data.recentlyClosedTickets.map(ticket => ({
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
    ...data.absentEmployees.map(employee => ({
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

  if (visibleCards.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-sm">All caught up! No active alerts at the moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleCards.map(card => card.component)}
    </div>
  )
}
