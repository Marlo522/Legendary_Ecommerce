import { useState } from 'react';
import { useAdminMutation } from '../../hooks/useAdminMutation';
import { Field, FieldGuide, MutationFeedback } from './AdminFields';
import { money } from '../../utils/formatters';

const blank = { color: '', color_hex: '', size: '', sku: '', price_override: '', stock_quantity: 0, low_stock_threshold: 5, is_active: true };

export default function ProductInventory({ product }) {
  const [values, setValues] = useState(blank);
  const mutation = useAdminMutation();
  const endpoint = 'admin/products/' + product.id + '/variants';
  function submit(event) {
    event.preventDefault();
    const body = Object.fromEntries(Object.keys(blank).map(key => [key, values[key]]));
    for (const key of ['color_hex', 'size', 'price_override']) if (body[key] === '') body[key] = null;
    if (values.id) body.updated_at = values.updated_at;
    mutation.mutate(endpoint + (values.id ? '/' + values.id : ''), { method: values.id ? 'PUT' : 'POST', body }, () => setValues(blank));
  }
  function remove(variant) {
    if (window.confirm('Delete SKU ' + variant.sku + '? Variants used by orders must be deactivated instead.')) {
      mutation.mutate(endpoint + '/' + variant.id, { method: 'DELETE', body: { updated_at: variant.updated_at } }, () => setValues(blank), 'Variant deleted.');
    }
  }
  return <section className="mt-7 border border-brand-line bg-brand-white p-5 sm:p-6">
    <h2 className="font-display text-2xl">Variants & inventory</h2>
    <p className="mt-2 text-sm text-brand-gray">Manage each color and size separately. Inactive variants stay in order history.</p>
    <FieldGuide required="A unique SKU, color, stock quantity, and low stock threshold. Stock starts at 0 and the alert threshold starts at 5."
      optional="Color hex, size, and variant price. Leave size blank for One size and variant price blank to use the product sale or base price.">
      <p>Active variant starts checked; uncheck it to stop selling that option. Stock and alert thresholds must be whole numbers of 0 or more.</p>
    </FieldGuide>
    <MutationFeedback {...mutation} />
    <div className="my-5 overflow-x-auto"><table className="data-table"><caption className="sr-only">Product variants</caption>
      <thead><tr>{['SKU / options', 'Price', 'Stock / alert at', 'Status', 'Actions'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{product.variants.map(variant => <tr key={variant.id}>
        <th scope="row">{variant.sku}<p className="font-normal">{variant.color} / {variant.size || 'One size'}</p></th>
        <td>{money(variant.price_override ?? product.sale_price ?? product.base_price)}</td>
        <td>{variant.stock_quantity} / {variant.low_stock_threshold}{variant.stock_quantity <= variant.low_stock_threshold && <p className="text-xs text-brand-danger">Low stock</p>}</td>
        <td>{variant.is_active ? 'Active' : 'Inactive'}</td>
        <td><div className="flex gap-2"><button type="button" className="button-secondary" disabled={mutation.pending} onClick={() => setValues({ ...variant, color_hex: variant.color_hex ?? '', size: variant.size ?? '', price_override: variant.price_override ?? '' })}>Edit</button>
          <button type="button" className="button-secondary" disabled={mutation.pending} onClick={() => remove(variant)}>Delete</button></div></td>
      </tr>)}</tbody>
    </table>{!product.variants.length && <p className="py-4 text-sm">No variants. Add an option below to start tracking stock.</p>}</div>
    <form onSubmit={submit}><h3 className="mb-4 font-semibold">{values.id ? 'Edit variant' : 'Add variant'}</h3>
      <fieldset disabled={mutation.pending} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[['sku', 'SKU', 'text', true], ['color', 'Color', 'text', true], ['color_hex', 'Color hex', 'text', false], ['size', 'Size', 'text', false],
          ['price_override', 'Variant price (PHP)', 'number', false], ['stock_quantity', 'Stock quantity', 'number', true], ['low_stock_threshold', 'Low stock threshold', 'number', true]].map(([name, label, type, required]) =>
          <Field label={label} key={name} required={required} error={mutation.error?.errors?.[name]}
            hint={name === 'color_hex' ? 'Use a six-digit hex color, for example #000000.' : name === 'low_stock_threshold' ? 'A low stock alert appears when stock reaches or falls below this number.' : undefined}>
            <input className="form-input" name={name} type={type} required={required} value={values[name]}
              {...(name === 'color_hex' ? { pattern: '#[a-fA-F0-9]{6}', placeholder: '#000000' } : {})}
            {...(type === 'number' ? { min: 0, step: name === 'price_override' ? '0.01' : '1', max: name === 'price_override' ? 99999999.99 : 1000000 } : { maxLength: name === 'size' ? 20 : name === 'color_hex' ? 7 : 100 })}
            onChange={event => setValues({ ...values, [name]: event.target.value })} /></Field>)}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={values.is_active} onChange={event => setValues({ ...values, is_active: event.target.checked })} />Active variant<span className="text-xs text-brand-gray">Optional</span></label>
        <div className="flex flex-wrap items-end gap-3"><button className="button-primary" disabled={mutation.pending}>{mutation.pending ? 'Saving…' : values.id ? 'Save variant' : 'Add variant'}</button>
          {values.id && <button type="button" className="button-secondary" onClick={() => setValues(blank)}>Cancel edit</button>}</div>
      </fieldset>
    </form>
  </section>;
}
