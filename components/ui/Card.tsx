import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: '',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

