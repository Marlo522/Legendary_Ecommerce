import { Link } from 'react-router';
import StatusBadge from '../ui/StatusBadge';
import { EmptyState } from '../ui/ResourceState';
import { formatDate, money } from '../../utils/formatters';

export default function OrdersTable({ orders, admin = false }) {
  if (!orders.length) return <EmptyState title="No orders yet">{admin ? 'New orders will appear here when customers check out.' : 'Your purchases and delivery updates will appear here.'}</EmptyState>;
  return <div className="overflow-x-auto border border-brand-line bg-brand-white">
    <table className="data-table">
      <caption className="sr-only">{admin ? 'Store orders' : 'Your orders'}</caption>
      <thead><tr><th scope="col">Order</th>{admin && <th scope="col">Customer</th>}<th scope="col">Placed</th><th scope="col">Status</th><th scope="col" className="text-right">Total</th></tr></thead>
      <tbody>{orders.map(order => <tr key={order.id}>
        <th scope="row"><Link className="font-semibold underline underline-offset-4" to={(admin ? '/admin' : '/account') + '/orders/' + order.id}>{order.order_number}</Link></th>
        {admin && <td><p>{order.customer?.name || order.guest_name || 'Guest customer'}</p><p className="text-xs text-brand-gray">{order.customer?.email || order.guest_email || '—'}</p></td>}
        <td className="whitespace-nowrap">{formatDate(order.created_at)}</td><td><StatusBadge status={order.status} /></td><td className="whitespace-nowrap text-right">{money(order.total)}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}
