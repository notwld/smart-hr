import React from "react"
import { BaseAlertCard } from "./BaseAlertCard"
import { Server, AlertTriangle } from "lucide-react"
import { safeFormatDate } from "@/lib/utils"

interface HostingExpiryCardProps {
  hosting: {
    id: string
    clientName: string
    domain: string
    expiryDate: Date | string
    cost: number
  }
  daysUntilExpiry: number
  onDismiss: () => void
}

export function HostingExpiryCard({ hosting, daysUntilExpiry, onDismiss }: HostingExpiryCardProps) {
  const getUrgencyVariant = (days: number) => {
    if (days <= 7) return "error"
    if (days <= 14) return "warning"
    return "info"
  }

  const getUrgencyIcon = (days: number) => {
    if (days <= 7) return <AlertTriangle className="w-4 h-4" />
    return <Server className="w-4 h-4" />
  }

  return (
    <BaseAlertCard
      title={`Hosting expires soon: ${hosting.domain}`}
      description={`Client: ${hosting.clientName}`}
      icon={getUrgencyIcon(daysUntilExpiry)}
      variant={getUrgencyVariant(daysUntilExpiry)}
      onDismiss={onDismiss}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">
          Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
        </span>
        <span className="text-gray-500">
          ${hosting.cost}/month
        </span>
      </div>
      <div className="text-xs text-gray-600 mt-1">
        {safeFormatDate(hosting.expiryDate)}
      </div>
    </BaseAlertCard>
  )
}
