import React from "react"
import { BaseAlertCard } from "./BaseAlertCard"
import { Calendar } from "lucide-react"
import { safeFormatDate } from "@/lib/utils"

interface LeaveAlertCardProps {
  leave: {
    id: string
    type: string
    reason: string
    endDate: Date | string
    daysRemaining: number
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

export function LeaveAlertCard({ leave, onDismiss }: LeaveAlertCardProps) {
  const getLeaveTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sick': return "error"
      case 'vacation': return "success"
      case 'personal': return "info"
      case 'maternity':
      case 'paternity': return "warning"
      default: return "info"
    }
  }

  return (
    <BaseAlertCard
      title={`${leave.user?.firstName ?? ""} ${leave.user?.lastName ?? ""} is on ${leave.type ?? "leave"} leave`.trim() || "On leave"}
      description={`${leave.user?.position ?? ""} • ${leave.user?.department ?? ""}`.trim() || "-"}
      icon={<Calendar className="w-4 h-4" />}
      variant={getLeaveTypeColor(leave.type)}
      onDismiss={onDismiss}
    >
      <div className="text-xs space-y-1">
        <div className="font-medium">{leave.reason}</div>
        <div className="flex items-center gap-2">
          <span>{leave.daysRemaining} day{leave.daysRemaining !== 1 ? 's' : ''} remaining</span>
          <span className="text-gray-500">•</span>
          <span>Ends {safeFormatDate(leave.endDate)}</span>
        </div>
      </div>
    </BaseAlertCard>
  )
}
