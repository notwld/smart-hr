"use client"

import { useState, useEffect } from 'react'
import { Reply, Download, Eye, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChatMessage, ChatParticipant } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface MessageBubbleProps {
  message: ChatMessage
  isCurrentUser: boolean
  showAvatar: boolean
  participants: ChatParticipant[]
  onReply?: (message: ChatMessage) => void
}

export default function MessageBubble({
  message,
  isCurrentUser,
  showAvatar,
  participants,
  onReply
}: MessageBubbleProps) {
  const [senderInfo, setSenderInfo] = useState<any>(null)
  const [readCount, setReadCount] = useState(0)
  const [showReadBy, setShowReadBy] = useState(false)

  // Fetch sender info
  useEffect(() => {
    const fetchSenderInfo = async () => {
      try {
        const response = await fetch(`/api/users/${message.sender_id}`)
        const data = await response.json()
        setSenderInfo(data)
      } catch (error) {
        console.error('Error fetching sender info:', error)
      }
    }

    fetchSenderInfo()
  }, [message.sender_id])

  // Fetch read status for the message
  useEffect(() => {
    const fetchReadStatus = async () => {
      try {
        const response = await fetch(`/api/chat/messages/${message.id}/read-status`)
        const data = await response.json()
        setReadCount(data.length)
      } catch (error) {
        console.error('Error fetching read status:', error)
      }
    }

    if (isCurrentUser) {
      fetchReadStatus()
    }
  }, [message.id, isCurrentUser])

  const handleDownload = () => {
    if (message.file_url) {
      const link = document.createElement('a')
      link.href = message.file_url
      link.download = message.file_name || 'file'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm')
  }

  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM dd, yyyy')
  }

  const isToday = (timestamp: string) => {
    const today = new Date()
    const messageDate = new Date(timestamp)
    return today.toDateString() === messageDate.toDateString()
  }

  return (
    <div className={cn(
      "flex gap-3 group",
      isCurrentUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {showAvatar && !isCurrentUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={senderInfo?.pfp} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {senderInfo?.firstName?.[0]}{senderInfo?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn(
        "flex flex-col max-w-xs lg:max-w-md",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        {/* Sender Name & Time */}
        {showAvatar && (
          <div className={cn(
            "flex items-center gap-2 mb-1",
            isCurrentUser ? "flex-row-reverse" : "flex-row"
          )}>
            {!isCurrentUser && (
              <span className="text-xs font-medium text-gray-900">
                {senderInfo ? `${senderInfo.firstName} ${senderInfo.lastName}` : 'Loading...'}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {isToday(message.created_at) ? formatTime(message.created_at) : formatDate(message.created_at)}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "relative group/message rounded-lg px-3 py-2 break-words",
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-gray-100 text-gray-900",
            message.message_type === 'file' && "border border-gray-200"
          )}
        >
          {/* Reply to message (if exists) */}
          {message.parent_message_id && (
            <div className="mb-2 p-2 bg-black/10 rounded text-xs opacity-75">
              <p>Replying to a message...</p>
            </div>
          )}

          {/* Message Content */}
          {message.message_type === 'text' ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-50 rounded">
                  <Download className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{message.file_name}</p>
                  <p className="text-xs text-gray-500">File attachment</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={handleDownload}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
              {message.content && message.content !== `Shared file: ${message.file_name}` && (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          )}

          {/* Message Actions */}
          <div className={cn(
            "absolute top-0 opacity-0 group-hover/message:opacity-100 transition-opacity",
            isCurrentUser ? "-left-10" : "-right-10"
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 bg-white shadow-sm">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCurrentUser ? "end" : "start"}>
                <DropdownMenuItem onClick={() => onReply?.(message)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                {message.message_type === 'file' && (
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Read Status */}
        {isCurrentUser && readCount > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Eye className="h-3 w-3 text-gray-400" />
            <button
              onClick={() => setShowReadBy(!showReadBy)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {readCount === 1 ? '1 person' : `${readCount} people`} seen
            </button>
          </div>
        )}

        {/* Read By List (expandable) */}
        {showReadBy && isCurrentUser && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs">
            <p className="font-medium mb-1">Read by:</p>
            {/* This would be populated with actual read data */}
            <p className="text-gray-600">Feature coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
} 