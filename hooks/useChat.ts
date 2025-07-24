import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

export interface ChatRoom {
  id: string
  name: string
  description?: string
  type: 'DIRECT' | 'TEAM'
  teamId?: string
  participants: ChatParticipant[]
  lastMessage?: ChatMessage
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ChatParticipant {
  id: string
  roomId: string
  userId: string
  user: {
    id: string
    firstName: string
    lastName: string
    pfp?: string
  }
  joinedAt: Date
  lastReadAt?: Date
  isActive: boolean
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  content: string
  messageType: 'TEXT' | 'FILE' | 'IMAGE' | 'AUDIO' | 'VIDEO'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  parentMessageId?: string
  parentMessage?: ChatMessage
  replies: ChatMessage[]
  forwardedFrom?: string
  isEdited: boolean
  isDeleted: boolean
  sender: {
    id: string
    firstName: string
    lastName: string
    pfp?: string
  }
  readStatus: MessageReadStatus[]
  createdAt: Date
  updatedAt: Date
}

export interface MessageReadStatus {
  id: string
  messageId: string
  userId: string
  readAt: Date
}

export interface UserPresence {
  userId: string
  isOnline: boolean
  lastSeen: Date
}

export function useChat() {
  const { data: session } = useSession()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch user's chat rooms
  const fetchChatRooms = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/chat/rooms')
      if (!response.ok) throw new Error('Failed to fetch chat rooms')
      
      const data = await response.json()
      setChatRooms(data)
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  // Create a direct message room
  const createDirectMessage = useCallback(async (otherUserId: string, otherUserName: string) => {
    if (!session?.user?.id) {
      console.error('No user session found')
      return null
    }

    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'DIRECT',
          participantIds: [session.user.id, otherUserId],
          name: `${session.user.name || 'User'} & ${otherUserName}`
        })
      })

      if (!response.ok) throw new Error('Failed to create direct message')
      
      const room = await response.json()
      await fetchChatRooms()
      return room
    } catch (error) {
      console.error('Error creating direct message:', error)
      return null
    }
  }, [session?.user?.id, session?.user?.name, fetchChatRooms])

  // Create team chat room
  const createTeamChatRoom = useCallback(async (teamId: string, teamName: string, memberIds: string[]) => {
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'TEAM',
          teamId,
          participantIds: memberIds,
          name: `${teamName} Team Chat`,
          description: `Team chat for ${teamName}`
        })
      })

      if (!response.ok) throw new Error('Failed to create team chat room')
      
      const room = await response.json()
      await fetchChatRooms()
      return room
    } catch (error) {
      console.error('Error creating team chat room:', error)
      return null
    }
  }, [fetchChatRooms])

  useEffect(() => {
    fetchChatRooms()
  }, [fetchChatRooms])

  return {
    chatRooms,
    loading,
    createDirectMessage,
    createTeamChatRoom,
    refreshRooms: fetchChatRooms
  }
}

export function useChatRoom(roomId: string) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState<ChatParticipant[]>([])
  const eventSourceRef = useRef<EventSource | null>(null)

  // Fetch messages for a room
  const fetchMessages = useCallback(async () => {
    if (!roomId) return

    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [roomId])

  // Fetch participants
  const fetchParticipants = useCallback(async () => {
    if (!roomId) return

    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/participants`)
      if (!response.ok) throw new Error('Failed to fetch participants')
      
      const data = await response.json()
      setParticipants(data)
    } catch (error) {
      console.error('Error fetching participants:', error)
    }
  }, [roomId])

  // Send a message
  const sendMessage = useCallback(async (content: string, parentMessageId?: string) => {
    if (!session?.user?.id || !roomId) {
      console.error('Cannot send message: missing session or roomId')
      return null
    }

    try {
      const response = await fetch('/api/chat/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          content,
          messageType: 'TEXT',
          parentMessageId
        })
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      const result = await response.json()
      
      // Add the real message to UI (no optimistic message needed since we don't broadcast to sender)
      setMessages(prev => [...prev, result.message])
      
      return result.message
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    }
  }, [session?.user?.id, roomId])

  // Send file message
  const sendFileMessage = useCallback(async (file: File, content?: string) => {
    if (!session?.user?.id || !roomId) return

    try {
      // Check file size (30MB limit)
      if (file.size > 30 * 1024 * 1024) {
        throw new Error('File size must be less than 30MB')
      }

      // For now, just send a text message about the file
      // In a full implementation, you'd upload the file first
      return await sendMessage(`Shared file: ${file.name}`, undefined)
    } catch (error) {
      console.error('Error sending file message:', error)
      return null
    }
  }, [session?.user?.id, roomId, sendMessage])

  // Edit message
  const editMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      })

      if (!response.ok) throw new Error('Failed to edit message')
      
      const message = await response.json()
      setMessages(prev => 
        prev.map(m => m.id === messageId ? message : m)
      )
    } catch (error) {
      console.error('Error editing message:', error)
    }
  }, [])

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete message')
      
      setMessages(prev => 
        prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m)
      )
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }, [])

  // Forward message
  const forwardMessage = useCallback(async (messageId: string, targetRoomId: string) => {
    try {
      const message = messages.find(m => m.id === messageId)
      if (!message) return

      const response = await fetch('/api/chat/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: targetRoomId,
          content: message.content,
          messageType: message.messageType,
          forwardedFrom: messageId
        })
      })

      if (!response.ok) throw new Error('Failed to forward message')
    } catch (error) {
      console.error('Error forwarding message:', error)
    }
  }, [messages])

  // Reply to message
  const replyToMessage = useCallback(async (parentMessageId: string, content: string) => {
    return await sendMessage(content, parentMessageId)
  }, [sendMessage])

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    if (!session?.user?.id) return

    try {
      await fetch(`/api/chat/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session.user.id })
      })
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }, [session?.user?.id])

  // Set up Server-Sent Events for real-time updates
  useEffect(() => {
    if (!session?.user?.id) return

    const eventSource = new EventSource('/api/chat/socket')
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'new_message' && data.roomId === roomId) {
          setMessages(prev => {
            // Remove optimistic message if it exists
            const filtered = prev.filter(m => !m.id.startsWith('temp-'))
            return [...filtered, data.message]
          })
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
    }

    return () => {
      eventSource.close()
    }
  }, [session?.user?.id, roomId])

  useEffect(() => {
    fetchMessages()
    fetchParticipants()
  }, [fetchMessages, fetchParticipants])

  return {
    messages,
    participants,
    loading,
    sendMessage,
    sendFileMessage,
    editMessage,
    deleteMessage,
    forwardMessage,
    replyToMessage,
    markAsRead,
    refreshMessages: fetchMessages
  }
} 