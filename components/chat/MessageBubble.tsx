"use client"

import { useState, useEffect } from 'react'
import { Reply, Download, Eye, MoreVertical, Edit, Trash2, Smile, Image as ImageIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ChatMessage, ChatParticipant } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import { toast } from '@/hooks/use-toast'

interface MessageBubbleProps {
  message: ChatMessage
  isCurrentUser: boolean
  showAvatar: boolean
  participants: ChatParticipant[]
  onReply?: (message: ChatMessage) => void
  onEdit?: (messageId: string, newContent: string) => void
  onDelete?: (messageId: string) => void
}

const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉']

export default function MessageBubble({
  message,
  isCurrentUser,
  showAvatar,
  participants,
  onReply,
  onEdit,
  onDelete
}: MessageBubbleProps) {
  const { data: session } = useSession()
  const [senderInfo, setSenderInfo] = useState<any>(null)
  const [readCount, setReadCount] = useState(0)
  const [showReadBy, setShowReadBy] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [reactions, setReactions] = useState<Record<string, any[]>>({})
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [imagePreview, setImagePreview] = useState(false)
  const [parentMessage, setParentMessage] = useState<ChatMessage | null>(null)

  // Fetch sender info
  useEffect(() => {
    const fetchSenderInfo = async () => {
      try {
        const response = await fetch(`/api/users/${message.senderId}`)
        const data = await response.json()
        setSenderInfo(data)
      } catch (error) {
        console.error('Error fetching sender info:', error)
      }
    }

    fetchSenderInfo()
  }, [message.senderId])

  // Fetch parent message if this is a reply
  useEffect(() => {
    const fetchParentMessage = async () => {
      if (message.parentMessageId) {
        try {
          const response = await fetch(`/api/chat/messages/${message.parentMessageId}`)
          if (response.ok) {
            const data = await response.json()
            setParentMessage(data)
          }
        } catch (error) {
          console.error('Error fetching parent message:', error)
        }
      }
    }

    fetchParentMessage()
  }, [message.parentMessageId])

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

  // Fetch reactions for the message
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/chat/messages/${message.id}/reactions`)
        const data = await response.json()
        setReactions(data)
      } catch (error) {
        console.error('Error fetching reactions:', error)
      }
    }

    fetchReactions()
  }, [message.id])

  const handleReaction = async (emoji: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${message.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      })
      
      if (response.ok) {
        // Refresh reactions
        const reactionsResponse = await fetch(`/api/chat/messages/${message.id}/reactions`)
        const data = await reactionsResponse.json()
        setReactions(data)
      }
    } catch (error) {
      console.error('Error handling reaction:', error)
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive"
      })
    }
    setShowEmojiPicker(false)
  }

  const handleEdit = async () => {
    if (!editContent.trim()) return
    
    try {
      const response = await fetch(`/api/chat/messages/${message.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() })
      })
      
      if (response.ok) {
        onEdit?.(message.id, editContent.trim())
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Message edited successfully"
        })
      }
    } catch (error) {
      console.error('Error editing message:', error)
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/chat/messages/${message.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        onDelete?.(message.id)
        toast({
          title: "Success",
          description: "Message deleted successfully"
        })
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      })
    }
  }

  const handleDownload = () => {
    if (message.fileUrl) {
      // Ensure we have the full URL
      const fileUrl = message.fileUrl.startsWith('http') 
        ? message.fileUrl 
        : `${window.location.origin}${message.fileUrl}`;
        
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = message.fileName || 'file'
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatTime = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    if (isNaN(date.getTime())) return 'Invalid time'
    return format(date, 'HH:mm')
  }

  const formatDate = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    if (isNaN(date.getTime())) return 'Invalid date'
    return format(date, 'MMM dd, yyyy')
  }

  const isToday = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    if (isNaN(date.getTime())) return false
    const today = new Date()
    return today.toDateString() === date.toDateString()
  }

  return (
    <div className={cn(
      "group relative hover:bg-gray-50/50 px-4 py-1 transition-colors",
      showAvatar ? "pt-2" : "pt-0"
    )}>
      <div className="flex gap-3">
        {/* Avatar - Always on the left like Discord/Slack */}
        <div className="w-10 shrink-0">
          {showAvatar ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={senderInfo?.pfp} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {senderInfo?.firstName?.[0]}{senderInfo?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 flex items-center justify-center">
              <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatTime(message.createdAt)}
              </span>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header with sender name and timestamp */}
          {showAvatar && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-900">
                {senderInfo ? `${senderInfo.firstName} ${senderInfo.lastName}` : 'Loading...'}
              </span>
              <span className="text-xs text-gray-500">
                {isToday(message.createdAt) ? formatTime(message.createdAt) : formatDate(message.createdAt)}
              </span>
              {message.isEdited && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>
          )}

          {/* Reply reference */}
          {message.parentMessageId && parentMessage && (
            <div className="mb-2 p-2 bg-gray-100 border-l-2 border-blue-400 rounded text-sm">
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <Reply className="h-3 w-3" />
                Replying to {parentMessage.sender?.firstName || 'Unknown'}
              </div>
              <div className="text-gray-600 truncate">
                {parentMessage.content || 'File attachment'}
              </div>
            </div>
          )}

          {/* Message body */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] text-sm resize-none"
                placeholder="Edit your message..."
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit} disabled={!editContent.trim()}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setIsEditing(false)
                  setEditContent(message.content)
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : message.isDeleted ? (
            <div className="italic text-gray-500 text-sm">
              <Trash2 className="h-4 w-4 inline mr-1" />
              This message was deleted
            </div>
          ) : (
            <div className="space-y-2">
              {/* Text content */}
              {message.content && (
                <div className="text-sm text-gray-900 break-words whitespace-pre-wrap">
                  {message.content}
                </div>
              )}

              {/* Image preview */}
              {message.messageType === 'IMAGE' && message.fileUrl && (
                <div className="mt-2">
                  <div 
                    className="relative inline-block cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors"
                    onClick={() => setImagePreview(true)}
                  >
                    <img 
                      src={message.fileUrl.startsWith('http') ? message.fileUrl : `${window.location.origin}${message.fileUrl}`}
                      alt={message.fileName || 'Image'}
                      className="max-w-sm max-h-80 object-cover"
                      onError={(e) => {
                        console.error('Failed to load image:', message.fileUrl)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
                        <ImageIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  {message.fileName && (
                    <div className="text-xs text-gray-500 mt-1">{message.fileName}</div>
                  )}
                </div>
              )}

              {/* File attachment */}
              {message.messageType === 'FILE' && message.fileUrl && (
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3 max-w-sm">
                  <div className="p-2 bg-blue-100 rounded">
                    <Download className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {message.fileName || 'File attachment'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {message.fileSize && `${(message.fileSize / 1024).toFixed(1)} KB`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-blue-100"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Reactions */}
          {Object.keys(reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(reactions).map(([emoji, users]) => (
                <Button
                  key={emoji}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 py-0 text-xs gap-1 hover:bg-gray-100 border-gray-200"
                  onClick={() => handleReaction(emoji)}
                >
                  <span>{emoji}</span>
                  <span className="text-gray-600">{users.length}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Read status for current user */}
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
        </div>

        {/* Action buttons - Appear on hover like Discord */}
        {!message.isDeleted && (
          <div className="absolute -top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-lg shadow-sm flex">
            {/* Emoji reaction */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-l-lg rounded-r-none border-r border-gray-200"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="grid grid-cols-4 gap-1">
                  {commonEmojis.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-lg hover:bg-gray-100"
                      onClick={() => handleReaction(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-r-lg rounded-l-none"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onReply?.(message)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                {isCurrentUser && message.messageType === 'TEXT' && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit message
                  </DropdownMenuItem>
                )}
                {isCurrentUser && (
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete message
                  </DropdownMenuItem>
                )}
                {(message.messageType === 'FILE' || message.messageType === 'IMAGE') && (
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Image preview modal */}
      {message.messageType === 'IMAGE' && (
        <Dialog open={imagePreview} onOpenChange={setImagePreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-left">
                {message.fileName || 'Image'}
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-6 pt-2">
              <img 
                src={message.fileUrl?.startsWith('http') ? message.fileUrl : `${window.location.origin}${message.fileUrl}`}
                alt={message.fileName || 'Image'}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Read by list */}
      {showReadBy && isCurrentUser && (
        <div className="mt-2 ml-13 p-3 bg-gray-50 rounded-lg text-xs border border-gray-200">
          <p className="font-medium mb-1 text-gray-700">Read by:</p>
          <p className="text-gray-600">Read status details coming soon...</p>
        </div>
      )}
    </div>
  )
} 