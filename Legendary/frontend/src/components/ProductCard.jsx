import { Link, useLocation } from 'react-router';
import ProductImage from './ProductImage';
import WishlistButton from './WishlistButton';
import { money } from '../utils/formatters';
export default function ProductCard({ product }) {
  const location = useLocation();
  const badge = !product.in_stock ? 'Sold out' : product.original_price ? 'Sale' : product.low_stock ? 'Low stock' : product.is_new_arrival ? 'New' : null;
  const colors = [...new Set(product.variants.map(variant => variant.color))];
  const sizes = [...new Set(product.variants.map(variant => variant.size).filter(Boolean))];
  return <article className="group relative min-w-0">
    <WishlistButton product={product} compact />
    <Link to={'/products/' + product.slug} state={{ catalogPath: location.pathname + location.search }} className="block">
      <div className="relative aspect-square overflow-hidden bg-brand-paper">
        <ProductImage image={product.images[0]} name={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        {badge && <span className="absolute bottom-3 left-3 bg-brand-white px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wider">{badge}</span>}
      </div>
      <div className="pt-4">
        <p className="editorial-caption mb-1">{product.category?.name}</p>
        <h2 className="text-sm font-medium leading-snug group-hover:underline">{product.name}</h2>
        <p className="mt-2 text-sm">{product.price !== product.max_price && <span className="mr-1 text-xs text-brand-gray">From</span>}{money(product.price)}
          {product.original_price && <del className="ml-2 text-brand-gray">{money(product.original_price)}</del>}</p>
        <p className="mt-2 text-xs text-brand-gray">{colors.join(' / ')}{sizes.length > 0 && ' · ' + sizes.join(', ')}</p>
        <p className={'mt-1 text-xs ' + (product.in_stock ? 'text-brand-success' : 'text-brand-gray')}>{product.in_stock ? 'In stock' : 'Out of stock'}</p>
      </div>
    </Link>
  </article>;
}
