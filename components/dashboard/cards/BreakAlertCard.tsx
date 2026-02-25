"use client"

import React, { useState } from "react"
import { BaseAlertCard } from "./BaseAlertCard"
import { Coffee } from "lucide-react"
import { safeFormatTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { usePermissions } from "@/contexts/PermissionContext"
import { toast } from "sonner"
import axios from "axios"

interface BreakAlertCardProps {
  attendanceId: string
  user: {
    id: string
    firstName: string
    lastName: string
    position: string
    department: string
  }
  breakStartTime: Date | string
  duration: number
  onDismiss: () => void
  onBreakEnded?: () => void
}

export function BreakAlertCard({ 
  attendanceId, 
  user, 
  breakStartTime, 
  duration, 
  onDismiss,
  onBreakEnded 
}: BreakAlertCardProps) {
  const { data: session } = useSession()
  const { userRoles, hasPermission } = usePermissions()
  const [isEndingBreak, setIsEndingBreak] = useState(false)

  // Check if user is admin
  const isAdmin = 
    session?.user?.role === "ADMIN" || 
    userRoles.includes("Admin") ||
    hasPermission("dashboard.admin")

  const handleEndBreak = async () => {
    if (!isAdmin) {
      toast.error("You don't have permission to end breaks")
      return
    }

    setIsEndingBreak(true)
    try {
      const response = await axios.post("/api/attendance/admin/break-end", {
        attendanceId
      })

      if (response.status === 200) {
        toast.success(response.data.message || "Break ended successfully")
        if (onBreakEnded) {
          onBreakEnded()
        }
      }
    } catch (error: any) {
      console.error("Error ending break:", error)
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to end break. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsEndingBreak(false)
    }
  }

  return (
    <BaseAlertCard
      title={`${user?.firstName ?? ""} ${user?.lastName ?? ""} is on break`.trim() || "On break"}
      description={`${user?.position ?? ""} • ${user?.department ?? ""}`.trim() || "-"}
      icon={<Coffee className="w-4 h-4" />}
      variant="info"
      onDismiss={onDismiss}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">Duration: {duration} minutes</span>
          <span className="text-gray-500">•</span>
          <span>Started at {safeFormatTime(breakStartTime)}</span>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleEndBreak}
            disabled={isEndingBreak}
            className="h-7 text-xs bg-white hover:bg-gray-50 border-blue-300 text-blue-700 hover:text-blue-800"
          >
            {isEndingBreak ? "Ending..." : "End Break"}
          </Button>
        )}
      </div>
    </BaseAlertCard>
  )
}
