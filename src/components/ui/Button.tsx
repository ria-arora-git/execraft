'use client'
import React from 'react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
  size?: 'xs' | 'sm' | 'md'
  loading?: boolean
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading
    return (
      <button
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-accent text-white hover:bg-bluePri shadow': variant === 'default',
            'border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white': variant === 'outline',
            'h-8 px-2 text-xs': size === 'xs',
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
          },
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading && <span className="mr-2">Loading...</span>}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
