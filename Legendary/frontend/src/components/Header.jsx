import { useState } from 'react';
import BrandLogo from './BrandLogo';
import { Link } from 'react-router';
import { useAuth } from '../features/auth/useAuth';
import { postLoginPath } from '../features/auth/authPaths';
import { prefetchResource } from '../services/resourceCache';
import { useStorefront } from '../hooks/useStorefront';



export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { metadata, cart } = useStorefront();
  const links = [['Shop', '/shop'], ...(metadata.data?.data.categories || []).map(category => [category.name, '/shop?category=' + encodeURIComponent(category.slug)]),
    ['Build Your Look', '/#build-your-look-promo'], ['About', '/#brand-story']];
  const { user, status } = useAuth();
  const accountPath = user ? postLoginPath(user) : '/login';
  const accountLabel = user ? (user.role === 'admin' ? 'Dashboard' : 'My account') : 'Sign in';
  return <header id="site-header" className="sticky top-0 z-40 border-b border-brand-line bg-brand-white">
    <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
      <div className="flex h-16 items-center justify-between gap-5 lg:h-20">
        <Link id="site-logo" to="/" aria-label="Legendary Lifestyle home" className="shrink-0"><BrandLogo inverted className="w-20 sm:w-24 lg:w-28" /></Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
          {links.map(([label, href]) => <Link key={label} to={href} className="text-[0.7rem] font-medium uppercase tracking-wider hover:text-brand-gray">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-5">
          <Link to="/account/wishlist" aria-label="Saved items" className="hidden hover:text-brand-gray sm:block">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
          </Link>
          <Link id="account-btn" to={accountPath} onMouseEnter={() => user && prefetchResource(user.role === 'admin' ? 'admin' : 'account')} onFocus={() => user && prefetchResource(user.role === 'admin' ? 'admin' : 'account')} className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider hover:text-brand-gray">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="7" r="4" /><path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
            </svg>
            <span>{status === 'loading' ? 'Account' : accountLabel}</span>
          </Link>
          <Link to="/cart" aria-label={'Shopping bag, ' + (cart?.count || 0) + ' items'} className="flex items-center gap-1 text-xs"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z" /><path d="M9 8V5a3 3 0 0 1 6 0v3" /></svg><span>{cart?.count || 0}</span></Link>
          <button id="mobile-menu-btn" type="button" className="p-1 lg:hidden" aria-expanded={menuOpen}
            aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(open => !open)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              {menuOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>
    </div>
    {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-brand-line px-6 py-5 lg:hidden">
      {links.map(([label, href]) => <Link key={label} to={href} onClick={() => setMenuOpen(false)}
        className="block py-2 text-sm uppercase tracking-wider">{label}</Link>)}
      <Link to="/account/wishlist" onClick={() => setMenuOpen(false)} className="mt-3 block border-t border-brand-line py-4 text-sm">Saved items</Link>
    </nav>}
  </header>;
}
