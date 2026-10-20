import { Link, useSearchParams } from 'react-router';
import { useApiResource } from '../hooks/useApiResource';
import { useStorefront } from '../hooks/useStorefront';
import CatalogFilters from '../components/CatalogFilters';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/ui/Pagination';
import { EmptyState, ResourceState } from '../components/ui/ResourceState';

const filterKeys = ['q', 'category', 'color', 'size', 'min_price', 'max_price', 'collection', 'availability', 'sort'];
export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const { metadata } = useStorefront();
  const { data, loading, error, retry } = useApiResource('catalog/products?' + params.toString(), { authenticate: false });
  const categories = metadata.data?.data.categories || [];
  const selected = categories.find(category => category.slug === params.get('category'));
  function apply(values) {
    const next = new URLSearchParams();
    for (const key of filterKeys) if (values[key] !== undefined && values[key] !== '') next.set(key, values[key]);
    setParams(next);
  }
  return <section className="mx-auto w-full max-w-[1280px] px-6 py-10 lg:px-10 lg:py-16">
    <nav aria-label="Breadcrumb" className="mb-9 text-xs text-brand-gray"><Link to="/">Home</Link><span className="mx-3">/</span><span>Shop{selected ? ' / ' + selected.name : ''}</span></nav>
    <div className="grid items-end gap-7 pb-10 lg:grid-cols-12">
      <div className="lg:col-span-8"><p className="editorial-caption mb-4">Legendary / The collection</p>
        <h1 className="display-heading text-6xl sm:text-7xl lg:text-8xl">{selected?.name || 'The everyday edit'}</h1></div>
      <p className="max-w-sm text-sm leading-relaxed text-brand-gray lg:col-span-4">{selected?.description || 'T-shirts, caps, and tote bags. Find the pieces that fit your everyday uniform.'}</p>
    </div>
    <nav aria-label="Product categories" className="mb-7 flex flex-wrap gap-2">
      <button type="button" className={'button-secondary ' + (!params.get('category') ? 'border-brand-black font-semibold' : '')}
        onClick={() => apply({ ...Object.fromEntries(params), category: '' })}>All pieces</button>
      {categories.map(category => <button key={category.id} type="button" aria-pressed={category.slug === params.get('category')}
        className={'button-secondary ' + (category.slug === params.get('category') ? 'border-brand-black font-semibold' : '')}
        onClick={() => apply({ ...Object.fromEntries(params), category: category.slug })}>{category.name}</button>)}
    </nav>
    {metadata.error && <ResourceState error={metadata.error} onRetry={metadata.retry} />}
    <CatalogFilters key={params.toString()} metadata={metadata.data?.data || {}} params={params} onApply={apply} />
    <div className="flex flex-wrap items-center justify-between gap-4 py-6">
      <p className="text-xs text-brand-gray" aria-live="polite">{loading ? 'Finding your pieces…' : data ? data.meta.total + (data.meta.total === 1 ? ' piece' : ' pieces') : 'Collection'}</p>
      <label className="flex items-center gap-3"><span className="text-xs">Sort by</span>
        <select className="form-input w-auto" value={params.get('sort') || 'newest'} onChange={event => apply({ ...Object.fromEntries(params), sort: event.target.value })}>
          <option value="newest">Newest</option><option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option><option value="popularity">Popularity (most reviewed)</option><option value="name">Name: A–Z</option>
        </select></label>
    </div>
    {error ? <ResourceState error={error} onRetry={retry} /> : <>
      <ProductGrid products={data?.data} loading={loading} />
      {!loading && data?.data.length === 0 && <EmptyState title="No pieces found">Try another search or clear your filters to see more of the collection.</EmptyState>}
      {!loading && <Pagination meta={data?.meta} onPageChange={page => { const next = new URLSearchParams(params); next.set('page', String(page)); setParams(next); }} />}
    </>}
  </section>;
}
