"use client"

import React from "react"
import { Checkbox } from "./checkbox"

interface CheckboxGroupProps {
  children: React.ReactNode
  className?: string
}

interface CheckboxItemProps {
  id: string
  label: string
  description?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

export const CheckboxGroup = ({ children, className = "" }: CheckboxGroupProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  )
}

export const CheckboxItem = ({ 
  id, 
  label, 
  description, 
  checked = false, 
  onCheckedChange,
  disabled = false
}: CheckboxItemProps) => {
  return (
    <div className="flex items-start space-x-3">
      <Checkbox 
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <div>
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  )
} 