"use client"

import { useState } from "react"
import { Clock, User, MessageSquare, Paperclip } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"

interface Card {
  id: string
  title: string
  description?: string
  position: number
  priority: string
  dueDate?: string
  assignedTo?: {
    firstName: string
    lastName: string
  }
  labels: string[]
  comments: any[]
}

interface KanbanCardProps {
  card: Card
  listId: string
  onUpdate: () => void
}

export default function KanbanCard({ card, listId, onUpdate }: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData("application/json", JSON.stringify({
      cardId: card.id,
      sourceListId: listId
    }))
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date()
  const isDueSoon = card.dueDate &&
    new Date(card.dueDate) > new Date() &&
    new Date(card.dueDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 // Within 24 hours

  return (
    <Card
      className={`bg-[#2a2a2a] border-white/10 hover:border-white/20 cursor-pointer transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-3 space-y-2">
        {/* Priority Indicator */}
        <div className="flex items-center justify-between">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(card.priority)}`} />
          {card.labels.length > 0 && (
            <div className="flex gap-1">
              {card.labels.slice(0, 2).map((label, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-400">
                  {label}
                </Badge>
              ))}
              {card.labels.length > 2 && (
                <Badge variant="secondary" className="text-xs bg-gray-500/20 text-gray-400">
                  +{card.labels.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="text-white font-medium text-sm leading-tight line-clamp-2">
          {card.title}
        </h4>

        {/* Description Preview */}
        {card.description && (
          <p className="text-gray-400 text-xs line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Due Date */}
        {card.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            <Clock className="w-3 h-3" />
            <span>
              {format(new Date(card.dueDate), 'MMM d')}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {/* Assigned User */}
            {card.assignedTo && (
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs">
                  {card.assignedTo.firstName[0]}{card.assignedTo.lastName[0]}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Comments Count */}
            {card.comments && card.comments.length > 0 && (
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <MessageSquare className="w-3 h-3" />
                <span>{card.comments.length}</span>
              </div>
            )}
          </div>

          {/* Priority Badge */}
          <Badge
            variant="secondary"
            className={`text-xs capitalize ${
              card.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
              card.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
              card.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}
          >
            {card.priority}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
