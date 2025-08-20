"use client"

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, MoreVertical, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useChatRoom } from '@/hooks/useChat'
import { useSession } from 'next-auth/react'
import MessageBubble from './MessageBubble'
import FileUpload from './FileUpload'

interface ChatWindowProps {
  roomId: string
}

export default function ChatWindow({ roomId }: ChatWindowProps) {
  const { data: session } = useSession()
  const [message, setMessage] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [roomInfo, setRoomInfo] = useState<any>(null)
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    messages, 
    participants, 
    loading, 
    sendMessage, 
    sendFileMessage,
    markAsRead 
  } = useChatRoom(roomId)

  // Fetch room info
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const response = await fetch(`/api/chat/rooms/${roomId}`)
        const data = await response.json()
        setRoomInfo(data)
      } catch (error) {
        console.error('Error fetching room info:', error)
      }
    }

    if (roomId) {
      fetchRoomInfo()
    }
  }, [roomId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark messages as read when they come into view
  useEffect(() => {
    if (messages.length > 0 && session?.user?.id) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.senderId !== session.user.id) {
        markAsRead(lastMessage.id)
      }
    }
  }, [messages, session?.user?.id, markAsRead])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const messageData = {
      content: message.trim(),
      parentMessageId: replyingTo?.id
    }

    const success = await sendMessage(messageData.content, messageData.parentMessageId)
    if (success) {
      setMessage('')
      setReplyingTo(null)
    }
  }

  const handleReply = (messageToReply: any) => {
    setReplyingTo(messageToReply)
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
  }

  const handleEditMessage = (messageId: string, newContent: string) => {
    // Refresh messages after edit
    // This would typically be handled by real-time updates
  }

  const handleDeleteMessage = (messageId: string) => {
    // Refresh messages after delete
    // This would typically be handled by real-time updates
  }

  const handleFileUpload = async (file: File) => {
    const success = await sendFileMessage(file)
    if (success) {
      setShowFileUpload(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        
        {/* Messages Skeleton */}
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-xs space-y-2 ${i % 2 === 0 ? 'order-1' : 'order-2'}`}>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-12 w-48 rounded-lg" />
              </div>
              {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full order-2 ml-2" />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary">
                {roomInfo?.type === 'team' ? (
                  <Users className="h-5 w-5" />
                ) : (
                  roomInfo?.name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('') || 'DM'
                )}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {roomInfo?.name || 'Loading...'}
              </h3>
              <p className="text-xs text-gray-500">
                {roomInfo?.type === 'team' 
                  ? `${participants.length} members` 
                  : 'Direct message'
                }
              </p>
            </div>
          </div>

          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="min-h-full">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  No messages yet. Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            <div className="pb-4">
              {messages.map((msg, index) => {
                const isCurrentUser = msg.senderId === session?.user?.id
                const prevMessage = index > 0 ? messages[index - 1] : null
                const showAvatar = !prevMessage || 
                  prevMessage.senderId !== msg.senderId ||
                  (new Date(msg.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) > 300000 // 5 minutes
                
                return (
                  <MessageBubble
                    key={msg.id}
                    message={{
                      ...msg,
                      createdAt: msg.createdAt.toString(),
                      updatedAt: msg.updatedAt.toString(),
                      replies: msg.replies?.map(reply => ({
                        ...reply,
                        createdAt: reply.createdAt.toString(),
                        updatedAt: reply.updatedAt.toString()
                      })) || [],
                      reactions: msg.reactions || [],
                      mentions: msg.mentions || []
                    }}
                    isCurrentUser={isCurrentUser}
                    showAvatar={showAvatar}
                    participants={participants.map(p => ({
                      ...p,
                      joinedAt: p.joinedAt.toString(),
                      lastReadAt: p.lastReadAt?.toString()
                    }))}
                    onReply={handleReply}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                  />
                )
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-primary">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">
                Replying to {replyingTo.sender?.firstName} {replyingTo.sender?.lastName}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={handleCancelReply}
              >
                ✕
              </Button>
            </div>
            <p className="text-sm text-gray-600 truncate">{replyingTo.content}</p>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 w-9 p-0 shrink-0"
            onClick={() => setShowFileUpload(true)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="resize-none border-gray-300 focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!message.trim()}
            className="h-9 px-3 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* File Upload Modal */}
        {showFileUpload && (
          <FileUpload
            onFileSelect={handleFileUpload}
            onClose={() => setShowFileUpload(false)}
          />
        )}
      </div>
    </div>
  )
} 