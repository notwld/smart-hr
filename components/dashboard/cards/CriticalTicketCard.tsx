import React from "react"
import { BaseAlertCard } from "./BaseAlertCard"
import { AlertTriangle } from "lucide-react"

interface CriticalTicketCardProps {
  ticket: {
    id: string
    ticketNumber: string
    title: string
    priority: string
    status: string
    createdAt: Date
    createdBy: {
      firstName: string
      lastName: string
    }
    assignedTo?: {
      firstName: string
      lastName: string
    }
  }
  onDismiss: () => void
}

export function CriticalTicketCard({ ticket, onDismiss }: CriticalTicketCardProps) {
  return (
    <BaseAlertCard
      title={`🚨 Critical Ticket: ${ticket.title}`}
      description={`#${ticket.ticketNumber} • ${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`}
      icon={<AlertTriangle className="w-4 h-4" />}
      variant="error"
      onDismiss={onDismiss}
    >
      <div className="text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">Status: {ticket.status}</span>
          <span className="text-gray-500">•</span>
          <span>Priority: {ticket.priority}</span>
        </div>
        {ticket.assignedTo && (
          <div className="text-gray-600">
            Assigned to: {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
          </div>
        )}
        <div className="text-gray-500">
          Created: {ticket.createdAt.toLocaleDateString()} at {ticket.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </BaseAlertCard>
  )
}
