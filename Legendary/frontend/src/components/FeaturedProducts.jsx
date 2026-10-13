import categoryTshirts from '../assets/category-tshirts.jpg';
import categoryCaps from '../assets/category-caps.jpg';
import categoryTotebags from '../assets/category-totebags.jpg';

/**
 * FeaturedProducts — Showcase featured / new arrival products.
 * Design.md §7 homepage order item 6: "Featured products or new arrivals."
 *
 * Uses static display data for now. In production this will be driven
 * by the Laravel API endpoint for featured products.
 */

const products = [
  {
    id: 'prod-1',
    name: 'The Essential Tee',
    category: 'T-shirt',
    price: '₱1,290',
    badge: 'New',
    image: categoryTshirts,
    alt: 'Black essential t-shirt',
  },
  {
    id: 'prod-2',
    name: 'Structured Cap',
    category: 'Cap',
    price: '₱890',
    badge: null,
    image: categoryCaps,
    alt: 'Black structured cap',
  },
  {
    id: 'prod-3',
    name: 'Everyday Tote',
    category: 'Tote Bag',
    price: '₱1,490',
    badge: null,
    image: categoryTotebags,
    alt: 'Black canvas tote bag',
  },
  {
    id: 'prod-4',
    name: 'Oversized Tee',
    category: 'T-shirt',
    price: '₱1,490',
    originalPrice: '₱1,790',
    badge: 'Sale',
    image: categoryTshirts,
    alt: 'Black oversized t-shirt',
  },
];

function ProductCard({ product }) {
  return (
    <a
      href="#"
      id={product.id}
      className="group block"
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-brand-paper mb-4">
        <img
          src={product.image}
          alt={product.alt}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 px-3 py-1 text-[0.625rem] font-semibold tracking-[0.15em] uppercase
              ${product.badge === 'Sale'
                ? 'bg-brand-sale text-brand-black'
                : 'bg-brand-black text-brand-white'
              }`}
          >
            {product.badge}
          </span>
        )}
        {/* Wishlist button */}
        <button
          aria-label={`Add ${product.name} to wishlist`}
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center
                     bg-brand-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100
                     transition-opacity duration-300 hover:bg-brand-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      {/* Product info */}
      <div>
        <span className="editorial-caption block mb-1">{product.category}</span>
        <h3 className="text-brand-black text-sm font-medium mb-1 group-hover:text-brand-gray transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-brand-black text-sm font-medium">{product.price}</span>
          {product.originalPrice && (
            <span className="text-brand-gray text-sm line-through">{product.originalPrice}</span>
          )}
        </div>
      </div>
    </a>
  );
}

export default function FeaturedProducts() {
  return (
    <section
      id="featured-products"
      className="border-t border-brand-line"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10 lg:mb-14">
          <div>
            <span className="editorial-caption block mb-3">New arrivals</span>
            <h2 className="display-heading text-brand-black text-[2rem] lg:text-[3rem]">
              Just dropped
            </h2>
          </div>
          <a
            href="#"
            id="featured-view-all"
            className="hidden sm:inline-flex items-center gap-2 text-[0.75rem] font-medium tracking-[0.12em] uppercase
                       text-brand-black hover:text-brand-gray transition-colors duration-200"
          >
            Shop all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

        {/* Product Grid — 2 cols mobile, 4 cols desktop per Design.md §7 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
