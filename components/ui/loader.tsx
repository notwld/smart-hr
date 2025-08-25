"use client"

import { cn } from "@/lib/utils"

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8", 
  lg: "w-12 h-12",
  xl: "w-16 h-16"
}

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg", 
  xl: "text-xl"
}

export function Loader({ size = "md", className, text, fullScreen = false }: LoaderProps) {
  const loaderContent = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      fullScreen && "min-h-screen w-full bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100"
    )}>
      {/* Spinning gradient circle */}
      <div className="relative">
        <div className={cn(
          "animate-spin rounded-full border-4 border-gray-200",
          sizeClasses[size]
        )}>
          <div className={cn(
            "absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-blue-600",
            "animate-spin"
          )} />
        </div>
        
        {/* Inner pulsing dot */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center"
        )}>
          <div className={cn(
            "bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full animate-pulse",
            size === "sm" ? "w-1 h-1" :
            size === "md" ? "w-2 h-2" :
            size === "lg" ? "w-3 h-3" : "w-4 h-4"
          )} />
        </div>
      </div>
      
      {text && (
        <div className="text-center">
          <p className={cn(
            "font-medium text-gray-700 animate-pulse",
            textSizeClasses[size]
          )}>
            {text}
          </p>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
        {loaderContent}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      {loaderContent}
    </div>
  )
}

// Button loader variant
export function ButtonLoader({ size = "sm", className }: { size?: "sm" | "md"; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-white/30 border-t-white",
        size === "sm" ? "w-4 h-4" : "w-5 h-5"
      )} />
      <span>Loading...</span>
    </div>
  )
}

// Overlay loader for forms and pages
export function OverlayLoader({ text }: { text?: string }) {
  return (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <Loader size="lg" text={text || "Loading..."} />
    </div>
  )
}
