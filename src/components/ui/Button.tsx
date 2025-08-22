import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center rounded-lg text-sm font-medium 
      transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 
      focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 
      disabled:pointer-events-none disabled:opacity-50
    `

    const variants = {
      default: `
        bg-[var(--color-primary)] text-[var(--color-primary-foreground)] 
        hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)]
        border border-transparent shadow-sm
      `,
      outline: `
        border border-[var(--color-border)] bg-[var(--color-surface)] 
        text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)] 
        hover:text-[var(--color-text-primary)] active:bg-[var(--color-background-tertiary)]
      `,
      secondary: `
        bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] 
        hover:bg-[var(--color-secondary-hover)] active:bg-[var(--color-secondary-active)]
        border border-transparent
      `,
      ghost: `
        bg-transparent text-[var(--color-text-primary)] 
        hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)]
        active:bg-[var(--color-background-tertiary)]
      `,
      destructive: `
        bg-[var(--color-error)] text-[var(--color-primary-foreground)] 
        hover:bg-[var(--color-error)]/90 active:bg-[var(--color-error)]/80
        border border-transparent shadow-sm
      `
    }

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3 text-xs',
      lg: 'h-11 px-8 text-base',
      icon: 'h-10 w-10'
    }

    const classes = `
      ${baseStyles} 
      ${variants[variant]} 
      ${sizes[size]} 
      ${className}
    `.replace(/\s+/g, ' ').trim()

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'