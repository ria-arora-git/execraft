'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Theme, ThemeMode, ThemeContextType } from '@/types/types'
import { lightTheme, darkTheme, restaurantTheme, applyThemeToDocument, getSystemTheme, ThemeName, getTheme } from '@/lib/theme-config'

// ============================================================================
// THEME CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// ============================================================================
// THEME PROVIDER
// ============================================================================

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeName
  defaultMode?: ThemeMode
  storageKey?: string
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'restaurant',
  defaultMode = 'system',
  storageKey = 'restaurant-theme'
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme(defaultTheme))
  const [mode, setMode] = useState<ThemeMode>(defaultMode)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize theme from storage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const storedData = localStorage.getItem(storageKey)
        
        if (storedData) {
          const { themeName, mode: storedMode } = JSON.parse(storedData)
          const theme = getTheme(themeName as ThemeName)
          setCurrentTheme(theme)
          setMode(storedMode)
        } else {
          // Set system theme if no stored preference
          const systemTheme = getSystemTheme()
          setMode('system')
          setCurrentTheme(systemTheme === 'dark' ? darkTheme : lightTheme)
        }
      } catch (error) {
        console.warn('Failed to load theme from storage:', error)
        setCurrentTheme(getTheme(defaultTheme))
        setMode(defaultMode)
      } finally {
        setIsLoading(false)
      }
    }

    initializeTheme()
  }, [defaultTheme, defaultMode, storageKey])

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? darkTheme : lightTheme
      setCurrentTheme(systemTheme)
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [mode])

  // Apply theme to document
  useEffect(() => {
    if (!isLoading) {
      applyThemeToDocument(currentTheme)
    }
  }, [currentTheme, isLoading])

  // Save theme preference to storage
  const saveThemePreference = useCallback((themeName: ThemeName, themeMode: ThemeMode) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        themeName,
        mode: themeMode,
      }))
    } catch (error) {
      console.warn('Failed to save theme preference:', error)
    }
  }, [storageKey])

  // Set theme mode
  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode)

    let newTheme: Theme
    
    switch (newMode) {
      case 'light':
        newTheme = lightTheme
        break
      case 'dark':
        newTheme = darkTheme
        break
      case 'system':
        newTheme = getSystemTheme() === 'dark' ? darkTheme : lightTheme
        break
      default:
        newTheme = currentTheme
    }

    setCurrentTheme(newTheme)
    
    // Determine theme name for storage
    const themeName: ThemeName = 
      newTheme === restaurantTheme ? 'restaurant' :
      newTheme === darkTheme ? 'dark' : 'light'
    
    saveThemePreference(themeName, newMode)
  }, [currentTheme, saveThemePreference])

  // Toggle between light and dark modes
  const toggleMode = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light'
    setThemeMode(newMode)
  }, [mode, setThemeMode])

  // Set specific theme
  const setTheme = useCallback((themeName: ThemeName) => {
    const newTheme = getTheme(themeName)
    setCurrentTheme(newTheme)
    
    // Determine appropriate mode based on theme
    const themeMode: ThemeMode = 
      themeName === 'light' ? 'light' :
      themeName === 'dark' ? 'dark' : 
      newTheme.mode

    setMode(themeMode)
    saveThemePreference(themeName, themeMode)
  }, [saveThemePreference])

  const contextValue: ThemeContextType = {
    theme: currentTheme,
    mode,
    setMode: setThemeMode,
    toggleMode,
    isLoading,
  }

  // Add setTheme to context value
  const extendedContextValue = {
    ...contextValue,
    setTheme,
  }

  return (
    <ThemeContext.Provider value={extendedContextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// ============================================================================
// THEME HOOK
// ============================================================================

export function useTheme() {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}

// ============================================================================
// THEME UTILITIES
// ============================================================================

export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    updateSystemTheme()
    mediaQuery.addEventListener('change', updateSystemTheme)
    
    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme)
    }
  }, [])

  return systemTheme
}

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    
    const updateMatches = () => {
      setMatches(mediaQuery.matches)
    }

    updateMatches()
    mediaQuery.addEventListener('change', updateMatches)
    
    return () => {
      mediaQuery.removeEventListener('change', updateMatches)
    }
  }, [query])

  return matches
}

// ============================================================================
// RESPONSIVE HOOKS
// ============================================================================

export const useResponsive = () => {
  const isSm = useMediaQuery('(min-width: 640px)')
  const isMd = useMediaQuery('(min-width: 768px)')
  const isLg = useMediaQuery('(min-width: 1024px)')
  const isXl = useMediaQuery('(min-width: 1280px)')
  const is2xl = useMediaQuery('(min-width: 1536px)')

  return {
    isMobile: !isSm,
    isTablet: isSm && !isLg,
    isDesktop: isLg,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
  }
}

export const useBreakpoint = (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl') => {
  const breakpoints = {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)', 
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
  }

  return useMediaQuery(breakpoints[breakpoint])
}

export default ThemeProvider