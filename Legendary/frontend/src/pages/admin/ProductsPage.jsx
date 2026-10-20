import { usePagedResource } from '../../hooks/usePagedResource';
import PageHeading from '../../components/ui/PageHeading';
import { EmptyState, ResourceState } from '../../components/ui/ResourceState';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import { money } from '../../utils/formatters';

export default function ProductsPage() {
  const { data, loading, error, retry, changePage } = usePagedResource('admin/products');
  return <>
    <PageHeading eyebrow="Store operations / Catalog" title="Products & inventory">Current prices, publishing status, and stock across active variants.</PageHeading>
    <ResourceState loading={loading} error={error} onRetry={retry} />
    {!loading && !error && data && <>
      {data.data.length ? <div className="overflow-x-auto border border-brand-line bg-brand-white"><table className="data-table">
        <caption className="sr-only">Product inventory</caption><thead><tr><th scope="col">Product</th><th scope="col">Category</th><th scope="col">Price</th><th scope="col">Status</th><th scope="col">Stock</th></tr></thead>
        <tbody>{data.data.map(product => <tr key={product.id}>
          <th scope="row" className="font-medium">{product.name}</th><td>{product.category?.name || '—'}</td><td className="whitespace-nowrap">{money(product.sale_price ?? product.base_price)}</td>
          <td><StatusBadge status={product.status} /></td><td><p>{product.stock_quantity} available</p>{product.has_low_stock && <p className="mt-1 text-xs text-brand-danger">Low stock in one or more variants</p>}</td>
        </tr>)}</tbody>
      </table></div> : <EmptyState title="No products yet">Products will appear here once added to the catalog.</EmptyState>}
      <Pagination meta={data.meta} onPageChange={changePage} />
    </>}
  </>;
}
