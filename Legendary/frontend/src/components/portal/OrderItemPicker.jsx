import { useState } from 'react';
import { usePagedResource } from '../../hooks/usePagedResource';
import { useApiResource } from '../../hooks/useApiResource';
import Pagination from '../ui/Pagination';
import { ResourceState } from '../ui/ResourceState';
import { Field } from './AdminFields';
import { money } from '../../utils/formatters';

export default function OrderItemPicker({ items, onAdd, disabled }) {
  const products = usePagedResource('admin/products');
  const [productId, setProductId] = useState('');
  const detail = useApiResource(productId ? 'admin/products/' + productId : 'admin/categories');
  const product = productId ? detail.data?.data : null;
  return <fieldset disabled={disabled} className="mt-5 border border-brand-line p-4">
    <legend className="px-2 text-sm font-semibold">Add order item</legend>
    <ResourceState loading={products.loading} error={products.error} onRetry={products.retry} />
    {products.data && <>
      <Field label="Product"><select className="form-input" value={productId} onChange={event => setProductId(event.target.value)}>
        <option value="">Choose a product</option>{products.data.data.filter(item => item.status === 'active').map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></Field>
      {!products.data.data.length && <p className="mt-2 text-sm">Create an active product and variant before adding order items.</p>}
      <Pagination meta={products.data.meta} onPageChange={products.changePage} />
    </>}
    {productId && <ResourceState loading={detail.loading} error={detail.error} onRetry={detail.retry} />}
    {product?.variants && <div className="mt-4 flex flex-wrap gap-2">{product.variants.filter(variant => variant.is_active).map(variant =>
      <button type="button" className="button-secondary" key={variant.id}
        disabled={disabled || variant.stock_quantity < 1 || items.length >= 50 || items.some(item => Number(item.variant_id) === variant.id)}
        onClick={() => onAdd({ variant_id: variant.id, quantity: 1, unit_price: variant.price_override ?? product.sale_price ?? product.base_price, label: product.name + ' / ' + variant.color + ' / ' + (variant.size || 'One size') })}>
        {variant.sku} · {variant.stock_quantity} available · {money(variant.price_override ?? product.sale_price ?? product.base_price)}
      </button>)}
      {!product.variants.some(variant => variant.is_active) && <p className="text-sm">No active variants for this product.</p>}
    </div>}
  </fieldset>;
}
