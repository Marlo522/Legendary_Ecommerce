import { usePagedResource } from '../../hooks/usePagedResource';
import PageHeading from '../../components/ui/PageHeading';
import { EmptyState, ResourceState } from '../../components/ui/ResourceState';
import Pagination from '../../components/ui/Pagination';
import AddressCard from '../../components/portal/AddressCard';

export default function AddressesPage() {
  const { data, loading, error, retry, changePage } = usePagedResource('account/addresses');
  return <>
    <PageHeading eyebrow="My account" title="Delivery addresses">Your saved delivery information.</PageHeading>
    <ResourceState loading={loading} error={error} onRetry={retry} />
    {!loading && !error && data && <>
      {data.data.length ? <div className="grid gap-5 md:grid-cols-2">{data.data.map(address => <AddressCard key={address.id} address={address} />)}</div>
        : <EmptyState title="No delivery addresses saved">Your saved addresses will appear here.</EmptyState>}
      <Pagination meta={data.meta} onPageChange={changePage} />
    </>}
  </>;
}
