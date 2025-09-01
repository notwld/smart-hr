import React from "react"
import { BaseAlertCard } from "./BaseAlertCard"
import { Coffee } from "lucide-react"

interface BreakAlertCardProps {
  user: {
    id: string
    firstName: string
    lastName: string
    position: string
    department: string
  }
  breakStartTime: Date
  duration: number
  onDismiss: () => void
}

export function BreakAlertCard({ user, breakStartTime, duration, onDismiss }: BreakAlertCardProps) {
  return (
    <BaseAlertCard
      title={`${user.firstName} ${user.lastName} is on break`}
      description={`${user.position} • ${user.department}`}
      icon={<Coffee className="w-4 h-4" />}
      variant="info"
      onDismiss={onDismiss}
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium">Duration: {duration} minutes</span>
        <span className="text-gray-500">•</span>
        <span>Started at {breakStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </BaseAlertCard>
  )
}
