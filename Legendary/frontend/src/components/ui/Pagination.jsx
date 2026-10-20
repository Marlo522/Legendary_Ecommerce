export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;
  return <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-brand-line pt-5">
    <p className="text-sm text-brand-gray">Page {meta.page} of {meta.last_page} · {meta.total} results</p>
    <div className="flex gap-2">
      <button className="button-secondary" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>Previous</button>
      <button className="button-secondary" disabled={meta.page >= meta.last_page} onClick={() => onPageChange(meta.page + 1)}>Next</button>
    </div>
  </nav>;
}
