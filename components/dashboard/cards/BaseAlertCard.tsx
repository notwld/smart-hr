import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, AlertCircle, Info, CheckCircle, Clock, User, Calendar, Server, Users, Ticket } from "lucide-react"
import { cn } from "@/lib/utils"

interface BaseAlertCardProps {
  title: string
  description: string
  icon: React.ReactNode
  variant?: "info" | "warning" | "success" | "error"
  onDismiss: () => void
  children?: React.ReactNode
  className?: string
}

const variantStyles = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800"
}

const iconColors = {
  info: "text-blue-600",
  warning: "text-yellow-600",
  success: "text-green-600",
  error: "text-red-600"
}

export function BaseAlertCard({
  title,
  description,
  icon,
  variant = "info",
  onDismiss,
  children,
  className
}: BaseAlertCardProps) {
  return (
    <Card className={cn(
      "relative border-l-4 shadow-md hover:shadow-lg transition-all duration-200",
      variantStyles[variant],
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("flex-shrink-0 mt-0.5", iconColors[variant])}>
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{title}</h4>
                <p className="text-xs opacity-90 mb-2">{description}</p>
                {children}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 hover:bg-black/10 ml-2 flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
