import { useState } from 'react';
import { useApiResource } from '../hooks/useApiResource';
import { formatDate } from '../utils/formatters';
import Pagination from './ui/Pagination';
import { EmptyState, ResourceState } from './ui/ResourceState';
export default function ProductReviews({ product }) {
  const [page, setPage] = useState(1);
  const { data, loading, error, retry } = useApiResource('catalog/products/' + encodeURIComponent(product.slug) + '/reviews?page=' + page, { authenticate: false });
  return <section id="product-reviews" className="border-t border-brand-line py-12 lg:py-16">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><p className="editorial-caption mb-3">Customer notes</p><h2 className="display-heading text-4xl">Ratings & reviews</h2></div>
      <p className="text-sm text-brand-gray">{product.review_count ? product.average_rating + ' / 5 from ' + product.review_count + ' reviews' : 'No ratings yet'}</p>
    </div>
    <ResourceState loading={loading} error={error} onRetry={retry} label="Loading reviews…" />
    {!loading && !error && data && <>
      {data.data.length ? <div className="grid gap-x-12 md:grid-cols-2">{data.data.map(review => <article key={review.id} className="border-t border-brand-line py-6">
        <div className="flex justify-between gap-3 text-xs"><p className="font-medium">{review.rating} / 5 · Customer review</p><time dateTime={review.created_at} className="text-brand-gray">{formatDate(review.created_at)}</time></div>
        {review.comment && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{review.comment}</p>}
      </article>)}</div> : <EmptyState title="No reviews yet">Customer reviews will appear here once they are approved.</EmptyState>}
      <Pagination meta={data.meta} onPageChange={setPage} />
    </>}
  </section>;
}
