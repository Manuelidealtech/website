export const ORDER_STATUSES = [
  { value: 'new', label: 'Nuovo' },
  { value: 'awaiting_payment', label: 'In attesa bonifico' },
  { value: 'paid', label: 'Pagato' },
  { value: 'processing', label: 'In lavorazione' },
  { value: 'shipped', label: 'Spedito' },
  { value: 'completed', label: 'Completato' },
  { value: 'cancelled', label: 'Annullato' },
]

export function getOrderStatusLabel(status) {
  return ORDER_STATUSES.find((item) => item.value === status)?.label || status
}

export function formatMoney(value, locale = 'it-IT') {
  return Number(value || 0).toLocaleString(locale, {
    style: 'currency',
    currency: 'EUR',
  })
}

export function calculateCartTotals(items, shippingCost = 0) {
  const net = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  )
  const vat = items.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0) *
        (Number(item.vat_rate || 0) / 100),
    0
  )
  const shipping = Number(shippingCost || 0)

  return {
    net,
    vat,
    shipping,
    total: net + vat + shipping,
  }
}

export function getProductAvailability(product) {
  if (product.track_stock && Number(product.stock_quantity || 0) <= 0) {
    return { available: false, label: 'Esaurito' }
  }

  if (product.track_stock && Number(product.stock_quantity || 0) <= 5) {
    return { available: true, label: `Ultimi ${product.stock_quantity} disponibili` }
  }

  return { available: true, label: 'Disponibile' }
}
