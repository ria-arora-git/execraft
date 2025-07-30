import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export async function exportToXLS(filename: string, data: any[], headers: string[]) {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet1')

    worksheet.addRow(headers)
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E3A8A' },
    }
    headerRow.font = { color: { argb: 'FFFFFF' }, bold: true }

    data.forEach(row => worksheet.addRow(row))

    worksheet.columns.forEach(col => {
      let maxLength = col.header ? col.header.length : 10
      col.eachCell?.({ includeEmpty: true }, cell => {
        maxLength = Math.max(maxLength, cell.value?.toString().length ?? 10)
      })
      col.width = maxLength < 10 ? 10 : maxLength
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, `${filename}.xlsx`)
  } catch (error) {
    console.error(error)
    throw new Error('Export failed')
  }
}

export async function exportOrders(orders: any[], filename = 'orders') {
  const data = orders.map(o => [
    o.orderNumber,
    `Table ${o.table.number}`,
    o.customerName,
    `$${o.total.toFixed(2)}`,
    o.status,
    new Date(o.createdAt).toLocaleString(),
  ])
  const headers = [
    'Order #',
    'Table',
    'Customer',
    'Total',
    'Status',
    'Created At',
  ]
  await exportToXLS(filename, data, headers)
}
