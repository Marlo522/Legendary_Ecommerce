import { Link } from 'react-router';
import { useApiResource } from '../hooks/useApiResource';
import ProductGrid from './ProductGrid';
import { getFeaturedPhotography } from '../data/landingPhotography';
import { EmptyState, ResourceState } from './ui/ResourceState';
export default function FeaturedProducts() {
  const { data, loading, error, retry } = useApiResource('catalog/products?collection=featured&per_page=4', { authenticate: false });
  const products = (data?.data || []).map(product => {
    const photo = getFeaturedPhotography(product);
    return { ...product, images: [{ image_url: photo.src, alt_text: photo.alt }] };
  });
  return <section id="featured-products" className="border-t border-brand-line">
    <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div><p className="editorial-caption mb-3">Selected pieces</p><h2 className="display-heading text-4xl lg:text-5xl">The current rotation</h2></div>
        <Link id="featured-view-all" to="/shop" className="text-xs uppercase tracking-wider underline underline-offset-4">Shop all</Link>
      </div>
      {error ? <ResourceState error={error} onRetry={retry} /> : <ProductGrid loading={loading} products={products} imageFit="contain" />}
      {!loading && !error && data?.data.length === 0 && <EmptyState title="New pieces are on the way">Check the shop for the current collection.</EmptyState>}
    </div>
  </section>;
}
