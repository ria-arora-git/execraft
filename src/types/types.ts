
import React from 'react'

// ============================================================================
// THEME TYPES
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system'

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

export interface Typography {
  fontFamily: {
    sans: string[]
    serif: string[]
    mono: string[]
  }
  fontSize: Record<string, [string, { lineHeight: string; letterSpacing: string }]>
  fontWeight: Record<string, string>
}

export interface Spacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
  '5xl': string
  '6xl': string
}

export interface Theme {
  name: string
  mode: 'light' | 'dark'
  colors: ThemeColors
  spacing: Spacing
  typography: Typography
  shadows: Record<string, string>
  borderRadius: Record<string, string>
  breakpoints: Record<string, string>
  zIndex: Record<string, number>
}

export interface ThemeContextType {
  theme: Theme
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  isLoading: boolean
}

// ============================================================================
// RESPONSIVE TYPES
// ============================================================================

export interface ResponsiveContextType {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  windowSize: {
    width: number
    height: number
  }
}

// ============================================================================
// COMPONENT TYPES
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon'
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  loading?: boolean
  fullWidth?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
  interactive?: boolean
  onClick?: () => void
}

export interface StatsCardProps extends Omit<CardProps, 'children'> {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
}

export interface ActionCardProps extends CardProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

// ============================================================================
// DATA TYPES
// ============================================================================

export interface Restaurant {
  id: string
  name: string
  clerkOrgId: string
  createdAt: string
  updatedAt: string
}

export interface Table {
  id: string
  number: number
  capacity: number
  status: 'AVAILABLE' | 'OCCUPIED'
  token: string
  restaurantId: string
  createdAt: string
  updatedAt: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  prepTime?: number
  category: string
  image?: string
  restaurantId: string
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  name: string
  quantity: number
  unit: string
  minStock: number
  restaurantId: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  tableId: string
  restaurantId: string
  sessionId: string
  customerName: string
  customerPhone?: string
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED'
  total: number
  notes?: string
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
  table?: Table
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  price: number
  notes?: string
  createdAt: string
  updatedAt: string
  menuItem?: MenuItem
}

export interface StockAlert {
  id: string
  inventoryItemId: string
  alertType: string
  threshold: number
  message: string
  acknowledged: boolean
  whatsappSent: boolean
  createdAt: string
  updatedAt: string
  inventoryItem?: InventoryItem
}
