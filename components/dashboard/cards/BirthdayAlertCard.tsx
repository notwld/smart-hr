import React from "react"
import { BaseAlertCard } from "./BaseAlertCard"
import { Cake } from "lucide-react"

interface BirthdayAlertCardProps {
  user: {
    id: string
    firstName: string
    lastName: string
    position: string
    department: string
    email: string
    dateOfBirth: Date | null
  }
  age: number | null
  onDismiss: () => void
}

export function BirthdayAlertCard({ user, age, onDismiss }: BirthdayAlertCardProps) {
  return (
    <BaseAlertCard
      title={`🎉 Happy Birthday ${user.firstName}!`}
      description={`${user.position} • ${user.department}`}
      icon={<Cake className="w-4 h-4" />}
      variant="success"
      onDismiss={onDismiss}
    >
      <div className="flex items-center gap-2 text-xs">
        {age && <span className="font-medium">Turning {age} today</span>}
        <span className="text-gray-500">•</span>
        <span>{user.email}</span>
      </div>
    </BaseAlertCard>
  )
}
