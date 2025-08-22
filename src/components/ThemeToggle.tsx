'use client'
import { useTheme } from '@/hooks/useTheme'
import { useState } from 'react'

export default function ThemeToggle() {
  const { theme, toggleTheme, setCustomColor } = useTheme()
  const [customBg, setCustomBg] = useState('#fffbe0')
  const [customPrimary, setCustomPrimary] = useState('#bc8034')

  function applyCustomTheme() {
    setCustomColor('--custom-bg', customBg)
    setCustomColor('--custom-primary', customPrimary)
    toggleTheme('custom')
  }

  return (
    <div className="flex flex-col gap-2 p-4 text-sm">
      <div className="flex gap-2">
        {/* <button
          onClick={() => toggleTheme('light')}
          className={`px-3 py-1 rounded ${theme === 'light' ? 'bg-accent text-white' : 'bg-gray-200 text-text'}`}
        >
          Light
        </button> */}
        <button
          onClick={() => toggleTheme('dark')}
          className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-accent text-white' : 'bg-gray-200 text-text'}`}
        >
          Dark
        </button>
        <button
          onClick={applyCustomTheme}
          className={`px-3 py-1 rounded ${theme === 'custom' ? 'bg-accent text-white' : 'bg-gray-200 text-text'}`}
        >
          Custom
        </button>
      </div>
      {theme === 'custom' && (
        <div className="flex gap-4 mt-2 items-center">
          <div>
            <span className="text-sm text-text">Background:</span>
            <input
              type="color"
              value={customBg}
              onChange={e => setCustomBg(e.target.value)}
              className="ml-2"
            />
          </div>
          <div>
            <span className="text-sm text-text">Primary:</span>
            <input
              type="color"
              value={customPrimary}
              onChange={e => setCustomPrimary(e.target.value)}
              className="ml-2"
            />
          </div>
        </div>
      )}
    </div>
  )
}
