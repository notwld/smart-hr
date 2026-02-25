import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Safe date formatting for admin/dashboard. Handles null, undefined, and invalid dates. */
export function safeFormatDate(
  value: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  fallback = "—"
): string {
  if (value == null) return fallback
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return fallback
  return d.toLocaleDateString("en-US", options ?? {})
}

/** Safe date+time formatting. */
export function safeFormatDateTime(
  value: Date | string | null | undefined,
  fallback = "—"
): string {
  if (value == null) return fallback
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return fallback
  return d.toLocaleDateString() + " at " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/** Safe time-only formatting. */
export function safeFormatTime(
  value: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  fallback = "—"
): string {
  if (value == null) return fallback
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return fallback
  return d.toLocaleTimeString("en-US", options ?? { hour: "2-digit", minute: "2-digit" })
}
