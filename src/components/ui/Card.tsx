'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { CardProps } from '@/types/types'

// ============================================================================
// CARD COMPONENTS
// ============================================================================

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, onClick, children, ...props }, ref) => {
    const Component = onClick ? 'button' : 'div'
    
    return (
      <Component
        ref={ref as any}
        className={cn(
          // Base styles
          'rounded-xl border bg-surface-main text-foreground transition-all duration-200',
          
          // Variant styles
          {
            // Default variant
            'border-border shadow-soft': variant === 'default',
            
            // Outlined variant
            'border-border bg-transparent shadow-none hover:shadow-soft': variant === 'outlined',
            
            // Elevated variant
            'border-transparent shadow-medium hover:shadow-large': variant === 'elevated',
          },
          
          // Interactive styles
          {
            'cursor-pointer hover:shadow-medium hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background': 
              interactive || onClick,
            'hover:bg-surface-variant': interactive && !onClick,
          },
          
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        'text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-text-secondary leading-relaxed', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

// ============================================================================
// SPECIALIZED CARD VARIANTS
// ============================================================================

interface StatsCardProps extends Omit<CardProps, 'children'> {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
}

const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, subtitle, icon, trend, className, ...props }, ref) => (
    <Card
      ref={ref}
      variant="elevated"
      className={cn('p-6', className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  trend.isPositive
                    ? 'bg-success/10 text-success'
                    : 'bg-error/10 text-error'
                )}
              >
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-text-disabled mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className="text-xs text-text-disabled mt-1">{trend.label}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
)
StatsCard.displayName = 'StatsCard'

interface ActionCardProps extends CardProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

const ActionCard = forwardRef<HTMLDivElement, ActionCardProps>(
  ({ title, description, icon, actionLabel = 'View', onAction, className, children, ...props }, ref) => (
    <Card
      ref={ref}
      variant="outlined"
      interactive
      className={cn('p-6 hover:border-primary/50', className)}
      onClick={onAction}
      {...props}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate">{title}</h3>
          {description && (
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">{description}</p>
          )}
          {children && (
            <div className="mt-3">{children}</div>
          )}
        </div>
        {onAction && (
          <div className="flex-shrink-0">
            <span className="text-sm font-medium text-primary">{actionLabel} →</span>
          </div>
        )}
      </div>
    </Card>
  )
)
ActionCard.displayName = 'ActionCard'

// ============================================================================
// EXPORTS
// ============================================================================

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatsCard,
  ActionCard,
}

export type { CardProps, StatsCardProps, ActionCardProps }