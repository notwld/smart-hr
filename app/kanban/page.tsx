"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Plus, Search, Star, Users, MoreHorizontal, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import axios from "axios"
import CreateBoardDialog from "@/components/kanban/CreateBoardDialog"
import BoardCard from "@/components/kanban/BoardCard"

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
    user: {
      firstName: string
      lastName: string
    }
  }>
  lists: Array<{
    cards: any[]
  }>
  starredBy: any[]
  createdAt: string
}

export default function KanbanPage() {
  const { data: session } = useSession()
  const [boards, setBoards] = useState<Board[]>([])
  const [starredBoards, setStarredBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const fetchBoards = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/kanban/boards")
      setBoards(response.data.boards || [])
      setStarredBoards(response.data.starredBoards || [])
    } catch (error) {
      console.error("Error fetching boards:", error)
      toast.error("Failed to load boards")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBoards()
  }, [])

  const handleStarBoard = async (boardId: string) => {
    try {
      await axios.post(`/api/kanban/boards/${boardId}/star`)
      fetchBoards()
      toast.success("Board starred!")
    } catch (error) {
      console.error("Error starring board:", error)
      toast.error("Failed to star board")
    }
  }

  const handleUnstarBoard = async (boardId: string) => {
    try {
      await axios.delete(`/api/kanban/boards/${boardId}/star`)
      fetchBoards()
      toast.success("Board unstarred!")
    } catch (error) {
      console.error("Error unstarring board:", error)
      toast.error("Failed to unstar board")
    }
  }

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    board.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredStarredBoards = starredBoards.filter(board =>
    board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    board.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-[#1a1a1a] border-white/10 animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded mb-4"></div>
                  <div className="h-20 bg-white/10 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Boards</h1>
            <p className="text-gray-400">Organize your work with visual boards</p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Board
          </Button>

          <CreateBoardDialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            onBoardCreated={fetchBoards}
          />
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search boards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1a1a1a] border-white/10 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Starred Boards */}
        {filteredStarredBoards.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <h2 className="text-xl font-semibold text-white">Starred Boards</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStarredBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onStar={handleStarBoard}
                  onUnstar={handleUnstarBoard}
                  isStarred={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Boards */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {searchTerm ? "Search Results" : "Your Boards"}
            </h2>
            <Badge variant="secondary" className="bg-white/10 text-gray-300">
              {filteredBoards.length} boards
            </Badge>
          </div>

          {filteredBoards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onStar={handleStarBoard}
                  onUnstar={handleUnstarBoard}
                  isStarred={starredBoards.some(sb => sb.id === board.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {searchTerm ? (
                  <>
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No boards found for "{searchTerm}"</p>
                  </>
                ) : (
                  <>
                    <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No boards yet</p>
                    <p className="text-sm">Create your first board to get started!</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
