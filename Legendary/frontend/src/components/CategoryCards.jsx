import { Link } from 'react-router';
import { useStorefront } from '../hooks/useStorefront';
import ProductImage from './ProductImage';
import { EmptyState, ResourceState } from './ui/ResourceState';
export default function CategoryCards() {
  const { metadata } = useStorefront();
  const categories = metadata.data?.data.categories || [];
  return <section id="categories" className="border-t border-brand-line">
    <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div><p className="editorial-caption mb-3">Shop by category</p><h2 className="display-heading text-4xl lg:text-5xl">The essentials</h2></div>
        <Link id="categories-view-all" to="/shop" className="text-xs uppercase tracking-wider underline underline-offset-4">View all</Link>
      </div>
      <ResourceState loading={metadata.loading} error={metadata.error} onRetry={metadata.retry} label="Loading categories…" />
      {!metadata.loading && !metadata.error && <div className="grid gap-4 sm:grid-cols-3 lg:gap-6">
        {categories.map(category => <Link key={category.id} to={'/shop?category=' + encodeURIComponent(category.slug)} className="group relative aspect-square overflow-hidden bg-brand-paper">
          <ProductImage image={category.image} name={category.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-x-0 bottom-0 bg-brand-white/90 p-5"><p className="editorial-caption mb-1">{category.product_count} pieces</p><h3 className="display-heading text-2xl">{category.name}</h3></div>
        </Link>)}
      </div>}
      {!metadata.loading && !metadata.error && categories.length === 0 && <EmptyState title="The collection is coming together">Categories will appear here when they are available.</EmptyState>}
    </div>
  </section>;
}
