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

export interface SemanticColors {
  success: {
    light: string
    main: string
    dark: string
    contrastText: string
  }
  error: {
    light: string
    main: string
    dark: string
    contrastText: string
  }
  warning: {
    light: string
    main: string
    dark: string
    contrastText: string
  }
  info: {
    light: string
    main: string
    dark: string
    contrastText: string
  }
}

export interface SpacingScale {
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

export interface TypographyScale {
  fontFamily: {
    sans: string[]
    serif: string[]
    mono: string[]
  }
  fontSize: {
    xs: [string, { lineHeight: string; letterSpacing: string }]
    sm: [string, { lineHeight: string; letterSpacing: string }]
    base: [string, { lineHeight: string; letterSpacing: string }]
    lg: [string, { lineHeight: string; letterSpacing: string }]
    xl: [string, { lineHeight: string; letterSpacing: string }]
    '2xl': [string, { lineHeight: string; letterSpacing: string }]
    '3xl': [string, { lineHeight: string; letterSpacing: string }]
    '4xl': [string, { lineHeight: string; letterSpacing: string }]
    '5xl': [string, { lineHeight: string; letterSpacing: string }]
    '6xl': [string, { lineHeight: string; letterSpacing: string }]
    '7xl': [string, { lineHeight: string; letterSpacing: string }]
    '8xl': [string, { lineHeight: string; letterSpacing: string }]
    '9xl': [string, { lineHeight: string; letterSpacing: string }]
  }
  fontWeight: {
    thin: string
    extralight: string
    light: string
    normal: string
    medium: string
    semibold: string
    bold: string
    extrabold: string
    black: string
  }
}

export interface ShadowScale {
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
  none: string
}

export interface BorderRadiusScale {
  none: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

export interface Theme {
  name: string
  mode: ThemeMode
  colors: {
    primary: ColorPalette
    secondary: ColorPalette
    background: {
      main: string
      paper: string
      default: string
    }
    surface: {
      main: string
      variant: string
    }
    text: {
      primary: string
      secondary: string
      disabled: string
      inverse: string
    }
    border: {
      main: string
      light: string
      dark: string
    }
    semantic: SemanticColors
  }
  spacing: SpacingScale
  typography: TypographyScale
  shadows: ShadowScale
  borderRadius: BorderRadiusScale
  breakpoints: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  zIndex: {
    hide: number
    auto: number
    base: number
    docked: number
    dropdown: number
    sticky: number
    banner: number
    overlay: number
    modal: number
    popover: number
    skipLink: number
    toast: number
    tooltip: number
  }
}

export interface ThemeContextType {
  theme: Theme
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  isLoading: boolean
}

// ============================================================================
// COMPONENT TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'sm' | 'default' | 'lg' | 'xl'
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  form?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated'
  interactive?: boolean
  onClick?: () => void
}

export interface DrawerProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  position?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  backdrop?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  title?: string
  description?: string
}

export interface ModalProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  title?: string
  description?: string
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helperText?: string
  error?: boolean
  errorMessage?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined' | 'filled'
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  fullWidth?: boolean
}

export interface SelectProps<T = any> extends BaseComponentProps {
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
  options: Array<{
    value: T
    label: string
    disabled?: boolean
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
  }>
  placeholder?: string
  searchable?: boolean
  multiple?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined' | 'filled'
  label?: string
  helperText?: string
  error?: boolean
  errorMessage?: string
  fullWidth?: boolean
  disabled?: boolean
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
  status: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  skip?: number
  take?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  category?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export type QueryParams = PaginationParams & SortParams & FilterParams

// ============================================================================
// RESTAURANT SYSTEM TYPES
// ============================================================================

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED'
export type TableStatus = 'AVAILABLE' | 'OCCUPIED'

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
  status: TableStatus
  token: string
  restaurantId: string
  createdAt: string
  updatedAt: string
  orders?: Order[]
  sessions?: TableSession[]
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
  ingredients?: MenuItemIngredient[]
  orderItems?: OrderItem[]
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
  ingredients?: MenuItemIngredient[]
  alerts?: StockAlert[]
  changeLogs?: InventoryChangeLog[]
}

export interface Order {
  id: string
  orderNumber: string
  tableId: string
  restaurantId: string
  sessionId: string
  customerName: string
  customerPhone?: string
  status: OrderStatus
  total: number
  notes?: string
  createdAt: string
  updatedAt: string
  table?: Table
  restaurant?: Restaurant
  session?: TableSession
  items?: OrderItem[]
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
  order?: Order
  menuItem?: MenuItem
}

export interface TableSession {
  id: string
  tableId: string
  restaurantId: string
  status: string
  createdAt: string
  updatedAt: string
  table?: Table
  restaurant?: Restaurant
  orders?: Order[]
}

export interface MenuItemIngredient {
  id: string
  menuItemId: string
  inventoryItemId: string
  quantity: number
  createdAt: string
  updatedAt: string
  menuItem?: MenuItem
  inventoryItem?: InventoryItem
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

export interface InventoryChangeLog {
  id: string
  inventoryItemId: string
  changeAmount: number
  changeType: string
  orderId?: string
  createdAt: string
  inventoryItem?: InventoryItem
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Maybe<T> = T | null
export type Optional<T> = T | undefined
export type Nullable<T> = T | null | undefined

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

export type Values<T> = T[keyof T]
export type Keys<T> = keyof T