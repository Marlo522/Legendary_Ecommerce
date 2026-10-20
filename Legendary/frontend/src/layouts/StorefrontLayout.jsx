import { Outlet } from 'react-router';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { StorefrontProvider } from '../components/StorefrontProvider';
import { useAuth } from '../features/auth/useAuth';

export default function StorefrontLayout() {
  const { user } = useAuth();
  return <StorefrontProvider key={user?.id || 'guest'}>
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <AnnouncementBar /><Header />
      <main id="main-content" className="flex-1"><Outlet /></main><Footer />
    </div>
  </StorefrontProvider>;
}
