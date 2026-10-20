import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../features/auth/useAuth';
import { apiRequest } from '../services/apiClient';

export default function WishlistButton({ product, compact = false, initiallySaved = false, onChange }) {
  const { user, status } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  async function toggle() {
    if (!user) { navigate('/login', { state: { from: '/products/' + product.slug } }); return; }
    setPending(true); setError(null);
    try {
      const result = await apiRequest('account/wishlist', { method: 'POST', body: { slug: product.slug, saved: !saved } });
      setSaved(result.data.saved); onChange?.(result.data.saved);
    } catch (failure) { setError(failure.message); }
    finally { setPending(false); }
  }
  return <div className={compact ? 'absolute right-3 top-3 z-10' : ''}>
    <button type="button" aria-label={(saved ? 'Remove ' : 'Save ') + product.name + (saved ? ' from wishlist' : ' to wishlist')}
      aria-pressed={saved} disabled={pending || status === 'loading'} onClick={toggle}
      className={compact ? 'flex h-10 w-10 items-center justify-center border border-brand-line bg-brand-white disabled:opacity-50' : 'button-secondary w-full gap-2'}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
      {!compact && (pending ? 'Saving…' : saved ? 'Saved to wishlist' : 'Save to wishlist')}
    </button>
    {error && <p role="alert" className={'mt-2 border border-brand-line bg-brand-white p-2 text-xs text-brand-danger ' + (compact ? 'absolute right-0 w-48' : '')}>{error}</p>}
  </div>;
}
