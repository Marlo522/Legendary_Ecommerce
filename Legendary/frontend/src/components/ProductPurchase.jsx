import { useState } from 'react';
import { Link } from 'react-router';
import { apiRequest } from '../services/apiClient';
import { money } from '../utils/formatters';
import { useStorefront } from '../hooks/useStorefront';
import WishlistButton from './WishlistButton';

export default function ProductPurchase({ product }) {
  const { applyCart } = useStorefront();
  const variants = product.variants;
  const colors = [...new Set(variants.map(variant => variant.color))];
  const [color, setColor] = useState(colors.length === 1 ? colors[0] : '');
  const matching = variants.filter(variant => variant.color === color);
  const [size, setSize] = useState(variants.length === 1 ? variants[0].size || '' : '');
  const selected = matching.find(variant => (variant.size || '') === size);
  const [quantity, setQuantity] = useState('1');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const price = selected?.price ?? product.price;
  const validQuantity = Number.isInteger(Number(quantity)) && Number(quantity) >= 1 && Number(quantity) <= Math.min(99, selected?.stock_quantity || 0);
  async function add(event) {
    event.preventDefault(); setError(null); setAdded(false);
    if (!selected || !selected.in_stock || !validQuantity) {
      setError('Choose an in-stock color and size, then enter an available quantity.'); return;
    }
    setPending(true);
    try {
      const response = await apiRequest('cart/items', { method: 'POST', authenticate: false, body: { variant_id: selected.id, quantity: Number(quantity) } });
      applyCart(response.data); setAdded(true);
    } catch (failure) { setError(failure.message); }
    finally { setPending(false); }
  }
  return <div>
    <p className="editorial-caption mb-4">{product.category?.name} / {product.is_new_arrival ? 'New arrival' : 'The collection'}</p>
    <h1 className="display-heading text-5xl leading-none lg:text-6xl">{product.name}</h1>
    <div className="mt-6 flex flex-wrap items-baseline gap-3">
      <p className="text-2xl">{!selected && product.price !== product.max_price && <span className="mr-2 text-sm text-brand-gray">From</span>}{money(price)}</p>
      {product.sale_price !== null && Number(product.sale_price) < Number(product.base_price) && price === Number(product.sale_price) && (selected?.price_override === null || selected?.price_override === undefined) && <del className="text-base text-brand-gray">{money(product.base_price)}</del>}
    </div>
    <a href="#product-reviews" className="mt-3 inline-block text-xs underline underline-offset-4">{product.review_count ? product.average_rating + ' / 5 · ' + product.review_count + ' reviews' : 'No reviews yet'}</a>
    <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-brand-gray">{product.description || 'No description has been provided for this piece.'}</p>
    <form onSubmit={add} className="mt-8 border-t border-brand-line pt-7">
      <fieldset disabled={pending}><legend className="form-label">Color{color && ': ' + color}</legend>
        <div className="flex flex-wrap gap-2">{colors.map(option => {
          const variant = variants.find(item => item.color === option);
          const swatch = /^#[0-9a-f]{6}$/i.test(variant.color_hex || '') ? variant.color_hex : undefined;
          return <button type="button" key={option} aria-pressed={color === option}
            onClick={() => { setColor(option); const options = variants.filter(item => item.color === option); setSize(options.length === 1 ? options[0].size || '' : ''); setQuantity('1'); setAdded(false); }}
            className={'button-secondary gap-2 ' + (color === option ? 'border-brand-black ring-1 ring-brand-black' : '')}>
            {swatch && <span className="h-3 w-3 border border-brand-line" style={{ backgroundColor: swatch }} aria-hidden="true" />}{option}
          </button>;
        })}</div>
      </fieldset>
      {variants.some(variant => variant.size) && <fieldset disabled={pending} className="mt-6"><legend className="form-label">Size</legend>
        <div className="flex flex-wrap gap-2">{[...new Set(variants.map(variant => variant.size).filter(Boolean))].map(option => {
          const variant = matching.find(item => item.size === option);
          return <button key={option} type="button" aria-pressed={size === option} disabled={!variant?.in_stock}
            onClick={() => { setSize(option); setQuantity('1'); setAdded(false); }}
            className={'button-secondary min-w-12 ' + (size === option ? 'border-brand-black ring-1 ring-brand-black' : '')}>{option}</button>;
        })}</div>
        {!color && <p className="mt-2 text-xs text-brand-gray">Choose a color to see available sizes.</p>}
      </fieldset>}
      <p className={'mt-5 text-xs ' + (selected?.in_stock ? 'text-brand-success' : 'text-brand-gray')} aria-live="polite">
        {selected ? selected.in_stock ? selected.stock_quantity + ' in stock' : 'This option is out of stock.' : product.in_stock ? 'Select your options to check stock.' : 'Currently out of stock.'}
      </p>
      <div className="mt-5 flex items-end gap-3">
        <label className="w-24 shrink-0"><span className="form-label">Quantity</span><input className="form-input" type="number" min="1"
          max={Math.min(99, selected?.stock_quantity || 1)} step="1" value={quantity} disabled={pending || !selected?.in_stock}
          onChange={event => { setQuantity(event.target.value); setAdded(false); }} /></label>
        <button className="button-primary min-h-11 flex-1" type="submit" disabled={pending || !selected?.in_stock || !validQuantity}>
          {pending ? 'Adding…' : !product.in_stock ? 'Out of stock' : 'Add to bag'}
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-brand-danger" role="alert">{error}</p>}
      {added && <p className="mt-4 text-sm text-brand-success" role="status">Added to your bag. <Link className="underline" to="/cart">View bag</Link></p>}
    </form>
    <div className="mt-3"><WishlistButton product={product} /></div>
    <div className="mt-8 border-t border-brand-line">
      {[['Material', product.material || 'Material information has not been provided.'], ['Care instructions', product.care_instructions || 'Care instructions have not been provided.'],
        ['Size & fit', 'Available sizes: ' + ([...new Set(variants.map(variant => variant.size).filter(Boolean))].join(', ') || 'Not specified') + '. Measurements have not been provided for this piece.'],
        ['Delivery & returns', 'Please contact Legendary Lifestyle for delivery and returns information before ordering.']].map(([title, text]) =>
        <details key={title} className="border-b border-brand-line py-4"><summary className="cursor-pointer text-xs font-medium uppercase tracking-wider">{title}</summary>
          <p className="whitespace-pre-line pt-4 text-sm leading-relaxed text-brand-gray">{text}</p></details>)}
    </div>
  </div>;
}
