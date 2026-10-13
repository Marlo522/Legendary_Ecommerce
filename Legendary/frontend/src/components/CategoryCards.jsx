import categoryTshirts from '../assets/category-tshirts.jpg';
import categoryCaps from '../assets/category-caps.jpg';
import categoryTotebags from '../assets/category-totebags.jpg';

/**
 * CategoryCards — Three category cards: T-shirts, Caps, Tote Bags.
 * Design.md §7 homepage order item 5: "Category cards for T-shirts, Caps, and Tote Bags."
 */

const categories = [
  {
    id: 'cat-tshirts',
    label: 'T-shirts',
    caption: 'Everyday essentials',
    image: categoryTshirts,
    alt: 'Black t-shirt folded on white surface',
    href: '#',
  },
  {
    id: 'cat-caps',
    label: 'Caps',
    caption: 'Top it off',
    image: categoryCaps,
    alt: 'Black structured baseball cap',
    href: '#',
  },
  {
    id: 'cat-totebags',
    label: 'Tote Bags',
    caption: 'Carry everything',
    image: categoryTotebags,
    alt: 'Black canvas tote bag',
    href: '#',
  },
];

export default function CategoryCards() {
  return (
    <section
      id="categories"
      className="border-t border-brand-line"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10 lg:mb-14">
          <div>
            <span className="editorial-caption block mb-3">Shop by category</span>
            <h2 className="display-heading text-brand-black text-[2rem] lg:text-[3rem]">
              The essentials
            </h2>
          </div>
          <a
            href="#"
            id="categories-view-all"
            className="hidden sm:inline-flex items-center gap-2 text-[0.75rem] font-medium tracking-[0.12em] uppercase
                       text-brand-black hover:text-brand-gray transition-colors duration-200"
          >
            View all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={cat.href}
              id={cat.id}
              className="group relative aspect-square overflow-hidden bg-brand-paper"
            >
              <img
                src={cat.image}
                alt={cat.alt}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/10 transition-colors duration-500" />
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                <span className="editorial-caption block text-brand-gray mb-1">{cat.caption}</span>
                <span className="display-heading text-brand-black text-xl lg:text-2xl">
                  {cat.label}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
