import { Link } from 'react-router';
import { usePagedResource } from '../../hooks/usePagedResource';
import PageHeading from '../../components/ui/PageHeading';
import { EmptyState, ResourceState } from '../../components/ui/ResourceState';
import Pagination from '../../components/ui/Pagination';
import WishlistButton from '../../components/WishlistButton';
import ProductImage from '../../components/ProductImage';
import { money } from '../../utils/formatters';

export default function WishlistPage() {
  const { data, loading, error, retry, changePage } = usePagedResource('account/wishlist');
  return <>
    <PageHeading eyebrow="My account" title="Saved pieces">The pieces you have your eye on.</PageHeading>
    <ResourceState loading={loading} error={error} onRetry={retry} />
    {!loading && !error && data && <>
      {data.data.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {data.data.map(item => {
          const product = item.product;
          const image = [...(product?.product_images || [])].sort((a, b) => a.display_order - b.display_order)[0];
          return <article key={item.id} className="border border-brand-line">
            {product && <Link to={'/products/' + product.slug}><ProductImage image={image} name={product.name} className="aspect-[4/5] w-full bg-brand-paper object-cover" /></Link>}
            <div className="p-5"><h2 className="text-sm font-medium">{product ? <Link to={'/products/' + product.slug}>{product.name}</Link> : 'This piece is no longer available.'}</h2>
              {product && <><p className="mb-4 mt-2 text-sm">{money(product.sale_price ?? product.base_price)}</p>
                <WishlistButton product={product} initiallySaved onChange={retry} /></>}
            </div>
          </article>;
        })}
      </div> : <EmptyState title="Nothing saved yet">Your saved pieces will appear here. <Link className="underline" to="/shop">Browse the collection</Link></EmptyState>}
      <Pagination meta={data.meta} onPageChange={changePage} />
    </>}
  </>;
}
