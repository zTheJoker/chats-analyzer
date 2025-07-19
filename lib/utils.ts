import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { parse, isValid, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse a date string that might be in various formats
 * Returns a valid Date object or null if parsing fails
 */
export function safeDateParse(dateString: string): Date | null {
  if (!dateString || typeof dateString !== 'string') {
    return null
  }

  // Clean up the date string
  const cleanDate = dateString.trim().replace(/[,\[\]]/g, '')
  
  // Common date formats we might encounter
  const formats = [
    // European/International formats (day first) - most common in WhatsApp exports
    'dd/MM/yyyy', 'd/M/yyyy', 'dd/MM/yy', 'd/M/yy',
    'dd-MM-yyyy', 'd-M-yyyy', 'dd-MM-yy', 'd-M-yy',
    'dd.MM.yyyy', 'd.M.yyyy', 'dd.MM.yy', 'd.M.yy',
    
    // US formats (month first)
    'MM/dd/yyyy', 'M/d/yyyy', 'MM/dd/yy', 'M/d/yy',
    'MM-dd-yyyy', 'M-d-yyyy', 'MM-dd-yy', 'M-d-yy',
    'MM.dd.yyyy', 'M.d.yyyy', 'MM.dd.yy', 'M.d.yy',
    
    // ISO formats
    'yyyy-MM-dd', 'yyyy/MM/dd',
  ]

  // Try parsing with date-fns first
  for (const dateFormat of formats) {
    try {
      const parsedDate = parse(cleanDate, dateFormat, new Date())
      if (isValid(parsedDate)) {
        // Handle two-digit years
        if (dateFormat.includes('yy') && !dateFormat.includes('yyyy')) {
          const year = parsedDate.getFullYear()
          // If the year is in the future, subtract 100 years
          if (year > new Date().getFullYear() + 1) {
            parsedDate.setFullYear(year - 100)
          }
        }
        
        // Validate that the date is reasonable (not in the far future)
        if (parsedDate.getFullYear() <= new Date().getFullYear() + 1 && 
            parsedDate.getFullYear() >= 1970) {
          return parsedDate
        }
      }
    } catch {
      continue
    }
  }

  // Fallback: try native Date parsing
  try {
    const nativeDate = new Date(cleanDate)
    if (isValid(nativeDate) && 
        nativeDate.getFullYear() >= 1970 && 
        nativeDate.getFullYear() <= new Date().getFullYear() + 1) {
      return nativeDate
    }
  } catch {
    // Ignore errors from native parsing
  }

  return null
}

/**
 * Safely format a date string for display
 * Returns a formatted date string or a fallback message
 */
export function safeFormatDate(
  dateString: string, 
  options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' },
  fallback: string = 'Unknown date'
): string {
  const date = safeDateParse(dateString)
  
  if (!date) {
    return fallback
  }
  
  try {
    return date.toLocaleDateString('en-US', options)
  } catch {
    return fallback
  }
}

/**
 * Calculate days between a date string and now, safely
 * Returns number of days or 0 if parsing fails
 */
export function safeDateDiff(dateString: string): number {
  const date = safeDateParse(dateString)
  
  if (!date) {
    return 0
  }
  
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - date.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
