import { Link, useParams } from 'react-router';
import { useApiResource } from '../hooks/useApiResource';
import PageHeading from '../components/ui/PageHeading';
import { ResourceState } from '../components/ui/ResourceState';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDate, money } from '../utils/formatters';

export default function OrderDetailPage({ admin = false }) {
  const { orderId } = useParams();
  const prefix = admin ? 'admin' : 'account';
  const { data: result, loading, error, retry } = useApiResource(prefix + '/orders/' + encodeURIComponent(orderId));
  const order = result?.data;
  const address = order?.shipping_address;
  return <>
    <Link className="mb-5 inline-block text-xs underline underline-offset-4" to={'/' + prefix + '/orders'}>Back to orders</Link>
    <PageHeading eyebrow={admin ? 'Store operations / Order details' : 'My account / Order details'} title={order?.order_number || 'Order details'}>
      {order ? 'Placed ' + formatDate(order.created_at) : 'Your order information.'}
    </PageHeading>
    <ResourceState loading={loading} error={error} onRetry={retry} />
    {!loading && !error && order && <>
      <div className="mb-6 flex flex-wrap items-center gap-3"><StatusBadge status={order.status} /><span className="text-sm text-brand-gray">Payment: {order.payment_method || '—'}</span><StatusBadge status={order.payment_status} /></div>
      <div className="overflow-x-auto border border-brand-line bg-brand-white"><table className="data-table">
        <caption className="sr-only">Order items</caption><thead><tr><th scope="col">Item</th><th scope="col">Quantity</th><th scope="col">Unit price</th><th scope="col" className="text-right">Amount</th></tr></thead>
        <tbody>{order.items.map(item => <tr key={item.id}><th scope="row"><p className="font-medium">{item.product_name}</p><p className="text-xs font-normal text-brand-gray">{item.variant_label}</p></th>
          <td>{item.quantity}</td><td>{money(item.unit_price)}</td><td className="text-right">{money(item.line_total)}</td></tr>)}</tbody>
      </table></div>
      <div className="mt-7 grid gap-6 md:grid-cols-2">
        <section className="border border-brand-line bg-brand-white p-6"><h2 className="mb-4 font-display text-2xl">Delivery details</h2>
          {address ? <address className="text-sm not-italic leading-7">
            <p className="font-medium">{address.recipient_name}</p><p>{address.address_line_1}</p>{address.address_line_2 && <p>{address.address_line_2}</p>}
            <p>{address.city}, {address.province} {address.postal_code}</p><p>{address.country}</p><p className="mt-3">{address.phone}</p>
          </address> : <p className="text-sm text-brand-gray">No delivery information available.</p>}
          {admin && <p className="mt-4 break-all border-t border-brand-line pt-4 text-sm">{order.customer?.email || order.guest_email}</p>}
        </section>
        <section className="border border-brand-line bg-brand-white p-6"><h2 className="mb-4 font-display text-2xl">Order summary</h2>
          <dl className="space-y-3 text-sm">
            {[['Subtotal', order.subtotal], ['Shipping', order.shipping_fee], ['Discount', -Number(order.discount_amount)]].map(([label, value]) =>
              <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd>{money(value)}</dd></div>)}
            <div className="flex justify-between gap-4 border-t border-brand-line pt-4 text-base font-semibold"><dt>Total</dt><dd>{money(order.total)}</dd></div>
          </dl>
        </section>
      </div>
    </>}
  </>;
}
