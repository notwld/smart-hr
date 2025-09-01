"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import {
  Plus,
  MoreHorizontal,
  Users,
  Settings,
  Star,
  ArrowLeft,
  Search,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import axios from "axios"
import KanbanList from "@/components/kanban/KanbanList"
import CreateCardDialog from "@/components/kanban/CreateCardDialog"

interface Board {
  id: string
  title: string
  description?: string
  background?: string
  visibility: string
  createdBy: {
    firstName: string
    lastName: string
  }
  team?: {
    name: string
  }
  members: Array<{
    id: string
    user: {
      id: string
      firstName: string
      lastName: string
    }
    role: string
  }>
  lists: Array<{
    id: string
    title: string
    position: number
    cards: Array<{
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
    }>
  }>
  starredBy: any[]
}

export default function BoardPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const boardId = params.id as string

  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [createCardDialogOpen, setCreateCardDialogOpen] = useState(false)
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [isStarred, setIsStarred] = useState(false)

  useEffect(() => {
    fetchBoard()
  }, [boardId])

  const fetchBoard = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/kanban/boards/${boardId}`)
      setBoard(response.data.board)
      setIsStarred(response.data.isStarred)
    } catch (error: any) {
      console.error("Error fetching board:", error)
      if (error.response?.status === 404) {
        toast.error("Board not found")
        router.push("/kanban")
      } else {
        toast.error("Failed to load board")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStarBoard = async () => {
    try {
      if (isStarred) {
        await axios.delete(`/api/kanban/boards/${boardId}/star`)
        setIsStarred(false)
        toast.success("Board unstarred!")
      } else {
        await axios.post(`/api/kanban/boards/${boardId}/star`)
        setIsStarred(true)
        toast.success("Board starred!")
      }
    } catch (error) {
      console.error("Error toggling star:", error)
      toast.error("Failed to update star status")
    }
  }

  const handleCreateCard = (listId: string) => {
    setSelectedListId(listId)
    setCreateCardDialogOpen(true)
  }

  const handleCardCreated = () => {
    fetchBoard()
    setCreateCardDialogOpen(false)
    setSelectedListId(null)
  }

  const handleMoveCard = async (cardId: string, sourceListId: string, destinationListId: string, newPosition: number) => {
    try {
      await axios.patch(`/api/kanban/cards/${cardId}/move`, {
        listId: destinationListId,
        position: newPosition
      })

      // Optimistically update the UI
      if (board) {
        const updatedBoard = { ...board }
        const sourceList = updatedBoard.lists.find(l => l.id === sourceListId)
        const destList = updatedBoard.lists.find(l => l.id === destinationListId)

        if (sourceList && destList) {
          const cardIndex = sourceList.cards.findIndex(c => c.id === cardId)
          if (cardIndex !== -1) {
            const [card] = sourceList.cards.splice(cardIndex, 0)
            card.position = newPosition
            destList.cards.splice(newPosition, 0, card)
          }
        }

        setBoard(updatedBoard)
      }
    } catch (error) {
      console.error("Error moving card:", error)
      toast.error("Failed to move card")
      fetchBoard() // Revert on error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded mb-4"></div>
          <div className="h-64 bg-white/10 rounded"></div>
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Board not found</h2>
          <p className="text-gray-400 mb-4">The board you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push("/kanban")} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            Back to Boards
          </Button>
        </div>
      </div>
    )
  }

  const getBackgroundStyle = () => {
    if (board.background) {
      if (board.background.startsWith('#')) {
        return { backgroundColor: board.background }
      } else {
        return { background: board.background }
      }
    }
    return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  }

  const filteredLists = board.lists.map(list => ({
    ...list,
    cards: list.cards.filter(card =>
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }))

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div
        className="relative h-32 flex items-center justify-between px-6 py-4"
        style={getBackgroundStyle()}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/kanban")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{board.title}</h1>
            {board.description && (
              <p className="text-gray-200 text-sm mt-1">{board.description}</p>
            )}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-black/20 border-white/20 text-white placeholder-gray-400"
            />
          </div>

          {/* Members */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {board.members.slice(0, 4).map((member, index) => (
                <Avatar key={member.id} className="w-8 h-8 border-2 border-white/20">
                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs">
                    {member.user.firstName[0]}{member.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              {board.members.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold border-2 border-white/20">
                  +{board.members.length - 4}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStarBoard}
            className={`text-white hover:bg-white/10 ${isStarred ? 'text-yellow-500' : ''}`}
          >
            <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                <Settings className="w-4 h-4 mr-2" />
                Board Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                <Users className="w-4 h-4 mr-2" />
                Manage Members
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-6">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {filteredLists
            .sort((a, b) => a.position - b.position)
            .map((list) => (
              <KanbanList
                key={list.id}
                list={list}
                onCreateCard={() => handleCreateCard(list.id)}
                onMoveCard={handleMoveCard}
                onUpdate={() => fetchBoard()}
              />
            ))}

          {/* Add List Button */}
          <Card className="bg-[#1a1a1a] border-white/10 border-dashed min-w-[280px] flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors">
            <CardContent className="p-4">
              <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Card Dialog */}
      {selectedListId && (
        <CreateCardDialog
          open={createCardDialogOpen}
          onClose={() => setCreateCardDialogOpen(false)}
          listId={selectedListId}
          onCardCreated={handleCardCreated}
          boardMembers={board.members.map(m => m.user)}
        />
      )}
    </div>
  )
}
