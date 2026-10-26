import { Link, useLocation } from 'react-router';
import AdminFilters from '../components/portal/AdminFilters';
import { useAdminListEndpoint } from '../hooks/useAdminListEndpoint';
import PageHeading from '../components/ui/PageHeading';
import { ResourceState } from '../components/ui/ResourceState';
import Pagination from '../components/ui/Pagination';
import OrdersTable from '../components/portal/OrdersTable';
import { usePagedResource } from '../hooks/usePagedResource';

export default function OrdersPage({ admin = false }) {
  const location = useLocation();
  const adminEndpoint = useAdminListEndpoint('admin/orders');
  const { data, loading, error, retry, changePage } = usePagedResource(admin ? adminEndpoint : 'account/orders');
  return <>
    <PageHeading eyebrow={admin ? 'Store operations' : 'My account'} title={admin ? 'Orders' : 'Your orders'}>
      {admin ? 'Customer purchases and their current fulfillment status.' : 'Review your purchases and follow their delivery status.'}
    </PageHeading>
    {admin && <Link to="/admin/orders/new" className="button-primary mb-6">Create order</Link>}
    {admin && location.state?.notice && <p role="status" className="mb-4 text-sm text-brand-success">{location.state.notice}</p>}
    {admin && <AdminFilters statuses={['pending', 'confirmed', 'packed', 'shipped', 'completed', 'cancelled']} searchLabel="Search order number, name, or email" />}
    <ResourceState loading={loading} error={error} onRetry={retry} />
    {!loading && !error && data && <><OrdersTable orders={data.data} admin={admin} /><Pagination meta={data.meta} onPageChange={changePage} /></>}
  </>;
}
