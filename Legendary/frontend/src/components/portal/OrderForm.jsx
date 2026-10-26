import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdminMutation } from '../../hooks/useAdminMutation';
import { Field, MutationFeedback } from './AdminFields';
import OrderItemPicker from './OrderItemPicker';
import { money } from '../../utils/formatters';
import { orderIsLocked, orderPayload, paymentOptions, statusOptions } from '../../services/adminForms';

const blankAddress = { recipient_name: '', phone: '', address_line_1: '', address_line_2: '', city: '', province: '', postal_code: '', country: 'PH' };

export default function OrderForm({ order }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(() => ({
    guest_name: order?.guest_name || order?.customer?.name || '',
    guest_email: order?.guest_email || order?.customer?.email || '',
    guest_phone: order?.guest_phone || order?.shipping_address?.phone || '',
    shipping_address: { ...blankAddress, ...order?.shipping_address },
    status: order?.status || 'pending', payment_method: order?.payment_method || 'Cash on delivery',
    payment_status: order?.payment_status || 'pending', shipping_fee: order?.shipping_fee ?? 0,
    discount_amount: order?.discount_amount ?? 0, notes: order?.notes || '',
    items: (order?.items || []).map(item => ({ variant_id: item.product_variant_id, quantity: item.quantity, unit_price: item.unit_price, label: item.product_name + ' / ' + item.variant_label })),
    ...(order ? { updated_at: order.updated_at } : {}),
  }));
  const mutation = useAdminMutation();
  const locked = orderIsLocked(order);
  const subtotal = values.items.reduce((sum, item) => sum + Math.round(Number(item.unit_price) * 100) * Number(item.quantity), 0) / 100;
  function set(name, value) { setValues(current => ({ ...current, [name]: value })); }
  function submit(event) {
    event.preventDefault();
    if (order && values.status !== order.status && !window.confirm('Change order status to ' + values.status + '? Inventory will be updated if cancelled.')) return;
    mutation.mutate('admin/orders' + (order ? '/' + order.id : ''), { method: order ? 'PUT' : 'POST', body: orderPayload(values) },
      result => navigate('/admin/orders/' + result.data.id, { state: { notice: order ? 'Order updated.' : 'Order created.' } }), order ? 'Order updated.' : 'Order created.');
  }
  return <form onSubmit={submit}>
    <MutationFeedback {...mutation} />
    <fieldset disabled={mutation.pending} className="space-y-6">
      <section className="border border-brand-line bg-brand-white p-5 sm:p-6">
        <h2 className="mb-5 font-display text-2xl">Customer & delivery</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[['guest_name', 'Customer name', 'text'], ['guest_email', 'Email', 'email'], ['guest_phone', 'Phone', 'tel']].map(([name, label, type]) =>
            <Field label={label} key={name}><input className="form-input" type={type} required maxLength={name === 'guest_phone' ? 50 : 255} value={values[name]} onChange={event => set(name, event.target.value)} /></Field>)}
          {Object.entries({ recipient_name: 'Recipient name', phone: 'Delivery phone', address_line_1: 'Address line 1', address_line_2: 'Address line 2 (optional)', city: 'City', province: 'Province', postal_code: 'Postal code', country: 'Country code' }).map(([name, label]) =>
            <Field label={label} key={name}><input className="form-input" required={name !== 'address_line_2'} maxLength={name === 'country' ? 2 : name === 'postal_code' ? 20 : name === 'phone' ? 50 : name === 'recipient_name' ? 255 : name.startsWith('address_') ? 1000 : 100} value={values.shipping_address[name] ?? ''} onChange={event => set('shipping_address', { ...values.shipping_address, [name]: event.target.value })} /></Field>)}
        </div>
      </section>
      <section className="border border-brand-line bg-brand-white p-5 sm:p-6">
        <h2 className="font-display text-2xl">Order items</h2>
        {locked && <p className="my-3 text-sm">Items and amounts are fixed after payment, shipment, or cancellation.</p>}
        <div className="my-4 overflow-x-auto"><table className="data-table"><caption className="sr-only">Edit order items</caption>
          <thead><tr>{['Item', 'Quantity', 'Unit price', 'Amount', 'Action'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>{values.items.map((item, index) => <tr key={item.variant_id}><th scope="row">{item.label}</th>
            <td><input aria-label={'Quantity for ' + item.label} className="form-input w-24" required type="number" min={1} max={99} step={1} disabled={locked} value={item.quantity} onChange={event => set('items', values.items.map((entry, offset) => offset === index ? { ...entry, quantity: event.target.value } : entry))} /></td>
            <td>{money(item.unit_price)}</td><td>{money(Number(item.unit_price) * Number(item.quantity))}</td>
            <td><button type="button" className="button-secondary" disabled={locked} onClick={() => set('items', values.items.filter((_, offset) => offset !== index))}>Remove</button></td>
          </tr>)}</tbody>
        </table></div>
        {!values.items.length && <p className="text-sm">Add at least one product variant to this order.</p>}
        {!locked && <OrderItemPicker items={values.items} disabled={mutation.pending} onAdd={item => set('items', [...values.items, item])} />}
      </section>
      <section className="border border-brand-line bg-brand-white p-5 sm:p-6">
        <h2 className="mb-5 font-display text-2xl">Status & totals</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Order status"><select className="form-input" value={values.status} onChange={event => set('status', event.target.value)}>
            {(order ? statusOptions(order.status) : ['pending', 'confirmed']).map(status => <option key={status}>{status}</option>)}
          </select></Field>
          <Field label="Payment status"><select className="form-input" value={values.payment_status} onChange={event => set('payment_status', event.target.value)}>
            {paymentOptions(order?.payment_status).map(status => <option key={status}>{status}</option>)}
          </select></Field>
          <Field label="Payment method"><input className="form-input" required maxLength={50} value={values.payment_method} onChange={event => set('payment_method', event.target.value)} /></Field>
          {[['shipping_fee', 'Shipping fee (PHP)'], ['discount_amount', 'Manual discount (PHP)']].map(([name, label]) =>
            <Field label={label} key={name}><input className="form-input" required type="number" min={0} max={name === 'discount_amount' ? subtotal : 999999.99} step="0.01" disabled={locked} value={values[name]} onChange={event => set(name, event.target.value)} /></Field>)}
          <Field label="Notes (optional)"><textarea className="form-input" rows={3} maxLength={5000} value={values.notes} onChange={event => set('notes', event.target.value)} /></Field>
        </div>
        <div className="mt-5 border-t border-brand-line pt-4 text-sm"><p>Subtotal: {money(subtotal)}</p>
          <p className="mt-2 font-semibold">Estimated total: {money(subtotal + Number(values.shipping_fee) - Number(values.discount_amount))}</p>
          <p className="mt-2 text-brand-gray">The store verifies prices, totals, and available stock when you save.</p>
        </div>
      </section>
      <button className="button-primary" disabled={mutation.pending || !values.items.length}>{mutation.pending ? 'Saving…' : order ? 'Save order' : 'Create order'}</button>
    </fieldset>
  </form>;
}
