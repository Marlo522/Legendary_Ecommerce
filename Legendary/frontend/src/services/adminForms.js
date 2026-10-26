export const orderStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'completed', 'cancelled'];

export function statusOptions(status) {
  const next = { pending: ['confirmed', 'cancelled'], confirmed: ['packed', 'cancelled'], packed: ['shipped', 'cancelled'], shipped: ['completed'], completed: [], cancelled: [] };
  return [status, ...(next[status] || [])];
}

export function orderIsLocked(order) {
  return !!order && (['shipped', 'completed', 'cancelled'].includes(order.status) || ['paid', 'refunded'].includes(order.payment_status));
}

export function orderPayload(values) {
  return {
    ...values,
    items: values.items.map(item => ({ variant_id: Number(item.variant_id), quantity: Number(item.quantity) })),
    shipping_fee: values.shipping_fee === '' ? 0 : values.shipping_fee,
    discount_amount: values.discount_amount === '' ? 0 : values.discount_amount,
  };
}

export function paymentOptions(status) {
  return ({ pending: ['pending', 'paid', 'failed'], failed: ['failed', 'pending', 'paid'], paid: ['paid', 'refunded'], refunded: ['refunded'] })[status || 'pending'];
}
