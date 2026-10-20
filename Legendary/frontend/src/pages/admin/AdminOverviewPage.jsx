import { Link } from 'react-router';
import { useApiResource } from '../../hooks/useApiResource';
import PageHeading from '../../components/ui/PageHeading';
import StatGrid from '../../components/ui/StatGrid';
import { ResourceState } from '../../components/ui/ResourceState';
import OrdersTable from '../../components/portal/OrdersTable';

export default function AdminOverviewPage() {
  const { data: result, loading, error, retry } = useApiResource('admin');
  const data = result?.data;
  return <>
    <PageHeading eyebrow="Legendary / Store overview" title="Store dashboard">A current view of orders, the catalog, and your customers.</PageHeading>
    <ResourceState loading={loading} error={error} onRetry={retry} />
    {!loading && !error && data && <>
      <StatGrid items={[
        { label: 'Total orders', value: data.stats.orders },
        { label: 'Awaiting fulfillment', value: data.stats.awaiting_fulfillment },
        { label: 'Active products', value: data.stats.active_products },
        { label: 'Customers', value: data.stats.customers },
      ]} />
      <section className="border border-brand-line bg-brand-white p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-display text-2xl tracking-wide">Recent orders</h2><p className="mt-1 text-xs text-brand-gray">The five most recent purchases.</p></div>
          <Link to="/admin/orders" className="text-xs font-medium underline underline-offset-4">View all orders</Link>
        </div>
        <OrdersTable orders={data.recent_orders} admin />
      </section>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Link to="/admin/products" className="border border-brand-line bg-brand-white p-6 hover:border-brand-black">
          <p className="editorial-caption">Catalog & inventory</p><h2 className="mt-3 font-display text-2xl">Review your products</h2>
          <p className="mt-2 text-sm text-brand-gray">Check published status, pricing, and available stock.</p></Link>
        <Link to="/admin/customers" className="border border-brand-line bg-brand-white p-6 hover:border-brand-black">
          <p className="editorial-caption">Customers</p><h2 className="mt-3 font-display text-2xl">View customer accounts</h2>
          <p className="mt-2 text-sm text-brand-gray">See registered customers and account information.</p></Link>
      </div>
    </>}
  </>;
}
