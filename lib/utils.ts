import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  
  const sorted = [...new Set(dates)].sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )
  
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < sorted.length; i++) {
    const date = new Date(sorted[i])
    date.setHours(0, 0, 0, 0)
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    
    if (date.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getDatesInMonth(year: number, month: number): Date[] {
  const days = getDaysInMonth(year, month)
  return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1))
}

