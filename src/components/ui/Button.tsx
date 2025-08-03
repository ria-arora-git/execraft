import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  color?: 'default' | 'red' | 'green' | 'blue';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', color = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
          {
            'bg-accent text-white hover:bg-accent/90': variant === 'default' && color === 'default',
            'bg-red-600 text-white hover:bg-red-700': variant === 'default' && color === 'red',
            'bg-green-600 text-white hover:bg-green-700': variant === 'default' && color === 'green',
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'default' && color === 'blue',
            'border border-slate-600 bg-transparent text-white hover:bg-slate-800': variant === 'outline',
            'hover:bg-slate-800 text-white': variant === 'ghost',
            'h-10 py-2 px-4': size === 'default',
            'h-9 px-3 rounded-md': size === 'sm',
            'h-11 px-8 rounded-md': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
