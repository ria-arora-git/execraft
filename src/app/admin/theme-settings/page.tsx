'use client'

import React, { useState } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Moon, Sun, Palette, Check, Download, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ThemeSettingsPage() {
  const { currentTheme, setTheme, isDarkMode, toggleDarkMode, themes } = useTheme()
  const [previewTheme, setPreviewTheme] = useState(currentTheme)
  
  const handleThemeChange = (theme: any) => {
    setPreviewTheme(theme)
    setTheme(theme)
    toast.success(`Theme changed to ${theme.name}`)
  }

  const exportTheme = () => {
    const themeData = {
      theme: currentTheme,
      darkMode: isDarkMode
    }
    const dataStr = JSON.stringify(themeData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `restaurant-theme-${currentTheme.id}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Theme exported successfully')
  }

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.theme && data.theme.colors) {
          setTheme(data.theme)
          toast.success('Theme imported successfully')
        } else {
          toast.error('Invalid theme file format')
        }
      } catch (error) {
        toast.error('Failed to import theme')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] transition-colors duration-300">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                Theme Settings
              </h1>
              <p className="text-[var(--color-text-secondary)] mt-1">
                Customize the appearance of your restaurant management system
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={exportTheme}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Theme
              </Button>
              <label className="w-full sm:w-auto">
                <Button variant="outline" className="w-full cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Theme
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importTheme}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Theme Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dark Mode Toggle */}
            <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--color-text-primary)] flex items-center">
                  {isDarkMode ? <Moon className="w-5 h-5 mr-2" /> : <Sun className="w-5 h-5 mr-2" />}
                  Display Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-[var(--color-background-secondary)] rounded-lg">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {isDarkMode ? 'Dark appearance with reduced eye strain' : 'Bright appearance for better visibility'}
                    </p>
                  </div>
                  <Button 
                    onClick={toggleDarkMode}
                    variant="outline"
                    className="ml-4"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Theme Selection */}
            <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--color-text-primary)] flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Color Themes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => handleThemeChange(theme)}
                      className={`
                        relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105
                        ${currentTheme.id === theme.id 
                          ? 'border-[var(--color-primary)] shadow-lg' 
                          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                        }
                      `}
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.accent[500]})`
                      }}
                    >
                      {currentTheme.id === theme.id && (
                        <div className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      
                      <div className="text-white font-medium mb-2">
                        {theme.name}
                      </div>
                      
                      <div className="flex space-x-2">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: theme.colors.primary[500] }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: theme.colors.secondary[500] }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: theme.colors.accent[500] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-[var(--color-surface)] border-[var(--color-border)] sticky top-6">
              <CardHeader>
                <CardTitle className="text-[var(--color-text-primary)]">
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample UI Elements */}
                <div className="space-y-3">
                  <Button className="w-full">
                    Primary Button
                  </Button>
                  <Button variant="outline" className="w-full">
                    Secondary Button
                  </Button>
                  <div className="p-3 bg-[var(--color-background-secondary)] rounded border border-[var(--color-border)]">
                    <h4 className="font-medium text-[var(--color-text-primary)] mb-1">
                      Sample Card
                    </h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      This is how cards will appear with the current theme
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--color-primary)] rounded text-[var(--color-primary-foreground)]">
                    <span className="font-medium">Primary Element</span>
                    <div className="w-4 h-4 bg-[var(--color-primary-foreground)] rounded opacity-75"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--color-accent)] rounded text-[var(--color-accent-foreground)]">
                    <span className="font-medium">Accent Element</span>
                    <div className="w-4 h-4 bg-[var(--color-accent-foreground)] rounded opacity-75"></div>
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-3">
                    Color Palette
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div 
                        className="w-full h-12 rounded border border-[var(--color-border)] mb-1"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                      <p className="text-xs text-[var(--color-text-secondary)]">Primary</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-full h-12 rounded border border-[var(--color-border)] mb-1"
                        style={{ backgroundColor: 'var(--color-secondary)' }}
                      />
                      <p className="text-xs text-[var(--color-text-secondary)]">Secondary</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-full h-12 rounded border border-[var(--color-border)] mb-1"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                      />
                      <p className="text-xs text-[var(--color-text-secondary)]">Accent</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}