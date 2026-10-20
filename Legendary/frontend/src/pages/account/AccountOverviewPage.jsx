import { Link } from 'react-router';
import { useAuth } from '../../features/auth/useAuth';
import { useApiResource } from '../../hooks/useApiResource';
import PageHeading from '../../components/ui/PageHeading';
import StatGrid from '../../components/ui/StatGrid';
import { EmptyState, ResourceState } from '../../components/ui/ResourceState';
import OrdersTable from '../../components/portal/OrdersTable';
import AddressCard from '../../components/portal/AddressCard';

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const { data: result, loading, error, retry } = useApiResource('account');
  const data = result?.data;
  return <>
    <PageHeading eyebrow="My account" title={'Welcome back, ' + user.name.split(' ')[0] + '.'}>Your orders, saved pieces, and delivery details.</PageHeading>
    <ResourceState loading={loading} error={error} onRetry={retry} />
    {!loading && !error && data && <>
      <StatGrid items={[
        { label: 'Orders', value: data.stats.orders }, { label: 'Saved pieces', value: data.stats.saved_items },
        { label: 'Delivery addresses', value: data.stats.addresses },
      ]} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl tracking-wide">Recent orders</h2>
        <Link className="text-xs font-medium underline underline-offset-4" to="/account/orders">View all orders</Link></div>
      <OrdersTable orders={data.recent_orders} />
      <div className="mt-9 grid gap-6 md:grid-cols-2">
        <section><h2 className="mb-4 font-display text-2xl tracking-wide">Member profile</h2>
          <div className="border border-brand-line p-6"><dl className="space-y-4 text-sm">
            <div><dt className="editorial-caption mb-1">Name</dt><dd>{user.name}</dd></div>
            <div><dt className="editorial-caption mb-1">Email address</dt><dd className="break-all">{user.email}</dd></div>
          </dl></div>
        </section>
        <section><h2 className="mb-4 font-display text-2xl tracking-wide">Delivery address</h2>
          {data.delivery_address ? <AddressCard address={data.delivery_address} /> : <EmptyState title="No saved address">Your delivery details will appear here.</EmptyState>}
        </section>
      </div>
    </>}
  </>;
}
