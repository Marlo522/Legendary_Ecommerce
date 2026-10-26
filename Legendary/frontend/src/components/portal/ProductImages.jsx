import { useState } from 'react';
import { useAdminMutation } from '../../hooks/useAdminMutation';
import { Field, FieldGuide, MutationFeedback } from './AdminFields';

function ImageRow({ image, endpoint, pending, mutate }) {
  const [alt, setAlt] = useState(image.alt_text || '');
  const [order, setOrder] = useState(image.display_order);
  return <form onSubmit={event => {
    event.preventDefault();
    mutate(endpoint + '/' + image.id, { method: 'PUT', body: { alt_text: alt, display_order: order, updated_at: image.updated_at } });
  }} className="grid items-end gap-4 border-b border-brand-line py-5 sm:grid-cols-[80px_1fr_100px_auto]">
    <img src={image.image_url} alt={image.alt_text || ''} className="h-20 w-20 object-cover" />
    <Field label="Image description" required><input className="form-input" required maxLength={255} value={alt} onChange={event => setAlt(event.target.value)} /></Field>
    <Field label="Position" required><input className="form-input" type="number" required min={0} max={1000} value={order} onChange={event => setOrder(event.target.value)} /></Field>
    <div className="flex gap-2"><button className="button-secondary" disabled={pending}>Save</button>
      <button type="button" className="button-secondary" disabled={pending} onClick={() => {
        if (window.confirm('Remove this product image?')) mutate(endpoint + '/' + image.id, { method: 'DELETE', body: { updated_at: image.updated_at } }, undefined, 'Image removed.');
      }}>Remove</button></div>
  </form>;
}

export default function ProductImages({ product }) {
  const mutation = useAdminMutation();
  const endpoint = 'admin/products/' + product.id + '/images';
  function upload(event) {
    event.preventDefault();
    const form = event.currentTarget;
    mutation.mutate(endpoint, { method: 'POST', body: new FormData(form) }, () => form.reset(), 'Image uploaded.');
  }
  return <section className="mt-7 border border-brand-line bg-brand-white p-5 sm:p-6">
    <h2 className="font-display text-2xl">Product images</h2>
    <FieldGuide required="When uploading an image: image file, image description, and display position."
      optional="Images can be added after creating the product.">
      <p>Use JPEG, PNG, or WebP up to 5 MB. Describe the image for accessibility. Display positions run from 0 to 1000; lower numbers appear first.</p>
    </FieldGuide>
    <MutationFeedback {...mutation} />
    {[...product.images].sort((a, b) => a.display_order - b.display_order).map(image =>
      <ImageRow key={image.id + ':' + image.updated_at} image={image} endpoint={endpoint} {...mutation} />)}
    {!product.images.length && <p className="my-4 text-sm">No product images yet.</p>}
    <form onSubmit={upload} className="mt-6"><fieldset disabled={mutation.pending} className="grid items-end gap-4 sm:grid-cols-2">
      <Field label="Image file (JPEG, PNG, WebP; max 5 MB)" required><input className="form-input" type="file" name="image" accept="image/jpeg,image/png,image/webp" required /></Field>
      <Field label="Image description" required><input className="form-input" name="alt_text" maxLength={255} required /></Field>
      <Field label="Display position" required><input className="form-input" name="display_order" type="number" min={0} max={1000} defaultValue={product.images.length} required /></Field>
      <button className="button-primary" disabled={mutation.pending}>{mutation.pending ? 'Uploading…' : 'Upload image'}</button>
    </fieldset></form>
  </section>;
}
