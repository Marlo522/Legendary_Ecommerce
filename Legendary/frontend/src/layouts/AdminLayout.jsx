import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../features/auth/useAuth';
import SignOutButton from '../components/ui/SignOutButton';

const links = [
  ['/admin', 'Overview'], ['/admin/orders', 'Orders'],
  ['/admin/products', 'Products & inventory'], ['/admin/customers', 'Customers'],
];

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = links.find(([path]) => path !== '/admin' && location.pathname.startsWith(path))?.[0] || '/admin';
  return <div className="min-h-screen bg-brand-paper lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
    <a href="#admin-main" className="skip-link">Skip to content</a>
    <aside className="border-b border-brand-line bg-brand-black text-brand-white lg:min-h-screen">
      <div className="flex items-center justify-between px-6 py-6 lg:block">
        <Link to="/admin" className="font-display text-3xl tracking-wider">Legendary</Link>
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/60 lg:mt-2">Administration</p>
      </div>
      <nav aria-label="Administration navigation" className="hidden px-3 lg:block">
        {links.map(([path, label]) => <NavLink key={path} to={path} end={path === '/admin'}
          className={({ isActive }) => 'mb-1 block border-l-2 px-4 py-4 text-sm ' + (isActive ? 'border-white bg-white/10' : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white')}>{label}</NavLink>)}
      </nav>
      <div className="px-6 pb-6 lg:mt-10"><Link to="/" className="text-xs text-white/70 underline underline-offset-4 hover:text-white">Visit storefront</Link></div>
    </aside>
    <div className="min-w-0">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-line bg-brand-white px-6 py-5 lg:px-10">
        <div><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-brand-gray">Administrator</p></div>
        <SignOutButton />
      </header>
      <div className="px-6 pt-6 lg:hidden">
        <label className="sr-only" htmlFor="admin-section">Administration section</label>
        <select id="admin-section" className="form-input" value={currentPath} onChange={event => navigate(event.target.value)}>
          {links.map(([path, label]) => <option key={path} value={path}>{label}</option>)}
        </select>
      </div>
      <main id="admin-main" className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10"><Outlet /></main>
    </div>
  </div>;
}
