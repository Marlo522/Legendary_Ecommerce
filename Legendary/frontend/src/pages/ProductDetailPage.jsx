import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { useApiResource } from '../hooks/useApiResource';
import ProductImage from '../components/ProductImage';
import ProductPurchase from '../components/ProductPurchase';
import ProductReviews from '../components/ProductReviews';
import ProductGrid from '../components/ProductGrid';
import { ResourceState } from '../components/ui/ResourceState';

function ProductDetail({ product }) {
  const location = useLocation();
  const [imageIndex, setImageIndex] = useState(0);
  const previous = location.state?.catalogPath;
  const catalogPath = typeof previous === 'string' && (previous === '/shop' || previous.startsWith('/shop?')) ? previous : '/shop';
  return <>
    <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap gap-3 text-xs text-brand-gray">
      <Link to="/">Home</Link><span>/</span><Link to={catalogPath}>Shop</Link>
      {product.category && <><span>/</span><Link to={'/shop?category=' + encodeURIComponent(product.category.slug)}>{product.category.name}</Link></>}
      <span>/</span><span className="text-brand-black">{product.name}</span>
    </nav>
    <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-14">
      <div className="min-w-0 lg:col-span-7">
        <div className="aspect-[4/5] overflow-hidden bg-brand-paper"><ProductImage image={product.images[imageIndex]} name={product.name} priority className="h-full w-full object-cover" /></div>
        {product.images.length > 1 && <div className="mt-3 grid grid-cols-4 gap-3" aria-label="Product images">
          {product.images.map((image, index) => <button key={image.id} type="button" aria-label={'View image ' + (index + 1)} aria-pressed={imageIndex === index}
            onClick={() => setImageIndex(index)} className={'aspect-square overflow-hidden border ' + (imageIndex === index ? 'border-brand-black' : 'border-brand-line')}>
            <ProductImage image={image} name={product.name} className="h-full w-full object-cover" />
          </button>)}
        </div>}
      </div>
      <div className="lg:col-span-5"><ProductPurchase product={product} /></div>
    </div>
    <div className="mt-14"><ProductReviews product={product} /></div>
    {product.related_products.length > 0 && <section className="border-t border-brand-line py-12">
      <p className="editorial-caption mb-3">Keep it together</p><h2 className="display-heading mb-9 text-4xl">More from the collection</h2>
      <ProductGrid products={product.related_products} />
    </section>}
  </>;
}
export default function ProductDetailPage() {
  const { slug } = useParams();
  const { data, loading, error, retry } = useApiResource('catalog/products/' + encodeURIComponent(slug), { authenticate: false });
  return <section className="mx-auto w-full max-w-[1280px] px-6 py-8 lg:px-10 lg:py-12">
    {loading ? <div role="status" aria-label="Loading product" className="grid animate-pulse gap-8 lg:grid-cols-2">
      <div className="aspect-[4/5] bg-brand-paper" /><div><div className="mt-8 h-14 w-3/4 bg-brand-paper" /><div className="mt-8 h-24 bg-brand-paper" /><div className="mt-8 h-12 bg-brand-paper" /></div>
    </div> : error ? <><ResourceState error={error} onRetry={retry} /><Link to="/shop" className="button-secondary mt-5">Back to shop</Link></> :
      data && <ProductDetail key={data.data.id} product={data.data} />}
  </section>;
}
