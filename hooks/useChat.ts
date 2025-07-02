import { useState, useEffect, useCallback } from 'react'
import { supabase, ChatRoom, ChatMessage, ChatParticipant, MessageReadStatus } from '@/lib/supabase'
import { useSession } from 'next-auth/react'

export function useChat() {
  const { data: session } = useSession()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch user's chat rooms
  const fetchChatRooms = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_participants!inner(*)
        `)
        .eq('chat_participants.user_id', session.user.id)

      if (error) throw error
      setChatRooms(data || [])
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

    console.log('Creating direct message between:', session.user.id, 'and', otherUserId)

    try {
      // Check if DM already exists
      const { data: existingRoom, error: fetchError } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_participants(user_id)
        `)
        .eq('type', 'direct')

      if (fetchError) {
        console.error('Error fetching existing rooms:', fetchError)
        throw fetchError
      }

      const existing = existingRoom?.find(room => 
        room.chat_participants?.some((p: any) => p.user_id === session.user.id) &&
        room.chat_participants?.some((p: any) => p.user_id === otherUserId)
      )

      if (existing) {
        console.log('Found existing DM room:', existing.id)
        return existing
      }

      // Create new DM room
      console.log('Creating new DM room...')
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: `${session.user.name || 'User'} & ${otherUserName}`,
          type: 'direct'
        })
        .select()
        .single()

      if (roomError) {
        console.error('Error creating room:', roomError)
        throw roomError
      }

      console.log('Created room:', room.id)

      // Add participants
      console.log('Adding participants...')
      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert([
          { room_id: room.id, user_id: session.user.id },
          { room_id: room.id, user_id: otherUserId }
        ])

      if (participantError) {
        console.error('Error adding participants:', participantError)
        throw participantError
      }

      console.log('Successfully created DM room')
      await fetchChatRooms()
      return room
    } catch (error) {
      console.error('Error creating direct message:', error)
      
      // Check if it's a Supabase configuration issue
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Possible Supabase configuration issue. Check your environment variables.')
      }
      
      return null
    }
  }, [session?.user?.id, session?.user?.name, fetchChatRooms])

  // Create team chat room
  const createTeamChatRoom = useCallback(async (teamId: string, teamName: string, memberIds: string[]) => {
    try {
      // Create team chat room
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: `${teamName} Team Chat`,
          description: `Team chat for ${teamName}`,
          type: 'team',
          team_id: teamId
        })
        .select()
        .single()

      if (roomError) throw roomError

      // Add all team members as participants
      const participants = memberIds.map(userId => ({
        room_id: room.id,
        user_id: userId
      }))

      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert(participants)

      if (participantError) throw participantError

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

  // Fetch messages for a room
  const fetchMessages = useCallback(async () => {
    if (!roomId) return

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
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
      const { data, error } = await supabase
        .from('chat_participants')
        .select('*')
        .eq('room_id', roomId)

      if (error) throw error
      setParticipants(data || [])
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

    console.log('Sending message:', { content, roomId, senderId: session.user.id })

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: session.user.id,
          content,
          parent_message_id: parentMessageId,
          message_type: 'text'
        })
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        throw error
      }

      console.log('Message sent successfully:', data)
      
      // Refresh messages to ensure we have the latest
      setTimeout(() => {
        fetchMessages()
      }, 100)

      return data
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    }
  }, [session?.user?.id, roomId, fetchMessages])

  // Send file message
  const sendFileMessage = useCallback(async (file: File, content?: string) => {
    if (!session?.user?.id || !roomId) return

    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `chat-files/${roomId}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath)

      // Send message with file
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: session.user.id,
          content: content || `Shared file: ${file.name}`,
          message_type: 'file',
          file_url: publicUrl,
          file_name: file.name
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error sending file message:', error)
      return null
    }
  }, [session?.user?.id, roomId])

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    if (!session?.user?.id) return

    try {
      const { error } = await supabase
        .from('message_read_status')
        .upsert({
          message_id: messageId,
          user_id: session.user.id
        })

      if (error) throw error
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }, [session?.user?.id])

  // Set up real-time subscription
  useEffect(() => {
    if (!roomId) return

    console.log('Setting up real-time subscription for room:', roomId)

    const subscription = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('Received new message via real-time:', payload)
          const newMessage = payload.new as ChatMessage
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg.id === newMessage.id)
            if (exists) {
              console.log('Message already exists, skipping')
              return prev
            }
            console.log('Adding new message to state')
            return [...prev, newMessage]
          })
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      console.log('Cleaning up subscription for room:', roomId)
      supabase.removeChannel(subscription)
    }
  }, [roomId])

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
    markAsRead,
    refreshMessages: fetchMessages
  }
} 