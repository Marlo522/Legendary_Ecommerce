import ProductCard from './ProductCard';
export default function ProductGrid({ products = [], loading = false, imageFit = 'cover' }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6" aria-busy={loading}>
    {loading ? Array.from({ length: 8 }, (_, index) => <div key={index} className="animate-pulse" aria-hidden="true">
      <div className="aspect-square bg-brand-paper" /><div className="mt-4 h-3 w-2/3 bg-brand-paper" /><div className="mt-3 h-3 w-1/3 bg-brand-paper" />
    </div>) : products.map(product => <ProductCard key={product.id} product={product} imageFit={imageFit} />)}
    {loading && <p className="sr-only" role="status">Loading products…</p>}
  </div>;
}
