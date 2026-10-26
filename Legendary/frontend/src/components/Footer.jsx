/**
 * Footer — Site footer with links and social media.
 * Design.md §7 homepage order item 10: "Footer with links and social media."
 */
import { Link } from 'react-router';
import BrandLogo from './BrandLogo';
import { useStorefront } from '../hooks/useStorefront';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const currentYear = CURRENT_YEAR;
  const { metadata } = useStorefront();

  const footerColumns = [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', href: '/shop' },
        ...(metadata.data?.data.categories || []).map(category => ({ label: category.name, href: '/shop?category=' + encodeURIComponent(category.slug) })),
        { label: 'New Arrivals', href: '/shop?collection=new-arrivals' },
      ],
    },
    {
      title: 'Info',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Size Guide', href: '#' },
        { label: 'Shipping & Returns', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'FAQ', href: '#' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Sign In', href: '/login' },
        { label: 'Register', href: '#' },
        { label: 'Order Tracking', href: '#' },
        { label: 'Wishlist', href: '/account/wishlist' },
      ],
    },
  ];

  return (
    <footer
      id="site-footer"
      className="bg-brand-black text-brand-white"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16 pt-16 lg:pt-20 pb-14 lg:pb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" aria-label="Legendary Lifestyle home" className="mb-5 inline-block"><BrandLogo className="w-40" /></Link>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-xs">
              T-shirts, caps, and tote bags for the ones who show up every day.
            </p>
            {/* Newsletter mini form */}
            <div className="flex">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input
                id="footer-email"
                type="email"
                placeholder="Your email"
                className="flex-1 bg-transparent border border-white/20 px-4 py-3 text-sm text-brand-white
                           placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors"
              />
              <button
                type="button"
                id="footer-subscribe-btn"
                className="bg-brand-white text-brand-black px-5 py-3 text-[0.6875rem] font-semibold
                           tracking-[0.12em] uppercase hover:bg-brand-paper transition-colors duration-200"
              >
                Join
              </button>
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[0.6875rem] font-semibold tracking-[0.15em] uppercase mb-5 text-white/40">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/60 hover:text-brand-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[0.6875rem] text-white/30 tracking-[0.05em]">
            &copy; {currentYear} Legendary Lifestyle. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[0.6875rem] text-white/30 hover:text-white/60 transition-colors tracking-[0.05em]">
              Privacy
            </a>
            <a href="#" className="text-[0.6875rem] text-white/30 hover:text-white/60 transition-colors tracking-[0.05em]">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
