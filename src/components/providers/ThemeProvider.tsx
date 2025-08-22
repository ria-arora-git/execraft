'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Theme, defaultThemes, applyTheme } from '@/lib/theme-config'

interface ThemeContextType {
  currentTheme: Theme
  setTheme: (theme: Theme) => void
  isDarkMode: boolean
  toggleDarkMode: () => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load saved theme from localStorage
    const savedThemeId = localStorage.getItem('restaurant-theme')
    const savedDarkMode = localStorage.getItem('restaurant-dark-mode') === 'true'
    
    if (savedThemeId) {
      const theme = defaultThemes.find(t => t.id === savedThemeId)
      if (theme) {
        setCurrentTheme(theme)
      }
    }
    
    setIsDarkMode(savedDarkMode)
  }, [])

  useEffect(() => {
    if (mounted) {
      applyTheme(currentTheme, isDarkMode)
      localStorage.setItem('restaurant-theme', currentTheme.id)
      localStorage.setItem('restaurant-dark-mode', isDarkMode.toString())
    }
  }, [currentTheme, isDarkMode, mounted])

  const handleSetTheme = (theme: Theme) => {
    setCurrentTheme(theme)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme: handleSetTheme,
      isDarkMode,
      toggleDarkMode,
      themes: defaultThemes
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}