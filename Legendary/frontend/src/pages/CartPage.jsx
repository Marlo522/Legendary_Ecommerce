import { Link } from 'react-router';
import { useState } from 'react';
import { useStorefront } from '../hooks/useStorefront';
import ProductImage from '../components/ProductImage';
import { apiRequest } from '../services/apiClient';
import { money } from '../utils/formatters';
import { EmptyState, ResourceState } from '../components/ui/ResourceState';
export default function CartPage() {
  const { cart, cartLoading, cartError, applyCart, refreshCart } = useStorefront();
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  async function change(item, quantity) {
    setPending(item.variant_id); setError(null);
    try {
      const response = await apiRequest(quantity === 0 ? 'cart/items/' + item.variant_id + '/remove' : 'cart/quantity', {
        method: 'POST', authenticate: false, ...(quantity === 0 ? {} : { body: { variant_id: item.variant_id, quantity } }),
      });
      applyCart(response.data);
    } catch (failure) { setError(failure.message); } finally { setPending(null); }
  }
  return <section className="mx-auto w-full max-w-[1280px] px-6 py-12 lg:px-10">
    <p className="editorial-caption mb-4">Your selection</p><h1 className="display-heading mb-10 text-6xl">The bag</h1>
    <ResourceState loading={cartLoading} error={cartError} onRetry={refreshCart} />
    {error && <p role="alert" className="mb-5 text-sm text-brand-danger">{error}</p>}
    {cart && !cartLoading && <>
      {cart.unavailable_items > 0 && <p className="mb-5 text-sm text-brand-danger">Some pieces in your bag are no longer available and have been excluded.</p>}
      {cart.items.length ? <div className="grid gap-10 lg:grid-cols-12"><div className="lg:col-span-8">{cart.items.map(item => <article key={item.variant_id} className="grid grid-cols-[90px_1fr] gap-5 border-t border-brand-line py-6 sm:grid-cols-[120px_1fr]">
        <Link to={'/products/' + item.slug}><ProductImage image={item.image} name={item.name} className="aspect-square w-full object-cover" /></Link>
        <div><Link className="text-sm font-medium hover:underline" to={'/products/' + item.slug}>{item.name}</Link>
          <p className="mt-1 text-xs text-brand-gray">{item.color}{item.size && ' / ' + item.size}</p>
          <p className="mt-2 text-sm">{money(item.unit_price)} each</p>
          {!item.available && <p className="mt-2 text-xs text-brand-danger">Only {item.stock_quantity} available. Update your quantity.</p>}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="button-secondary" aria-label={'Decrease ' + item.name + ' quantity'} disabled={pending !== null || item.quantity <= 1} onClick={() => change(item, item.quantity - 1)}>−</button>
            <span className="text-sm" aria-label="Quantity">{item.quantity}</span>
            <button className="button-secondary" aria-label={'Increase ' + item.name + ' quantity'} disabled={pending !== null || item.quantity >= Math.min(99, item.stock_quantity)} onClick={() => change(item, item.quantity + 1)}>+</button>
            <button className="text-xs underline disabled:opacity-50" disabled={pending !== null} onClick={() => change(item, 0)}>Remove {item.name}</button>
            <span className="ml-auto text-sm font-medium">{money(item.line_total)}</span>
          </div>
        </div>
      </article>)}</div><aside className="h-fit border border-brand-line bg-brand-paper p-6 lg:col-span-4">
        <h2 className="display-heading text-3xl">Your selection</h2><div className="mt-6 flex justify-between text-sm"><span>Subtotal · {cart.count} {cart.count === 1 ? 'item' : 'items'}</span><span>{money(cart.subtotal)}</span></div>
        <p className="mt-4 text-xs leading-relaxed text-brand-gray">Your bag is saved for this session. Checkout is not available yet.</p>
        <Link to="/shop" className="button-primary mt-6 w-full">Continue shopping</Link>
      </aside></div> : <EmptyState title="Your bag is empty"><Link to="/shop" className="mt-4 inline-block underline">Explore the collection</Link></EmptyState>}
    </>}
  </section>;
}
