"use client"

import { useState, useEffect } from 'react'
import { Search, Plus, Users, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatRoom } from '@/lib/supabase'
import NewChatDialog from './NewChatDialog'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

interface ChatRoomListProps {
  rooms: ChatRoom[]
  loading: boolean
  selectedRoomId: string | null
  onRoomSelect: (roomId: string) => void
}

export default function ChatRoomList({ 
  rooms, 
  loading, 
  selectedRoomId, 
  onRoomSelect 
}: ChatRoomListProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([])

  // Get receiver name for direct messages
  const getReceiverName = (room: ChatRoom) => {
    if (room.type !== 'DIRECT' || !room.participants) return room.name
    
    const currentUserId = session?.user?.id
    
    if (!currentUserId) return room.name
    
    // Find the other participant (not the current user)
    const receiver = room.participants.find(p => p.userId !== currentUserId)
    
    if (receiver && receiver.user) {
      return `${receiver.user.firstName} ${receiver.user.lastName}`
    }
    
    return room.name
  }

  // Filter rooms based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRooms(rooms)
    } else {
      const filtered = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRooms(filtered)
    }
  }, [rooms, searchQuery])

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
        
        {/* Room List Skeleton */}
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-primary/10"
            onClick={() => setShowNewChatDialog(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <MessageCircle className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNewChatDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors",
                  selectedRoomId === room.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-gray-50"
                )}
              >
                {/* Room Avatar */}
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                                      <AvatarFallback className="bg-primary/10 text-primary">
                    {room.type === 'TEAM' ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      getReceiverName(room).split(' ').slice(0, 2).map(n => n[0]).join('')
                    )}
                  </AvatarFallback>
                  </Avatar>
                  {room.type === 'TEAM' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Room Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                                      <h3 className="text-sm font-medium text-gray-900 truncate">
                    {room.type === 'DIRECT' ? getReceiverName(room) : room.name}
                  </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(room.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">
                      {room.type === 'TEAM' ? room.description : 'Direct message'}
                    </p>
                    {/* Unread badge - placeholder for now */}
                    {/* <Badge variant="destructive" className="h-5 text-xs">
                      3
                    </Badge> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      <NewChatDialog
        open={showNewChatDialog}
        onOpenChange={setShowNewChatDialog}
      />
    </div>
  )
} 