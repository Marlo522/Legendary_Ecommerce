import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import StorefrontLayout from '../layouts/StorefrontLayout';
import AccountLayout from '../layouts/AccountLayout';
import AdminLayout from '../layouts/AdminLayout';
import RequireAuth from '../features/auth/RequireAuth';
import LoginPage from '../features/auth/LoginPage';
import HomePage from '../pages/HomePage';
import AccountOverviewPage from '../pages/account/AccountOverviewPage';
import AddressesPage from '../pages/account/AddressesPage';
import WishlistPage from '../pages/account/WishlistPage';
import AdminOverviewPage from '../pages/admin/AdminOverviewPage';
import ProductsPage from '../pages/admin/ProductsPage';
import ProductEditorPage from '../pages/admin/ProductEditorPage';
import OrderEditorPage from '../pages/admin/OrderEditorPage';
import CustomersPage from '../pages/admin/CustomersPage';
import OrdersPage from '../pages/OrdersPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import { NotFoundPage } from '../pages/StatusPages';

const CatalogPage = lazy(() => import('../pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/CartPage'));

function PublicPage({ children }) {
  return <Suspense fallback={<p className="px-6 py-16 text-center text-sm" role="status">Loading…</p>}>{children}</Suspense>;
}

export default function AppRoutes() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
    document.title = pathname.startsWith('/admin') ? 'Administration · Legendary' : pathname.startsWith('/account') ? 'My account · Legendary' : 'Legendary Lifestyle';
  }, [pathname, hash]);

  return <Routes>
    <Route element={<StorefrontLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/shop" element={<PublicPage><CatalogPage /></PublicPage>} />
      <Route path="/products/:slug" element={<PublicPage><ProductDetailPage /></PublicPage>} />
      <Route path="/cart" element={<PublicPage><CartPage /></PublicPage>} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<AccountOverviewPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="addresses" element={<AddressesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
    <Route element={<RequireAuth role="admin" />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="orders" element={<OrdersPage admin />} />
        <Route path="orders/:orderId" element={<OrderDetailPage admin />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductEditorPage />} />
        <Route path="products/:productId" element={<ProductEditorPage />} />
        <Route path="orders/new" element={<OrderEditorPage />} />
        <Route path="orders/:orderId/edit" element={<OrderEditorPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Route>
  </Routes>;
}
