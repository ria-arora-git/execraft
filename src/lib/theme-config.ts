
// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ColorPalette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface SemanticColor {
  light: string
  main: string
  dark: string
  contrastText: string
}

export interface SemanticColors {
  success: SemanticColor
  error: SemanticColor
  warning: SemanticColor
  info: SemanticColor
}

export interface BackgroundColors {
  main: string
  paper: string
  default: string
}

export interface SurfaceColors {
  main: string
  variant: string
}

export interface TextColors {
  primary: string
  secondary: string
  disabled: string
  inverse: string
}

export interface BorderColors {
  main: string
  light: string
  dark: string
}

export interface ThemeColors {
  primary: ColorPalette
  secondary: ColorPalette
  background: BackgroundColors
  surface: SurfaceColors
  text: TextColors
  border: BorderColors
  semantic: SemanticColors
}

export interface Theme {
  name: string
  mode: 'light' | 'dark'
  colors: ThemeColors
  spacing: Record<string, string>
  typography: {
    fontFamily: Record<string, string[]>
    fontSize: Record<string, [string, { lineHeight: string; letterSpacing: string }]>
    fontWeight: Record<string, string>
  }
  shadows: Record<string, string>
  borderRadius: Record<string, string>
  breakpoints: Record<string, string>
  zIndex: Record<string, number>
}

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeName = 'light' | 'dark' | 'restaurant'

// ============================================================================
// COLOR PALETTES
// ============================================================================

const bluePalette: ColorPalette = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
}

const slatePalette: ColorPalette = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
}

const emeraldPalette: ColorPalette = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
  950: '#022c22',
}

const redPalette: ColorPalette = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a',
}

const amberPalette: ColorPalette = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
  950: '#451a03',
}

const cyanPalette: ColorPalette = {
  50: '#ecfeff',
  100: '#cffafe',
  200: '#a5f3fc',
  300: '#67e8f9',
  400: '#22d3ee',
  500: '#06b6d4',
  600: '#0891b2',
  700: '#0e7490',
  800: '#155e75',
  900: '#164e63',
  950: '#083344',
}

// ============================================================================
// SEMANTIC COLORS
// ============================================================================

const semanticColors: SemanticColors = {
  success: {
    light: emeraldPalette[400],
    main: emeraldPalette[500],
    dark: emeraldPalette[600],
    contrastText: '#ffffff',
  },
  error: {
    light: redPalette[400],
    main: redPalette[500],
    dark: redPalette[600],
    contrastText: '#ffffff',
  },
  warning: {
    light: amberPalette[400],
    main: amberPalette[500],
    dark: amberPalette[600],
    contrastText: '#000000',
  },
  info: {
    light: cyanPalette[400],
    main: cyanPalette[500],
    dark: cyanPalette[600],
    contrastText: '#ffffff',
  },
}

// ============================================================================
// BASE THEME CONFIGURATION
// ============================================================================

const baseTheme = {
  spacing: {
    xs: '0.5rem',     // 8px
    sm: '0.75rem',    // 12px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '5rem',    // 80px
    '5xl': '6rem',    // 96px
    '6xl': '8rem',    // 128px
  },
  typography: {
    fontFamily: {
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        'Fira Sans',
        'Droid Sans',
        'Helvetica Neue',
        'sans-serif',
      ],
      serif: [
        'ui-serif',
        'Georgia',
        'Cambria',
        'Times New Roman',
        'Times',
        'serif',
      ],
      mono: [
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace',
      ],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
      sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
      base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
      lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
      xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
      '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
      '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
    } as Record<string, [string, { lineHeight: string; letterSpacing: string }]>,
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  zIndex: {
    hide: -1,
    auto: 0,
    base: 1,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
}

// ============================================================================
// LIGHT THEME
// ============================================================================

export const lightTheme: Theme = {
  name: 'Light',
  mode: 'light',
  colors: {
    primary: bluePalette,
    secondary: slatePalette,
    background: {
      main: '#ffffff',
      paper: '#f8fafc',
      default: '#ffffff',
    },
    surface: {
      main: '#ffffff',
      variant: '#f1f5f9',
    },
    text: {
      primary: slatePalette[900],
      secondary: slatePalette[600],
      disabled: slatePalette[400],
      inverse: '#ffffff',
    },
    border: {
      main: slatePalette[200],
      light: slatePalette[100],
      dark: slatePalette[300],
    },
    semantic: semanticColors,
  },
  ...baseTheme,
}

// ============================================================================
// DARK THEME
// ============================================================================

export const darkTheme: Theme = {
  name: 'Dark',
  mode: 'dark',
  colors: {
    primary: bluePalette,
    secondary: slatePalette,
    background: {
      main: slatePalette[950],
      paper: slatePalette[900],
      default: slatePalette[950],
    },
    surface: {
      main: slatePalette[900],
      variant: slatePalette[800],
    },
    text: {
      primary: slatePalette[50],
      secondary: slatePalette[300],
      disabled: slatePalette[500],
      inverse: slatePalette[900],
    },
    border: {
      main: slatePalette[700],
      light: slatePalette[800],
      dark: slatePalette[600],
    },
    semantic: semanticColors,
  },
  ...baseTheme,
}

// ============================================================================
// RESTAURANT BLUE THEME (Custom)
// ============================================================================

export const restaurantTheme: Theme = {
  name: 'Restaurant Blue',
  mode: 'dark',
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    secondary: slatePalette,
    background: {
      main: '#101C2C',      // blueDark
      paper: '#162346',     // blueBase
      default: '#101C2C',
    },
    surface: {
      main: '#162346',      // blueBase
      variant: '#1E3A8A',   // bluePri
    },
    text: {
      primary: '#ffffff',
      secondary: '#94a3b8', // slate400
      disabled: '#475569',  // slate600
      inverse: '#101C2C',
    },
    border: {
      main: '#334155',      // slate700
      light: '#475569',     // slate600
      dark: '#1e293b',
    },
    semantic: semanticColors,
  },
  ...baseTheme,
}

