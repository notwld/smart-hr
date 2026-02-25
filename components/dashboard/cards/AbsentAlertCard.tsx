import React from "react"
import { BaseAlertCard } from "./BaseAlertCard"
import { UserX } from "lucide-react"

interface AbsentAlertCardProps {
  user: {
    id: string
    firstName: string
    lastName: string
    position: string
    department: string
    email: string
  }
  onDismiss: () => void
}

export function AbsentAlertCard({ user, onDismiss }: AbsentAlertCardProps) {
  return (
    <BaseAlertCard
      title={`${user?.firstName ?? ""} ${user?.lastName ?? ""} is absent today`.trim() || "Absent today"}
      description={`${user?.position ?? ""} • ${user?.department ?? ""}`.trim() || "-"}
      icon={<UserX className="w-4 h-4" />}
      variant="warning"
      onDismiss={onDismiss}
    >
      <div className="text-xs">
        <span className="font-medium">{user?.email ?? "-"}</span>
      </div>
    </BaseAlertCard>
  )
}
