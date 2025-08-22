import { useState, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'custom'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'light'
    applyTheme(savedTheme)
  }, [])

  function applyTheme(newTheme: Theme) {
    // Remove ALL theme classes before setting a new one
    document.documentElement.classList.remove('dark', 'custom-theme')

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    }
    if (newTheme === 'custom') {
      document.documentElement.classList.add('custom-theme')
    }

    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  function toggleTheme(newTheme: Theme) {
    applyTheme(newTheme)
  }

  function setCustomColor(variable: string, value: string) {
    document.documentElement.style.setProperty(variable, value)
  }

  return { theme, toggleTheme, setCustomColor }
}
