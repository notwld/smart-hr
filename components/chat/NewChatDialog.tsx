"use client"

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useChat } from '@/hooks/useChat'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface NewChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  position: string
  pfp?: string
}

export default function NewChatDialog({ open, onOpenChange }: NewChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const { createDirectMessage } = useChat()
  const { data: session } = useSession()
  const router = useRouter()

  // Fetch employees
  useEffect(() => {
    if (open) {
      fetchEmployees()
    }
  }, [open])

  // Filter employees based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees)
    } else {
      const filtered = employees.filter(employee =>
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredEmployees(filtered)
    }
  }, [employees, searchQuery])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/chat/employees')
      const data = await response.json()
      // Filter out current user
      const filteredData = data.filter((emp: Employee) => emp.id !== session?.user?.id)
      setEmployees(filteredData)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = async (employee: Employee) => {
    try {
      const room = await createDirectMessage(
        employee.id,
        `${employee.firstName} ${employee.lastName}`
      )
      
      if (room) {
        onOpenChange(false)
        setSearchQuery('')
        // The parent component will handle room selection
      }
    } catch (error) {
      console.error('Error creating direct message:', error)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSearchQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Employee List */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {loading ? (
              // Loading skeleton
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'No employees match your search' : 'No employees found'}
                </p>
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleStartChat(employee)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.pfp} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {employee.position} • {employee.department}
                    </p>
                  </div>

                  <Button size="sm" variant="ghost" className="text-xs">
                    Message
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 