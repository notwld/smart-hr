"use client"

import { Star, Users, MoreHorizontal, Eye, EyeOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

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

interface BoardCardProps {
  board: Board
  onStar: (boardId: string) => void
  onUnstar: (boardId: string) => void
  isStarred: boolean
}

export default function BoardCard({ board, onStar, onUnstar, isStarred }: BoardCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/kanban/${board.id}`)
  }

  const getBackgroundStyle = () => {
    if (board.background) {
      if (board.background.startsWith('#')) {
        return { backgroundColor: board.background }
      } else {
        return { backgroundImage: `url(${board.background})`, backgroundSize: 'cover' }
      }
    }
    return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  }

  const totalCards = board.lists.reduce((total, list) => total + list.cards.length, 0)

  return (
    <Card className="bg-[#1a1a1a] border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group overflow-hidden">
      {/* Background */}
      <div
        className="h-20 bg-gradient-to-br from-cyan-500 to-blue-600 relative"
        style={getBackgroundStyle()}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 bg-black/20 hover:bg-black/40 text-white"
            onClick={(e) => {
              e.stopPropagation()
              if (isStarred) {
                onUnstar(board.id)
              } else {
                onStar(board.id)
              }
            }}
          >
            <Star className={`w-3 h-3 ${isStarred ? 'fill-yellow-500 text-yellow-500' : 'text-white'}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-black/20 hover:bg-black/40 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                Edit Board
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                Duplicate Board
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                Delete Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4" onClick={handleCardClick}>
        <div className="space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-white text-lg leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {board.title}
          </h3>

          {/* Description */}
          {board.description && (
            <p className="text-gray-400 text-sm line-clamp-2">
              {board.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {board.visibility === 'PRIVATE' ? (
                <div className="flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  <span>Private</span>
                </div>
              ) : board.visibility === 'TEAM' ? (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{board.team?.name || 'Team'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Public</span>
                </div>
              )}
              <span>{totalCards} cards</span>
            </div>
          </div>

          {/* Team/Members */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {board.members.slice(0, 3).map((member, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold border border-[#1a1a1a]"
                    title={`${member.user.firstName} ${member.user.lastName}`}
                  >
                    {member.user.firstName[0]}{member.user.lastName[0]}
                  </div>
                ))}
                {board.members.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold border border-[#1a1a1a]">
                    +{board.members.length - 3}
                  </div>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/5 text-gray-400 text-xs">
              by {board.createdBy.firstName}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
