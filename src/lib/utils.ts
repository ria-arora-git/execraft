import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Combines and merges Tailwind CSS classes intelligently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats currency values
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formats date values with various options
 */
export function formatDate(
  date: string | Date,
  options: {
    format?: 'short' | 'medium' | 'long' | 'full'
    includeTime?: boolean
    relative?: boolean
    locale?: string
  } = {}
): string {
  const {
    format = 'medium',
    includeTime = false,
    relative = false,
    locale = 'en-US'
  } = options

  const dateObj = new Date(date)

  if (relative) {
    return formatRelativeTime(dateObj, locale)
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle: format as Intl.DateTimeFormatOptions['dateStyle'],
  }

  if (includeTime) {
    formatOptions.timeStyle = 'short'
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj)
}

/**
 * Formats relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date,
  locale: string = 'en-US'
): string {
  const now = new Date()
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  const absDiff = Math.abs(diffInSeconds)

  if (absDiff < 60) {
    return rtf.format(diffInSeconds, 'second')
  } else if (absDiff < 3600) {
    return rtf.format(Math.floor(diffInSeconds / 60), 'minute')
  } else if (absDiff < 86400) {
    return rtf.format(Math.floor(diffInSeconds / 3600), 'hour')
  } else if (absDiff < 2592000) {
    return rtf.format(Math.floor(diffInSeconds / 86400), 'day')
  } else if (absDiff < 31536000) {
    return rtf.format(Math.floor(diffInSeconds / 2592000), 'month')
  } else {
    return rtf.format(Math.floor(diffInSeconds / 31536000), 'year')
  }
}

/**
 * Formats numbers with appropriate units (K, M, B)
 */
export function formatNumber(
  num: number,
  options: {
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact'
    maximumFractionDigits?: number
    locale?: string
  } = {}
): string {
  const {
    notation = 'compact',
    maximumFractionDigits = 1,
    locale = 'en-US'
  } = options

  return new Intl.NumberFormat(locale, {
    notation,
    maximumFractionDigits,
  }).format(num)
}

/**
 * Generates a unique order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${timestamp}-${randomStr}`
}

/**
 * Generates a unique table token
 */
export function generateTableToken(): string {
  return Math.random().toString(36).slice(2, 12).toUpperCase()
}

/**
 * Checks stock level and returns status
 */
export function checkStockLevel(
  currentStock: number,
  minStock: number
): 'critical' | 'low' | 'medium' | 'good' {
  if (currentStock <= 0) return 'critical'
  if (currentStock <= minStock) return 'low'
  if (currentStock <= minStock * 2) return 'medium'
  return 'good'
}

/**
 * Calculates percentage change
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func.apply(null, args)
    }, wait)
  }
}

/**
 * Throttles a function call
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Truncates text to specified length
 */
export function truncate(
  text: string,
  length: number,
  suffix: string = '...'
): string {
  if (text.length <= length) return text
  return text.slice(0, length - suffix.length) + suffix
}

/**
 * Capitalizes the first letter of each word
 */
export function capitalize(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Converts camelCase to Title Case
 */
export function camelToTitle(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

/**
 * Generates initials from name
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('')
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates phone number format (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

/**
 * Generates a random color
 */
export function generateRandomColor(): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Converts hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Gets contrast color (black or white) for given background
 */
export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return '#000000'

  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255

  return luminance > 0.5 ? '#000000' : '#ffffff'
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  if (typeof obj === 'object') {
    const cloned: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  return obj
}

/**
 * Checks if two objects are deeply equal
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  if (typeof a !== typeof b) return false

  if (typeof a === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
      if (!keysB.includes(key)) return false
      if (!deepEqual(a[key], b[key])) return false
    }

    return true
  }

  return false
}

/**
 * Creates a sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) {
        throw lastError
      }

      // Exponential backoff
      await sleep(delay * Math.pow(2, attempt - 1))
    }
  }

  throw lastError!
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'absolute'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        return true
      } catch (error) {
        return false
      } finally {
        document.body.removeChild(textArea)
      }
    }
  } catch (error) {
    return false
  }
}

/**
 * Downloads data as a file
 */
export function downloadFile(
  data: string | Blob,
  filename: string,
  type: string = 'text/plain'
): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Formats file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Gets the device type based on screen width
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * Checks if device supports touch
 */
export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && 
         ('ontouchstart' in window || navigator.maxTouchPoints > 0)
}

/**
 * Gets safe area insets for mobile devices
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  const style = getComputedStyle(document.documentElement)
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
  }
}

export default {
  cn,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatNumber,
  generateOrderNumber,
  generateTableToken,
  checkStockLevel,
  calculatePercentageChange,
  debounce,
  throttle,
  truncate,
  capitalize,
  camelToTitle,
  getInitials,
  isValidEmail,
  isValidPhone,
  generateRandomColor,
  hexToRgb,
  getContrastColor,
  deepClone,
  deepEqual,
  sleep,
  retry,
  copyToClipboard,
  downloadFile,
  formatFileSize,
  getDeviceType,
  isTouchDevice,
  getSafeAreaInsets,
}