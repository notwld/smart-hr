import React from "react"
import { BaseAlertCard } from "./BaseAlertCard"
import { CheckCircle } from "lucide-react"

interface ClosedTicketCardProps {
  ticket: {
    id: string
    ticketNumber: string
    title: string
    status: string
    updatedAt: Date
    createdBy: {
      firstName: string
      lastName: string
    }
    resolvedBy?: {
      firstName: string
      lastName: string
    }
  }
  onDismiss: () => void
}

export function ClosedTicketCard({ ticket, onDismiss }: ClosedTicketCardProps) {
  return (
    <BaseAlertCard
      title={`✅ Ticket Closed: ${ticket.title}`}
      description={`#${ticket.ticketNumber} • ${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`}
      icon={<CheckCircle className="w-4 h-4" />}
      variant="success"
      onDismiss={onDismiss}
    >
      <div className="text-xs space-y-1">
        {ticket.resolvedBy && (
          <div className="font-medium">
            Resolved by: {ticket.resolvedBy.firstName} {ticket.resolvedBy.lastName}
          </div>
        )}
        <div className="text-gray-600">
          Closed: {ticket.updatedAt.toLocaleDateString()} at {ticket.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </BaseAlertCard>
  )
}
