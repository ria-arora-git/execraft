export function exportOrders(orders: any[], filename: string) {
  // Create CSV content
  const headers = ['Order Number', 'Table', 'Customer', 'Total', 'Status', 'Created At', 'Items']
  
  const csvContent = [
    headers.join(','),
    ...orders.map(order => {
      const items = order.items?.map((item: any) => 
        `${item.quantity}x ${item.menuItem?.name || 'Unknown Item'}`
      ).join('; ') || ''
      
      return [
        order.orderNumber || '',
        `Table ${order.table?.number || 'N/A'}`,
        order.customerName || '',
        `$${(order.total || 0).toFixed(2)}`,
        order.status || '',
        new Date(order.createdAt).toLocaleString(),
        `"${items}"`
      ].join(',')
    })
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function exportInventory(items: any[], filename: string) {
  const headers = ['Name', 'Unit', 'Current Quantity', 'Min Stock', 'Status', 'Last Updated']
  
  const csvContent = [
    headers.join(','),
    ...items.map(item => [
      item.name || '',
      item.unit || '',
      item.quantity || 0,
      item.minStock || 0,
      item.quantity <= item.minStock ? 'Low Stock' : 'OK',
      new Date(item.updatedAt).toLocaleString()
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
