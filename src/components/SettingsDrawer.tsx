'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  X,
  Palette,
  Monitor,
  Sun,
  Moon,
  Check,
  Smartphone,
  Tablet,
  Laptop,
} from 'lucide-react'
import { useTheme, useResponsive } from '@/lib/ThemeProvider'
import { themes, ThemeName, themeNames } from '@/lib/theme-config'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface SettingsDrawerProps {
  className?: string
}

export function SettingsDrawer({ className }: SettingsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, mode, setMode, toggleMode } = useTheme()
  const { isMobile, isTablet, isDesktop } = useResponsive()

  // State for safe window dimensions (avoid SSR issues)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    function updateWindowSize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    updateWindowSize()
    window.addEventListener('resize', updateWindowSize)
    return () => window.removeEventListener('resize', updateWindowSize)
  }, [])

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleModeSelect = (selectedMode: 'light' | 'dark' | 'system') => {
    setMode(selectedMode)
  }

  return (
    <>
      {/* Settings Button */}
      <div className={cn('fixed top-4 right-4 z-50', className)}>
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className={cn(
            'h-10 w-10 rounded-full p-0',
            'bg-white/80 dark:bg-gray-900/80',
            'backdrop-blur-sm border border-gray-200 dark:border-gray-700',
            'hover:bg-white dark:hover:bg-gray-900',
            'transition-all duration-200',
            'shadow-lg hover:shadow-xl'
          )}
          aria-label="Open settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full bg-white dark:bg-gray-900 z-50',
          'border-l border-gray-200 dark:border-gray-700',
          'transform transition-transform duration-300 ease-out',
          'shadow-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          isMobile ? 'w-full' : 'w-80'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="settings-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Settings
          </h2>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Device Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Current Device
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {isMobile && <Smartphone className="h-4 w-4" />}
              {isTablet && <Tablet className="h-4 w-4" />}
              {isDesktop && <Laptop className="h-4 w-4" />}
              <span>
                {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'} ({windowSize.width}px × {windowSize.height}px)
              </span>
            </div>
          </div>

          {/* Theme Mode Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme Mode
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                // { key: 'light', label: 'Light', icon: Sun },
                { key: 'dark', label: 'Dark', icon: Moon },
                { key: 'system', label: 'System', icon: Monitor },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleModeSelect(key as 'light' | 'dark' | 'system')}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200',
                    'hover:bg-gray-50 dark:hover:bg-gray-800',
                    mode === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{label}</span>
                  {mode === key && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {/* <Button
                onClick={toggleMode}
                variant="outline"
                className="w-full justify-start gap-2"
                size="sm"
              >
                {mode === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4" />
                    Toggle to Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    Toggle to Dark Mode
                  </>
                )}
              </Button> */}
            </div>
          </div>

          {/* Current Theme Info */}
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Current Theme Info
            </h3>
            <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
              <div>
                <strong>Name:</strong> {theme.name}
              </div>
              <div>
                <strong>Mode:</strong> {theme.mode}
              </div>
              <div>
                <strong>Primary Color:</strong> {theme.colors.primary[500]}
              </div>
              <div>
                <strong>Background:</strong> {theme.colors.background.main}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsDrawer
