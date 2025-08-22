'use client'

import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ButtonProps } from '@/types/types'

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    children,
    variant = 'default',
    size = 'default',
    color = 'default',
    disabled = false,
    loading = false,
    fullWidth = false,
    startIcon,
    endIcon,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          
          // Size variants
          {
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-4 py-2 text-sm': size === 'default',
            'h-11 px-8 text-base': size === 'lg',
            'h-12 px-10 text-lg': size === 'xl',
          },
          
          // Variant styles
          {
            // Default variant
            'bg-gray-900 text-gray-50 shadow hover:bg-gray-900/90 focus-visible:ring-gray-950 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300': 
              variant === 'default' && color === 'default',
            
            // Outline variant
            'border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-gray-950 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300': 
              variant === 'outline' && color === 'default',
            
            // Ghost variant
            'hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300': 
              variant === 'ghost' && color === 'default',
            
            // Secondary variant
            'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:ring-gray-950 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700 dark:focus-visible:ring-gray-300': 
              variant === 'secondary' && color === 'default',
            
            // Destructive variant
            'bg-red-500 text-white shadow hover:bg-red-600 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700 dark:focus-visible:ring-red-300': 
              variant === 'destructive' || color === 'error',
          },
          
          // Color variants
          {
            // Primary color
            'bg-blue-600 text-white shadow hover:bg-blue-700 focus-visible:ring-blue-500': 
              color === 'primary' && variant === 'default',
            'border border-blue-200 text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500': 
              color === 'primary' && variant === 'outline',
            'text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500': 
              color === 'primary' && variant === 'ghost',
            
            // Secondary color
            'bg-purple-600 text-white shadow hover:bg-purple-700 focus-visible:ring-purple-500': 
              color === 'secondary' && variant === 'default',
            'border border-purple-200 text-purple-600 hover:bg-purple-50 focus-visible:ring-purple-500': 
              color === 'secondary' && variant === 'outline',
            'text-purple-600 hover:bg-purple-50 focus-visible:ring-purple-500': 
              color === 'secondary' && variant === 'ghost',
            
            // Success color
            'bg-green-600 text-white shadow hover:bg-green-700 focus-visible:ring-green-500': 
              color === 'success' && variant === 'default',
            'border border-green-200 text-green-600 hover:bg-green-50 focus-visible:ring-green-500': 
              color === 'success' && variant === 'outline',
            'text-green-600 hover:bg-green-50 focus-visible:ring-green-500': 
              color === 'success' && variant === 'ghost',
            
            // Warning color
            'bg-amber-500 text-white shadow hover:bg-amber-600 focus-visible:ring-amber-500': 
              color === 'warning' && variant === 'default',
            'border border-amber-200 text-amber-600 hover:bg-amber-50 focus-visible:ring-amber-500': 
              color === 'warning' && variant === 'outline',
            'text-amber-600 hover:bg-amber-50 focus-visible:ring-amber-500': 
              color === 'warning' && variant === 'ghost',
            
            // Info color
            'bg-cyan-500 text-white shadow hover:bg-cyan-600 focus-visible:ring-cyan-500': 
              color === 'info' && variant === 'default',
            'border border-cyan-200 text-cyan-600 hover:bg-cyan-50 focus-visible:ring-cyan-500': 
              color === 'info' && variant === 'outline',
            'text-cyan-600 hover:bg-cyan-50 focus-visible:ring-cyan-500': 
              color === 'info' && variant === 'ghost',
          },
          
          // Full width
          {
            'w-full': fullWidth,
          },
          
          // Loading state
          {
            'cursor-not-allowed': loading,
          },
          
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        
        {/* Start icon */}
        {!loading && startIcon && (
          <span className="flex-shrink-0">{startIcon}</span>
        )}
        
        {/* Button content */}
        <span className={cn(loading && 'opacity-0')}>{children}</span>
        
        {/* End icon */}
        {!loading && endIcon && (
          <span className="flex-shrink-0">{endIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }