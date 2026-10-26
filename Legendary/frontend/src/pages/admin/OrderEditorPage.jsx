import { Link, useParams } from 'react-router';
import { useApiResource } from '../../hooks/useApiResource';
import PageHeading from '../../components/ui/PageHeading';
import { ResourceState } from '../../components/ui/ResourceState';
import OrderForm from '../../components/portal/OrderForm';

function ExistingOrder({ orderId }) {
  const resource = useApiResource('admin/orders/' + orderId, { keepPreviousData: true });
  const order = resource.data?.data;
  return <>
    <PageHeading eyebrow="Store operations / Orders" title={order ? 'Edit ' + order.order_number : 'Edit order'}>Update delivery details, items, payment, and fulfillment.</PageHeading>
    <ResourceState loading={!order && resource.loading} error={resource.error} onRetry={resource.retry} />
    {order && <OrderForm key={order.id} order={order} />}
  </>;
}

export default function OrderEditorPage() {
  const { orderId } = useParams();
  return <>
    <Link className="text-xs underline underline-offset-4" to="/admin/orders">Back to orders</Link>
    {orderId ? <ExistingOrder key={orderId} orderId={orderId} /> : <>
      <PageHeading eyebrow="Store operations / Orders" title="Create order">Record an order and reserve its inventory.</PageHeading>
      <OrderForm />
    </>}
  </>;
}
