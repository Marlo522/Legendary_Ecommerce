import { useState } from 'react';

/**
 * Header — Main site navigation.
 * Design.md §6: Logo, main nav (Home, Shop, T-shirts, Caps, Tote Bags, Build Your Look, About),
 * utility actions (Search, Wishlist, Account, Cart).
 * Mobile: logo + cart + hamburger, drawer for nav.
 */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Shop', href: '#' },
    { label: 'T-shirts', href: '#' },
    { label: 'Caps', href: '#' },
    { label: 'Tote Bags', href: '#' },
    { label: 'Build Your Look', href: '#' },
    { label: 'About', href: '#' },
  ];

  return (
    <header
      id="site-header"
      className="sticky top-0 z-50 bg-brand-white border-b border-brand-line"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo / Wordmark */}
          <a
            href="/"
            id="site-logo"
            className="font-display text-2xl lg:text-3xl tracking-[0.04em] uppercase text-brand-black"
          >
            Legendary
          </a>

          {/* Desktop Navigation */}
          <nav
            id="desktop-nav"
            aria-label="Main navigation"
            className="hidden lg:flex items-center gap-8"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[0.75rem] font-medium tracking-[0.12em] uppercase text-brand-black
                           hover:text-brand-gray transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Utility Actions */}
          <div className="flex items-center gap-4 lg:gap-5">
            {/* Search */}
            <button
              id="search-btn"
              aria-label="Search products"
              className="text-brand-black hover:text-brand-gray transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Wishlist — hidden on mobile */}
            <button
              id="wishlist-btn"
              aria-label="Wishlist"
              className="hidden lg:block text-brand-black hover:text-brand-gray transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Account — hidden on mobile */}
            <button
              id="account-btn"
              aria-label="Account"
              className="hidden lg:block text-brand-black hover:text-brand-gray transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {/* Cart */}
            <button
              id="cart-btn"
              aria-label="Shopping cart, 0 items"
              className="relative text-brand-black hover:text-brand-gray transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-black text-brand-white text-[0.5625rem] font-semibold flex items-center justify-center">
                0
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-btn"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-brand-black hover:text-brand-gray transition-colors"
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-nav-drawer"
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-brand-line
          ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-t-0'}`}
      >
        <nav aria-label="Mobile navigation" className="px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium tracking-[0.1em] uppercase text-brand-black
                         hover:text-brand-gray transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-6 pt-4 border-t border-brand-line">
            <a href="#" className="text-sm font-medium tracking-[0.1em] uppercase text-brand-black hover:text-brand-gray transition-colors">
              Account
            </a>
            <a href="#" className="text-sm font-medium tracking-[0.1em] uppercase text-brand-black hover:text-brand-gray transition-colors">
              Wishlist
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
