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

export const variantColors = [
  { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' }, { name: 'Navy', hex: '#000080' },
  { name: 'Blue', hex: '#0000FF' }, { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#008000' }, { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Brown', hex: '#8B4513' }, { name: 'Natural', hex: '#F4F4F0' },
  { name: 'Pink', hex: '#FFC0CB' }, { name: 'Yellow', hex: '#FFFF00' },
];

export const variantSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

export function suggestedVariantSku(product, values) {
  const part = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!values.color.trim()) return '';
  const base = [part(product.slug || product.name).slice(0, 40), product.id, part(values.color).slice(0, 25), part(values.size || 'OS').slice(0, 15)].filter(Boolean).join('-');
  const used = new Set(product.variants.filter(variant => variant.id !== values.id).map(variant => variant.sku.toUpperCase()));
  let sku = base;
  for (let suffix = 2; used.has(sku); suffix++) sku = base + '-' + suffix;
  return sku;
}
