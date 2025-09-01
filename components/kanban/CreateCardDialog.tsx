"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import axios from "axios"

interface User {
  id: string
  firstName: string
  lastName: string
}

interface CreateCardDialogProps {
  open: boolean
  onClose: () => void
  listId: string
  onCardCreated: () => void
  boardMembers: User[]
}

export default function CreateCardDialog({
  open,
  onClose,
  listId,
  onCardCreated,
  boardMembers
}: CreateCardDialogProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    assignedToId: '',
    dueDate: undefined as Date | undefined,
    labels: [] as string[],
  })
  const [newLabel, setNewLabel] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Card title is required')
      return
    }

    try {
      setLoading(true)

      await axios.post('/api/kanban/cards', {
        ...formData,
        listId,
        dueDate: formData.dueDate?.toISOString(),
      })

      toast.success('Card created successfully!')
      onCardCreated()
      handleClose()
    } catch (error: any) {
      console.error('Error creating card:', error)
      toast.error(error.response?.data?.error || 'Failed to create card')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      assignedToId: '',
      dueDate: undefined,
      labels: [],
    })
    setNewLabel('')
    onClose()
  }

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }))
      setNewLabel('')
    }
  }

  const removeLabel = (label: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(l => l !== label)
    }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent className="bg-[#1a1a1a] border-white/10 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Card</DialogTitle>
        </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-300">Card Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter card title..."
            className="bg-[#2a2a2a] border-white/10 text-white placeholder-gray-500"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the card..."
            className="bg-[#2a2a2a] border-white/10 text-white placeholder-gray-500 resize-none"
            rows={3}
          />
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-gray-300">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') =>
              setFormData(prev => ({ ...prev, priority: value }))
            }
          >
            <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10">
              <SelectItem value="LOW" className="text-gray-300 hover:text-white hover:bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Low Priority
                </div>
              </SelectItem>
              <SelectItem value="MEDIUM" className="text-gray-300 hover:text-white hover:bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  Medium Priority
                </div>
              </SelectItem>
              <SelectItem value="HIGH" className="text-gray-300 hover:text-white hover:bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  High Priority
                </div>
              </SelectItem>
              <SelectItem value="URGENT" className="text-gray-300 hover:text-white hover:bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Urgent
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assign To */}
        <div className="space-y-2">
          <Label className="text-gray-300">Assign To (Optional)</Label>
          <Select
            value={formData.assignedToId || 'unassigned'}
            onValueChange={(value) => setFormData(prev => ({
              ...prev,
              assignedToId: value === 'unassigned' ? null : value
            }))}
          >
            <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-white">
              <SelectValue placeholder="Select a team member..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10">
              <SelectItem value="unassigned" className="text-gray-300 hover:text-white hover:bg-white/5">
                Unassigned
              </SelectItem>
              {boardMembers.map((member) => (
                <SelectItem
                  key={member.id}
                  value={member.id}
                  className="text-gray-300 hover:text-white hover:bg-white/5"
                >
                  {member.firstName} {member.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label className="text-gray-300">Due Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-[#2a2a2a] border-white/10 text-white hover:bg-[#3a3a3a]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-white/10">
              <Calendar
                mode="single"
                selected={formData.dueDate}
                onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                initialFocus
                className="bg-[#1a1a1a] text-white"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Labels */}
        <div className="space-y-2">
          <Label className="text-gray-300">Labels (Optional)</Label>
          <div className="flex gap-2">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Add a label..."
              className="bg-[#2a2a2a] border-white/10 text-white placeholder-gray-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addLabel()
                }
              }}
            />
            <Button
              type="button"
              onClick={addLabel}
              variant="outline"
              className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            >
              Add
            </Button>
          </div>
          {formData.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.labels.map((label, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-cyan-500/20 text-cyan-400 flex items-center gap-1"
                >
                  {label}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-400"
                    onClick={() => removeLabel(label)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="flex-1 text-gray-300 hover:text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.title.trim()}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Card'}
          </Button>
        </div>
      </form>
    </DialogContent>
    </Dialog>
  )
}
