import React from "react"
import { BaseAlertCard } from "./BaseAlertCard"
import { Heart } from "lucide-react"
import { safeFormatDate } from "@/lib/utils"

interface CriticalLeaveCardProps {
  leave: {
    id: string
    type: string
    startDate: Date | string
    daysUntilStart: number
    user: {
      id: string
      firstName: string
      lastName: string
      position: string
      department: string
    }
  }
  onDismiss: () => void
}

export function CriticalLeaveCard({ leave, onDismiss }: CriticalLeaveCardProps) {
  return (
    <BaseAlertCard
      title={`👶 ${leave.type} leave pending approval`}
      description={`${leave.user?.firstName ?? ""} ${leave.user?.lastName ?? ""} • ${leave.user?.position ?? ""}`.trim() || "-"}
      icon={<Heart className="w-4 h-4" />}
      variant="warning"
      onDismiss={onDismiss}
    >
      <div className="text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">Starts in {leave.daysUntilStart} day{leave.daysUntilStart !== 1 ? 's' : ''}</span>
          <span className="text-gray-500">•</span>
          <span>{safeFormatDate(leave.startDate)}</span>
        </div>
        <div className="text-gray-600">
          Department: {leave.user?.department ?? "-"}
        </div>
      </div>
    </BaseAlertCard>
  )
}
