import { usePagedResource } from '../../hooks/usePagedResource';
import PageHeading from '../../components/ui/PageHeading';
import { EmptyState, ResourceState } from '../../components/ui/ResourceState';
import Pagination from '../../components/ui/Pagination';
import { formatDate } from '../../utils/formatters';

export default function CustomersPage() {
  const { data, loading, error, retry, changePage } = usePagedResource('admin/customers');
  return <>
    <PageHeading eyebrow="Store operations" title="Customers">Registered customer accounts.</PageHeading>
    <ResourceState loading={loading} error={error} onRetry={retry} />
    {!loading && !error && data && <>
      {data.data.length ? <div className="overflow-x-auto border border-brand-line bg-brand-white"><table className="data-table">
        <caption className="sr-only">Customer accounts</caption><thead><tr><th scope="col">Customer</th><th scope="col">Email address</th><th scope="col">Joined</th></tr></thead>
        <tbody>{data.data.map(customer => <tr key={customer.id}><th scope="row" className="font-medium">{customer.name}</th>
          <td>{customer.email}</td><td className="whitespace-nowrap">{formatDate(customer.created_at)}</td></tr>)}</tbody>
      </table></div> : <EmptyState title="No customer accounts yet">Registered customers will appear here.</EmptyState>}
      <Pagination meta={data.meta} onPageChange={changePage} />
    </>}
  </>;
}
