"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface TimelineSegment {
  type: 'productive' | 'break' | 'overtime'
  startTime: string | Date
  endTime: string | Date | null
  duration: number // in hours
}

interface EmployeeLiveStatsProps {
  attendanceId: string
  user: {
    id: string
    firstName?: string | null
    lastName?: string | null
    position?: string | null
    department?: string | null
    email?: string | null
    pfp?: string | null
  }
  title?: string
  subtitle?: string | null
  avatarInitials?: string | null
  checkInTime: string | Date
  checkOutTime: string | Date | null
  stats: {
    totalWorkingHours: number
    productiveHours: number
    breakHours: number
    overtimeHours: number
  }
  timelineSegments: TimelineSegment[]
  activeBreak: any | null
}

function formatDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.floor((hours - h) * 60)
  const s = Math.floor(((hours - h) * 60 - m) * 60)
  
  if (h > 0 && m > 0) {
    return `${h}h ${m}m`
  } else if (h > 0) {
    return `${h}h`
  } else if (m > 0) {
    return `${m}m ${s}s`
  } else {
    return `${s}s`
  }
}

function formatTime(date: string | Date | null | undefined): string {
  if (date == null) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
}

export function EmployeeLiveStats({
  user,
  title,
  subtitle,
  avatarInitials,
  stats,
  timelineSegments,
  checkInTime
}: EmployeeLiveStatsProps) {
  const checkIn = typeof checkInTime === 'string' ? new Date(checkInTime) : checkInTime
  const now = new Date()
  
  // Calculate the time range for the timeline
  // Start from check-in time, end at now (or checkout if checked out)
  const startTime = checkIn
  const endTime = now
  
  // Get the earliest hour and latest hour for the timeline
  const startHour = startTime.getHours()
  const endHour = endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0)
  
  // Generate time labels (every hour from start to end, wrapping if needed)
  const timeLabels: string[] = []
  const totalHours = endTime.getTime() - startTime.getTime()
  const hoursSpan = Math.ceil(totalHours / (1000 * 60 * 60))
  
  // Generate labels for up to 24 hours (in case of overnight work)
  for (let i = 0; i <= Math.min(hoursSpan, 24); i++) {
    const time = new Date(startTime)
    time.setHours(startTime.getHours() + i)
    timeLabels.push(formatTime(time))
  }

  // Calculate the total duration for percentage calculations
  const totalDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

  // Render timeline segments
  const renderTimelineSegment = (segment: TimelineSegment, index: number) => {
    const segmentStart = typeof segment.startTime === 'string' ? new Date(segment.startTime) : segment.startTime
    const segmentEnd = segment.endTime 
      ? (typeof segment.endTime === 'string' ? new Date(segment.endTime) : segment.endTime)
      : now
    
    const segmentStartOffset = (segmentStart.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    const segmentDuration = segment.duration
    const percentage = (segmentDuration / totalDuration) * 100
    const leftPercentage = (segmentStartOffset / totalDuration) * 100

    const colors = {
      productive: 'bg-green-500',
      break: 'bg-yellow-500',
      overtime: 'bg-blue-500'
    }

    // Format tooltip with duration, start time, and end time
    const typeLabel = segment.type.charAt(0).toUpperCase() + segment.type.slice(1)
    const startTimeFormatted = formatTime(segmentStart)
    const endTimeFormatted = formatTime(segmentEnd)
    const tooltipText = `${typeLabel}: ${formatDuration(segmentDuration)} | Started: ${startTimeFormatted} | Ended: ${endTimeFormatted}`

    return (
      <div
        key={index}
        className={`absolute h-full ${colors[segment.type]}`}
        style={{
          left: `${leftPercentage}%`,
          width: `${percentage}%`,
          minWidth: segmentDuration > 0 ? '2px' : '0'
        }}
        title={tooltipText}
      />
    )
  }

  const displayTitle =
    title ??
    (`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Employee")

  const initialsSource =
    avatarInitials ??
    `${user?.firstName ?? ""}${user?.lastName ?? ""}`.trim()

  const initials =
    initialsSource && initialsSource.length > 0
      ? `${initialsSource.charAt(0)}${initialsSource.charAt(1) ?? ""}`.toUpperCase()
      : "?"

  return (
    <Card className="w-full border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.pfp || undefined} alt={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "User"} />
              <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold">
                {displayTitle}
              </CardTitle>
              {subtitle && (
                <div className="text-xs text-gray-400 mt-0.5">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <div>
              <div className="text-xs text-gray-500">Total Working</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatDuration(stats.totalWorkingHours)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div>
              <div className="text-xs text-gray-500">Productive</div>
              <div className="text-sm font-semibold text-green-700">
                {formatDuration(stats.productiveHours)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div>
              <div className="text-xs text-gray-500">Break</div>
              <div className="text-sm font-semibold text-yellow-700">
                {formatDuration(stats.breakHours)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div>
              <div className="text-xs text-gray-500">Overtime</div>
              <div className="text-sm font-semibold text-blue-700">
                {formatDuration(stats.overtimeHours)}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="space-y-2">
          <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
            {timelineSegments.map((segment, index) => renderTimelineSegment(segment, index))}
          </div>
          
          {/* Time Labels */}
          <div className="flex justify-between text-xs text-gray-500 px-1">
            {timeLabels.slice(0, Math.min(6, timeLabels.length)).map((label, index) => (
              <span key={index}>{label}</span>
            ))}
            {timeLabels.length > 6 && (
              <span>...</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