// ============================================================================
// THEME VARIANTS
// ============================================================================

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  restaurant: restaurantTheme,
} as const

export const themeList = Object.values(themes)
export const themeNames = Object.keys(themes) as ThemeName[]

// ============================================================================
// THEME UTILITIES
// ============================================================================

export const getTheme = (name: ThemeName): Theme => {
  return themes[name] || lightTheme
}

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export const applyThemeToDocument = (theme: Theme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  
  // Apply CSS custom properties
  root.style.setProperty('--color-primary-50', theme.colors.primary[50])
  root.style.setProperty('--color-primary-100', theme.colors.primary[100])
  root.style.setProperty('--color-primary-200', theme.colors.primary[200])
  root.style.setProperty('--color-primary-300', theme.colors.primary[300])
  root.style.setProperty('--color-primary-400', theme.colors.primary[400])
  root.style.setProperty('--color-primary-500', theme.colors.primary[500])
  root.style.setProperty('--color-primary-600', theme.colors.primary[600])
  root.style.setProperty('--color-primary-700', theme.colors.primary[700])
  root.style.setProperty('--color-primary-800', theme.colors.primary[800])
  root.style.setProperty('--color-primary-900', theme.colors.primary[900])
  root.style.setProperty('--color-primary-950', theme.colors.primary[950])
  
  root.style.setProperty('--color-background-main', theme.colors.background.main)
  root.style.setProperty('--color-background-paper', theme.colors.background.paper)
  root.style.setProperty('--color-background-default', theme.colors.background.default)
  
  root.style.setProperty('--color-surface-main', theme.colors.surface.main)
  root.style.setProperty('--color-surface-variant', theme.colors.surface.variant)
  
  root.style.setProperty('--color-text-primary', theme.colors.text.primary)
  root.style.setProperty('--color-text-secondary', theme.colors.text.secondary)
  root.style.setProperty('--color-text-disabled', theme.colors.text.disabled)
  root.style.setProperty('--color-text-inverse', theme.colors.text.inverse)
  
  root.style.setProperty('--color-border-main', theme.colors.border.main)
  root.style.setProperty('--color-border-light', theme.colors.border.light)
  root.style.setProperty('--color-border-dark', theme.colors.border.dark)
  
  // Apply semantic colors
  root.style.setProperty('--color-success', theme.colors.semantic.success.main)
  root.style.setProperty('--color-error', theme.colors.semantic.error.main)
  root.style.setProperty('--color-warning', theme.colors.semantic.warning.main)
  root.style.setProperty('--color-info', theme.colors.semantic.info.main)
  
  // Apply theme class
  root.classList.remove('light', 'dark')
  root.classList.add(theme.mode)
}

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

export const getBreakpointValue = (theme: Theme, breakpoint: keyof typeof theme.breakpoints): number => {
  const value = theme.breakpoints[breakpoint]
  return parseInt(value.replace('px', ''), 10)
}

export const isBreakpoint = (theme: Theme, breakpoint: keyof typeof theme.breakpoints): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= getBreakpointValue(theme, breakpoint)
}

export default themes
