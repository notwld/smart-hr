import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Chat-related types matching Prisma schema
export interface ChatRoom {
  id: string
  name: string
  description?: string
  type: 'DIRECT' | 'TEAM' | 'GENERAL'
  teamId?: string
  createdAt: string
  updatedAt: string
  participants?: ChatParticipant[]
  lastMessage?: ChatMessage
  unreadCount?: number
  _count?: {
    messages: number
  }
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
  forwardedFrom?: string
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  sender?: {
    id: string
    firstName: string
    lastName: string
    pfp?: string
  }
  replies?: ChatMessage[]
  reactions?: MessageReaction[]
  mentions?: MessageMention[]
}

export interface ChatParticipant {
  id: string
  roomId: string
  userId: string
  joinedAt: string
  lastReadAt?: string
  isActive: boolean
  user?: {
    id: string
    firstName: string
    lastName: string
    pfp?: string
  }
}

export interface MessageReaction {
  id: string
  messageId: string
  userId: string
  emoji: string
  createdAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
  }
}

export interface MessageMention {
  id: string
  messageId: string
  userId: string
  createdAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
  }
}

export interface MessageReadStatus {
  id: string
  message_id: string
  user_id: string
  read_at: string
} 