import { Link, useLocation } from 'react-router';
import { usePagedResource } from '../../hooks/usePagedResource';
import PageHeading from '../../components/ui/PageHeading';
import { EmptyState, ResourceState } from '../../components/ui/ResourceState';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import AdminFilters from '../../components/portal/AdminFilters';
import { useAdminListEndpoint } from '../../hooks/useAdminListEndpoint';
import { money } from '../../utils/formatters';

export default function ProductsPage() {
  const location = useLocation();
  const { data, loading, error, retry, changePage } = usePagedResource(useAdminListEndpoint('admin/products'));
  return <>
    <PageHeading eyebrow="Store operations / Catalog" title="Products & inventory">Current prices, publishing status, and stock across active variants.</PageHeading>
    <Link to="/admin/products/new" className="button-primary mb-6">Add product</Link>
    <details className="mb-6 border border-brand-line bg-brand-white p-5 text-sm">
      <summary className="cursor-pointer font-semibold">Guide to required and optional fields</summary>
      <div className="mt-4 space-y-3 text-brand-gray">
        <p><strong className="text-brand-black">Product details:</strong> Product name, URL slug, category, base price, and publishing status are required. Sale price, material, description, care instructions, Featured, and New arrival are optional.</p>
        <p><strong className="text-brand-black">Variants & inventory:</strong> SKU, color, stock quantity, and low stock threshold are required. Color hex, size, and variant price are optional. Active variant starts checked.</p>
        <p><strong className="text-brand-black">Images:</strong> Adding images is optional. Each upload requires an image file, description, and display position.</p>
        <p>Start with Add product, save the product details, then add variants and images. Each form explains accepted formats and default values.</p>
      </div>
    </details>
    {location.state?.notice && <p role="status" className="mb-4 text-sm text-brand-success">{location.state.notice}</p>}
    <AdminFilters statuses={['draft', 'active', 'archived']} searchLabel="Search product name" />
    <ResourceState loading={loading} error={error} onRetry={retry} />
    {!loading && !error && data && <>
      {data.data.length ? <div className="overflow-x-auto border border-brand-line bg-brand-white"><table className="data-table">
        <caption className="sr-only">Product inventory</caption><thead><tr><th scope="col">Product</th><th scope="col">Category</th><th scope="col">Price</th><th scope="col">Status</th><th scope="col">Stock</th></tr></thead>
        <tbody>{data.data.map(product => <tr key={product.id}>
          <th scope="row" className="font-medium"><Link to={'/admin/products/' + product.id} className="underline underline-offset-4">{product.name}</Link></th><td>{product.category?.name || '—'}</td><td className="whitespace-nowrap">{money(product.sale_price ?? product.base_price)}</td>
          <td><StatusBadge status={product.status} /></td><td><p>{product.stock_quantity} available</p>{product.has_low_stock && <p className="mt-1 text-xs text-brand-danger">Low stock in one or more variants</p>}</td>
        </tr>)}</tbody>
      </table></div> : <EmptyState title="No products yet">Clear the current filters or add a product to the catalog.</EmptyState>}
      <Pagination meta={data.meta} onPageChange={changePage} />
    </>}
  </>;
}
