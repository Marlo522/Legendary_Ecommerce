import { useState } from 'react';
export default function CatalogFilters({ metadata, params, onApply }) {
  const [values, setValues] = useState(() => Object.fromEntries(params));
  function field(name, value) { setValues(current => ({ ...current, [name]: value })); }
  function select(name, label, options) {
    return <label className="min-w-0"><span className="form-label">{label}</span>
      <select className="form-input" value={values[name] || ''} onChange={event => field(name, event.target.value)}>
        <option value="">All {label.toLowerCase()}</option>
        {options.map(option => <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>)}
      </select></label>;
  }
  return <form onSubmit={event => { event.preventDefault(); onApply(values); }} className="border-y border-brand-line py-6">
    <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="sm:col-span-2"><span className="form-label">Search products</span>
        <input className="form-input" type="search" placeholder="Search name, category, or description" maxLength={120}
          value={values.q || ''} onChange={event => field('q', event.target.value)} /></label>
      {select('category', 'Categories', (metadata.categories || []).map(category => ({ value: category.slug, label: category.name })))}
      {select('collection', 'Collections', [{ value: 'featured', label: 'Featured pieces' }, { value: 'new-arrivals', label: 'New arrivals' }])}
    </div>
    <details className="mt-5" open={['color', 'size', 'availability', 'min_price', 'max_price'].some(key => Boolean(params.get(key))) || undefined}>
      <summary className="w-fit cursor-pointer text-xs font-medium uppercase tracking-wider">Refine by color, size, price & availability</summary>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {select('color', 'Colors', metadata.colors || [])}{select('size', 'Sizes', metadata.sizes || [])}
        {select('availability', 'Availability', [{ value: 'in-stock', label: 'In stock' }, { value: 'out-of-stock', label: 'Out of stock' }])}
        <label><span className="form-label">Minimum price (PHP)</span><input type="number" min="0" max="99999999.99" step="0.01" className="form-input"
          value={values.min_price ?? ''} onChange={event => field('min_price', event.target.value)} /></label>
        <label><span className="form-label">Maximum price (PHP)</span><input type="number" min={values.min_price || '0'} max="99999999.99" step="0.01" className="form-input"
          value={values.max_price ?? ''} onChange={event => field('max_price', event.target.value)} /></label>
      </div>
    </details>
    <div className="mt-5 flex flex-wrap gap-3"><button className="button-primary" type="submit">Apply filters</button>
      <button className="button-secondary" type="button" onClick={() => { setValues({}); onApply({}); }}>Clear filters</button></div>
  </form>;
}
