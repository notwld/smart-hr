"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import axios from "axios"

interface Team {
  id: string
  name: string
  description?: string
}

interface CreateBoardDialogProps {
  onClose: () => void
  onBoardCreated: () => void
}

const BOARD_BACKGROUNDS = [
  { id: 'gradient-blue', name: 'Blue Gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-purple', name: 'Purple Gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient-green', name: 'Green Gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'gradient-orange', name: 'Orange Gradient', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'solid-cyan', name: 'Solid Cyan', value: '#06b6d4' },
  { id: 'solid-blue', name: 'Solid Blue', value: '#3b82f6' },
  { id: 'solid-purple', name: 'Solid Purple', value: '#8b5cf6' },
  { id: 'solid-green', name: 'Solid Green', value: '#10b981' },
]

export default function CreateBoardDialog({ open, onClose, onBoardCreated }: CreateBoardDialogProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    background: BOARD_BACKGROUNDS[0].value,
    visibility: 'PRIVATE' as 'PRIVATE' | 'TEAM' | 'PUBLIC',
    teamId: '',
  })

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams')
      setTeams(response.data.teams || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Board title is required')
      return
    }

    try {
      setLoading(true)

      const payload = {
        ...formData,
        teamId: formData.visibility === 'TEAM' ? formData.teamId : null,
      }

      await axios.post('/api/kanban/boards', payload)

      toast.success('Board created successfully!')
      onBoardCreated()
      onClose()
    } catch (error: any) {
      console.error('Error creating board:', error)
      toast.error(error.response?.data?.error || 'Failed to create board')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent className="bg-[#1a1a1a] border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Board</DialogTitle>
        </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-300">Board Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter board title..."
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
            placeholder="Describe your board..."
            className="bg-[#2a2a2a] border-white/10 text-white placeholder-gray-500 resize-none"
            rows={3}
          />
        </div>

        {/* Background */}
        <div className="space-y-2">
          <Label className="text-gray-300">Background</Label>
          <div className="grid grid-cols-4 gap-2">
            {BOARD_BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, background: bg.value }))}
                className={`h-12 rounded-lg border-2 transition-all ${
                  formData.background === bg.value
                    ? 'border-cyan-500 ring-2 ring-cyan-500/50'
                    : 'border-white/10 hover:border-white/20'
                }`}
                style={{ background: bg.value }}
                title={bg.name}
              />
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div className="space-y-2">
          <Label className="text-gray-300">Visibility</Label>
          <Select
            value={formData.visibility}
            onValueChange={(value: 'PRIVATE' | 'TEAM' | 'PUBLIC') =>
              setFormData(prev => ({ ...prev, visibility: value }))
            }
          >
            <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10">
              <SelectItem value="PRIVATE" className="text-gray-300 hover:text-white hover:bg-white/5">
                Private - Only you can see this board
              </SelectItem>
              <SelectItem value="TEAM" className="text-gray-300 hover:text-white hover:bg-white/5">
                Team - Visible to team members
              </SelectItem>
              <SelectItem value="PUBLIC" className="text-gray-300 hover:text-white hover:bg-white/5">
                Public - Visible to all employees
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Team Selection (only if TEAM visibility) */}
        {formData.visibility === 'TEAM' && (
          <div className="space-y-2">
            <Label className="text-gray-300">Team</Label>
            <Select
              value={formData.teamId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}
            >
              <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-white">
                <SelectValue placeholder="Select a team..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {teams.map((team) => (
                  <SelectItem
                    key={team.id}
                    value={team.id}
                    className="text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 text-gray-300 hover:text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.title.trim()}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Board'}
          </Button>
        </div>
      </form>
    </DialogContent>
    </Dialog>
  )
}
