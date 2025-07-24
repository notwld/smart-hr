"use client"

import { useState } from 'react'
import { useChat } from '@/hooks/useChat'
import ChatRoomList from '@/components/chat/ChatRoomList'
import ChatWindow from '@/components/chat/ChatWindow'
import { Card } from '@/components/ui/card'

export default function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const { chatRooms, loading } = useChat()

  return (
    <div className="flex-1 flex h-screen bg-[#f8f9fa] overflow-hidden">
      <div className="flex w-full">
        {/* Chat Room List */}
        <div className="w-1/3 border-r border-gray-200 bg-white">
          <ChatRoomList
            rooms={chatRooms}
            loading={loading}
            selectedRoomId={selectedRoomId}
            onRoomSelect={setSelectedRoomId}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedRoomId ? (
            <ChatWindow roomId={selectedRoomId} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="space-y-6">
                <Card className="p-8 text-center max-w-md mx-4">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Welcome to Team Chat
                    </h3>
                    <p className="text-gray-500">
                      Select a conversation to start messaging with your team members or create a new direct message.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 