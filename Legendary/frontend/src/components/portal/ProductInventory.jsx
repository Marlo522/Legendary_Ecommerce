import { useId, useState } from 'react';
import { useAdminMutation } from '../../hooks/useAdminMutation';
import { Field, FieldGuide, MutationFeedback } from './AdminFields';
import { money } from '../../utils/formatters';
import { variantColors, variantSizes, suggestedVariantSku } from '../../services/adminForms';

const blank = { color: '', color_hex: '', size: '', sku: '', price_override: '', stock_quantity: 0, low_stock_threshold: 5, is_active: true };

export default function ProductInventory({ product }) {
  const [values, setValues] = useState(blank);
  const mutation = useAdminMutation();
  const pickerId = useId();
  const colors = [...variantColors, ...product.variants.map(variant => ({ name: variant.color, hex: variant.color_hex }))]
    .filter((color, index, options) => options.findIndex(option => option.name.toLowerCase() === color.name.toLowerCase()) === index);
  const sizes = [...new Set([...variantSizes, ...product.variants.map(variant => variant.size).filter(size => size && size !== 'One size')])];
  const suggestedSku = suggestedVariantSku(product, values);
  function updateOption(name, value) {
    setValues(current => {
      const next = { ...current, [name]: value };
      if (name === 'color') {
        const selected = colors.find(color => color.name.toLowerCase() === value.toLowerCase());
        if (selected?.hex) next.color_hex = selected.hex;
      }
      if (!current.id && (!current.sku || current.sku === suggestedVariantSku(product, current))) next.sku = suggestedVariantSku(product, next);
      return next;
    });
  }
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
      optional="Color hex, size, and variant price. Choose One size when sizing does not apply and leave variant price blank to use the product sale or base price.">
      <p>Choose a color preset or type a custom name. Pick a color or enter its hex value. Use the suggested SKU or customize it.</p>
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
        <div>
          <Field label="SKU" required error={mutation.error?.errors?.sku} hint="Choose the suggestion or enter your own unique SKU.">
            <input className="form-input" name="sku" list={pickerId + '-skus'} required maxLength={100} value={values.sku} onChange={event => setValues({ ...values, sku: event.target.value })} />
          </Field>
          <datalist id={pickerId + '-skus'}>{suggestedSku && <option value={suggestedSku} />}</datalist>
          <button type="button" className="mt-2 text-xs underline underline-offset-4" disabled={!suggestedSku} onClick={() => setValues({ ...values, sku: suggestedSku })}>Use suggested SKU</button>
        </div>
        <div>
          <Field label="Color" required error={mutation.error?.errors?.color} hint="Choose a preset or type a custom color name.">
            <input className="form-input" name="color" list={pickerId + '-colors'} required maxLength={100} value={values.color} onChange={event => updateOption('color', event.target.value)} />
          </Field>
          <datalist id={pickerId + '-colors'}>{colors.map(color => <option key={color.name} value={color.name} />)}</datalist>
        </div>
        <div>
          <Field label="Color hex" required={false} error={mutation.error?.errors?.color_hex} hint="Enter a six-digit hex value or use the color picker below.">
            <input className="form-input" name="color_hex" pattern="#[a-fA-F0-9]{6}" maxLength={7} placeholder="#000000" value={values.color_hex} onChange={event => setValues({ ...values, color_hex: event.target.value })} />
          </Field>
          <div className="mt-2 flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs">Pick a color<input className="h-10 w-12 cursor-pointer rounded border border-brand-line" name="color_picker" type="color" value={/^#[a-fA-F0-9]{6}$/.test(values.color_hex) ? values.color_hex : '#000000'} onChange={event => setValues({ ...values, color_hex: event.target.value })} /></label>
            <button type="button" className="text-xs underline underline-offset-4" onClick={() => setValues({ ...values, color_hex: '' })}>Clear hex</button>
          </div>
        </div>
        <Field label="Size" required={false} error={mutation.error?.errors?.size}>
          <select className="form-input" name="size" value={values.size} onChange={event => updateOption('size', event.target.value)}>
            <option value={values.size === 'One size' ? 'One size' : ''}>One size</option>{sizes.map(size => <option key={size} value={size}>{size}</option>)}
          </select>
        </Field>
        {[['price_override', 'Variant price (PHP)', false], ['stock_quantity', 'Stock quantity', true], ['low_stock_threshold', 'Low stock threshold', true]].map(([name, label, required]) =>
          <Field label={label} key={name} required={required} error={mutation.error?.errors?.[name]}
            hint={name === 'low_stock_threshold' ? 'A low stock alert appears when stock reaches or falls below this number.' : undefined}>
            <input className="form-input" name={name} type="number" required={required} value={values[name]} min={0} step={name === 'price_override' ? '0.01' : '1'} max={name === 'price_override' ? 99999999.99 : 1000000}
              onChange={event => setValues({ ...values, [name]: event.target.value })} /></Field>)}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={values.is_active} onChange={event => setValues({ ...values, is_active: event.target.checked })} />Active variant<span className="text-xs text-brand-gray">Optional</span></label>
        <div className="flex flex-wrap items-end gap-3"><button className="button-primary" disabled={mutation.pending}>{mutation.pending ? 'Saving…' : values.id ? 'Save variant' : 'Add variant'}</button>
          {values.id && <button type="button" className="button-secondary" onClick={() => setValues(blank)}>Cancel edit</button>}</div>
      </fieldset>
    </form>
  </section>;
}
