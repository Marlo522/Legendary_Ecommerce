import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useApiResource } from '../../hooks/useApiResource';
import PageHeading from '../../components/ui/PageHeading';
import { ResourceState } from '../../components/ui/ResourceState';
import ProductForm from '../../components/portal/ProductForm';
import ProductInventory from '../../components/portal/ProductInventory';
import ProductImages from '../../components/portal/ProductImages';
import { useAdminMutation } from '../../hooks/useAdminMutation';
import { MutationFeedback } from '../../components/portal/AdminFields';

export default function ProductEditorPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const creating = !productId;
  const resource = useApiResource(creating ? 'admin/categories' : 'admin/products/' + productId, { keepPreviousData: true });
  const categories = useApiResource('admin/categories', { keepPreviousData: true });
  const product = creating ? null : resource.data?.data;
  const categoryList = categories.data?.data;
  const mutation = useAdminMutation();
  const ready = categoryList && (creating || product?.id === Number(productId));
  return <>
    <Link to="/admin/products" className="text-xs underline underline-offset-4">Back to products</Link>
    <PageHeading eyebrow="Store operations / Catalog" title={creating ? 'Add product' : product?.name || 'Edit product'}>Manage product details, images, variants, and stock.</PageHeading>
    <ResourceState loading={!ready && (resource.loading || categories.loading)} error={resource.error || categories.error} onRetry={() => { resource.retry(); categories.retry(); }} />
    <MutationFeedback error={mutation.error} success={mutation.success || location.state?.notice} />
    {ready && <>
      <ProductForm key={productId || 'new'} product={creating ? null : product} categories={categoryList} />
      {!creating && <>
        <ProductInventory product={product} />
        <ProductImages product={product} />
        <div className="mt-7 border-t border-brand-line pt-6"><p className="mb-3 text-sm">Products used in orders must be archived to preserve purchase history.</p>
          <button className="button-secondary" disabled={mutation.pending} onClick={() => {
            if (window.confirm('Delete ' + product.name + ' and its variants and images? This cannot be undone.')) {
              mutation.mutate('admin/products/' + product.id, { method: 'DELETE', body: { updated_at: product.updated_at } }, () => navigate('/admin/products', { state: { notice: 'Product deleted.' } }), 'Product deleted.');
            }
          }}>{mutation.pending ? 'Deleting…' : 'Delete product'}</button>
        </div>
      </>}
    </>}
  </>;
}
