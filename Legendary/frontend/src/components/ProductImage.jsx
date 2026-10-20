import { useState } from 'react';
export default function ProductImage({ image, name, className = '', priority = false }) {
  const [failedSource, setFailedSource] = useState(null);
  const source = image?.image_url;
  const valid = typeof source === 'string' && (/^https?:\/\//i.test(source) || /^\/(?!\/)/.test(source));
  if (!valid || failedSource === source) return <div className={'flex aspect-square items-center justify-center bg-brand-paper p-6 text-center text-xs text-brand-gray ' + className} role="img" aria-label={name + ': image unavailable'}>Image unavailable</div>;
  return <img src={source} alt={image.alt_text || name} className={className}
    loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" onError={() => setFailedSource(source)} />;
}
