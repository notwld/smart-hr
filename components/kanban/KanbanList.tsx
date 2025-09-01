"use client"

import { useState } from "react"
import { Plus, MoreHorizontal, Clock, User, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import KanbanCard from "./KanbanCard"

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

interface List {
  id: string
  title: string
  position: number
  cards: Card[]
}

interface KanbanListProps {
  list: List
  onCreateCard: () => void
  onMoveCard: (cardId: string, sourceListId: string, destinationListId: string, newPosition: number) => void
  onUpdate: () => void
}

export default function KanbanList({ list, onCreateCard, onMoveCard, onUpdate }: KanbanListProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)

    const cardData = JSON.parse(e.dataTransfer.getData("application/json"))
    const { cardId, sourceListId } = cardData

    if (sourceListId !== list.id) {
      // Calculate position based on drop location
      const rect = e.currentTarget.getBoundingClientRect()
      const y = e.clientY - rect.top
      const cardHeight = 120 // Approximate card height
      const position = Math.floor(y / cardHeight)

      onMoveCard(cardId, sourceListId, list.id, Math.min(position, list.cards.length))
    }
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

  const sortedCards = [...list.cards].sort((a, b) => a.position - b.position)

  return (
    <div className="min-w-[280px]">
      <Card className="bg-[#1a1a1a] border-white/10 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg font-semibold">
              {list.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/10 text-gray-300 text-xs">
                {list.cards.length}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                    Edit List
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                    Move List
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    Delete List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent
          className={`space-y-3 min-h-[200px] transition-colors ${
            isDraggingOver ? 'bg-cyan-500/10 border-cyan-500/50' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {sortedCards.map((card, index) => (
            <KanbanCard
              key={card.id}
              card={card}
              listId={list.id}
              onUpdate={onUpdate}
            />
          ))}

          {/* Add Card Button */}
          <Button
            variant="ghost"
            onClick={onCreateCard}
            className="w-full text-gray-400 hover:text-white hover:bg-white/5 border border-dashed border-white/20 py-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
