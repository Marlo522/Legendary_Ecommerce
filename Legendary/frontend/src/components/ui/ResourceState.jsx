export function ResourceState({ loading = false, error, onRetry, label = 'Loading your information…' }) {
  if (loading) return <div className="px-6 py-16 text-center" role="status">
    <span className="mb-4 inline-block h-6 w-6 animate-spin border-2 border-brand-line border-t-brand-black" aria-hidden="true" />
    <p className="text-sm text-brand-gray">{label}</p>
  </div>;
  if (error) return <div className="border border-brand-line bg-brand-paper p-6" role="alert">
    <h2 className="font-semibold">We could not load this information</h2>
    <p className="mt-2 text-sm text-brand-danger">{error}</p>
    {onRetry && <button type="button" className="button-secondary mt-4" onClick={onRetry}>Try again</button>}
  </div>;
  return null;
}

export function EmptyState({ title, children }) {
  return <div className="border border-brand-line px-6 py-12 text-center">
    <h2 className="font-semibold">{title}</h2>
    {children && <p className="mx-auto mt-2 max-w-md text-sm text-brand-gray">{children}</p>}
  </div>;
}
