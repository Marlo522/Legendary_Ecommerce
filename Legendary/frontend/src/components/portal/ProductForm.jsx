import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdminMutation } from '../../hooks/useAdminMutation';
import { Field, FieldGuide, MutationFeedback } from './AdminFields';

const blank = {
  name: '', slug: '', category_id: '', description: '', material: '', care_instructions: '',
  base_price: '', sale_price: '', status: 'draft', is_featured: false, is_new_arrival: false,
};

export default function ProductForm({ product, categories }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(() => ({ ...blank, ...product, sale_price: product?.sale_price ?? '' }));
  const mutation = useAdminMutation();
  function field(name, label, options = {}) {
    const { hint, ...inputOptions } = options;
    return <Field label={label} required={Boolean(options.required)} hint={hint} error={mutation.error?.errors?.[name]}>
      <input className="form-input" name={name} value={values[name] ?? ''} onChange={event => setValues({ ...values, [name]: event.target.value })} {...inputOptions} />
    </Field>;
  }
  function submit(event) {
    event.preventDefault();
    if (product && values.status !== product.status && !window.confirm('Change product status to ' + values.status + '?')) return;
    const body = Object.fromEntries(Object.keys(blank).map(key => [key, values[key]]));
    body.category_id = Number(body.category_id);
    body.sale_price = body.sale_price === '' ? null : body.sale_price;
    if (product) body.updated_at = values.updated_at;
    mutation.mutate('admin/products' + (product ? '/' + product.id : ''), { method: product ? 'PUT' : 'POST', body },
      result => {
        setValues({ ...blank, ...result.data, sale_price: result.data.sale_price ?? '' });
        if (!product) navigate('/admin/products/' + result.data.id, { replace: true, state: { notice: 'Product created. Add variants and images below.' } });
      });
  }
  return <form onSubmit={submit} className="border border-brand-line bg-brand-white p-5 sm:p-6">
    <h2 className="font-display text-2xl">Product details</h2>
    <FieldGuide required="Product name, URL slug, category, base price, and publishing status (starts as Draft)."
      optional="Sale price, material, description, and care instructions. Featured and New arrival can stay unchecked.">
      <p>Create the product first, then add variants to track stock and upload images.</p>
    </FieldGuide>
    <MutationFeedback {...mutation} />
    <fieldset disabled={mutation.pending} className="grid gap-5 sm:grid-cols-2">
      {field('name', 'Product name', { required: true, maxLength: 255 })}
      {field('slug', 'URL slug', { required: true, pattern: '[a-z0-9]+(-[a-z0-9]+)*', maxLength: 255, placeholder: 'everyday-tee', hint: 'Use a unique slug with lowercase letters, numbers, and hyphens, for example everyday-tee.' })}
      <Field label="Category" required error={mutation.error?.errors?.category_id}><select className="form-input" required value={values.category_id} onChange={event => setValues({ ...values, category_id: event.target.value })}>
        <option value="">Choose a category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select></Field>
      <Field label="Publishing status" required hint="Draft keeps the product unpublished; Active publishes it; Archived removes it from the catalog."><select className="form-input" required value={values.status} onChange={event => setValues({ ...values, status: event.target.value })}>
        {['draft', 'active', 'archived'].map(status => <option key={status}>{status}</option>)}
      </select></Field>
      {field('base_price', 'Base price (PHP)', { type: 'number', min: 0, max: 99999999.99, step: '0.01', required: true })}
      {field('sale_price', 'Sale price (PHP)', { type: 'number', min: 0, max: values.base_price || 99999999.99, step: '0.01', hint: 'Leave blank for the base price. A sale price must not exceed the base price.' })}
      {field('material', 'Material', { maxLength: 255 })}
      <Field label="Description" required={false}><textarea className="form-input" maxLength={10000} rows={3} value={values.description ?? ''} onChange={event => setValues({ ...values, description: event.target.value })} /></Field>
      <Field label="Care instructions" required={false}><textarea className="form-input" maxLength={5000} rows={3} value={values.care_instructions ?? ''} onChange={event => setValues({ ...values, care_instructions: event.target.value })} /></Field>
      <div className="flex flex-wrap items-center gap-5">{[['is_featured', 'Featured'], ['is_new_arrival', 'New arrival']].map(([name, label]) =>
        <label key={name} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={values[name]} onChange={event => setValues({ ...values, [name]: event.target.checked })} />{label}<span className="text-xs text-brand-gray">Optional</span></label>)}</div>
      <div className="sm:col-span-2"><button className="button-primary" disabled={mutation.pending}>{mutation.pending ? 'Saving…' : product ? 'Save product' : 'Create product'}</button></div>
    </fieldset>
  </form>;
}
