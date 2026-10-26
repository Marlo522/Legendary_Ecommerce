import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../features/auth/useAuth';
import { prefetchResource } from '../services/resourceCache';
import SignOutButton from '../components/ui/SignOutButton';

const links = [
  ['/account', 'Overview'], ['/account/orders', 'Orders'],
  ['/account/wishlist', 'Saved items'], ['/account/addresses', 'Delivery addresses'],
];

export default function AccountLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = links.find(([path]) => path !== '/account' && location.pathname.startsWith(path))?.[0] || '/account';
  return <div className="mx-auto max-w-[1280px] px-6 py-10 lg:px-10 lg:py-14">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-brand-line pb-6">
      <div><p className="editorial-caption mb-2">Legendary / Member account</p><p className="text-sm">{user.name}</p></div>
      <SignOutButton />
    </div>
    <div className="grid gap-8 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12">
      <aside>
        <label className="sr-only" htmlFor="account-section">Account section</label>
        <select id="account-section" className="form-input lg:hidden" value={currentPath} onChange={event => navigate(event.target.value)}>
          {links.map(([path, label]) => <option key={path} value={path}>{label}</option>)}
        </select>
        <nav aria-label="Account navigation" className="hidden border-t border-brand-line lg:block">
          {links.map(([path, label]) => <NavLink key={path} to={path} end={path === '/account'}
            onMouseEnter={() => prefetchResource(path === '/account' ? 'account' : path.slice(1) + '?page=1&per_page=12')}
            onFocus={() => prefetchResource(path === '/account' ? 'account' : path.slice(1) + '?page=1&per_page=12')}
            className={({ isActive }) => 'block border-b border-brand-line px-3 py-4 text-sm ' + (isActive ? 'bg-brand-black text-brand-white' : 'hover:bg-brand-paper')}>{label}</NavLink>)}
        </nav>
      </aside>
      <div className="min-w-0"><Outlet /></div>
    </div>
  </div>;
}
