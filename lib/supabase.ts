import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Chat-related types
export interface ChatRoom {
  id: string
  name: string
  description?: string
  type: 'team' | 'direct'
  team_id?: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'file'
  file_url?: string
  file_name?: string
  parent_message_id?: string
  created_at: string
  updated_at: string
  sender?: {
    id: string
    first_name: string
    last_name: string
    pfp?: string
  }
  replies?: ChatMessage[]
}

export interface ChatParticipant {
  id: string
  room_id: string
  user_id: string
  joined_at: string
  last_read_at?: string
}

export interface MessageReadStatus {
  id: string
  message_id: string
  user_id: string
  read_at: string
} 