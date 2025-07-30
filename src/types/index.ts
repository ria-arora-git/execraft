export interface Table {
  id: string
  number: number
  capacity: number
  status: 'AVAILABLE' | 'OCCUPIED'
  token: string
  orders?: Order[]
}

export interface Order {
  id: string
  orderNumber: string
  tableId: string
  table: Table
  status: string
  total: number
  items: OrderItem[]
  createdAt: string
  customerName: string
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  price: number
  menuItem?: MenuItem
  notes?: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  prepTime?: number
  category: string
  image?: string
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  minStock: number
  maxStock: number
  cost: number
}

export interface MenuItemIngredient {
  id: string
  menuItemId: string
  inventoryItemId: string
  quantity: number
  menuItem?: MenuItem
  inventoryItem?: InventoryItem
}
