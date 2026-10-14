import { useState, useEffect } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import CategoryCards from './components/CategoryCards';
import FeaturedProducts from './components/FeaturedProducts';
import BuildYourLookPromo from './components/BuildYourLookPromo';
import BrandStory from './components/BrandStory';
import CommunitySection from './components/CommunitySection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

/**
 * App — Landing page assembly with integrated authentication system.
 * Follows Design.md streetwear editorial guidelines.
 */
function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(null);

  // Check URL hash for direct access (e.g. #login, #register)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#login') {
        setAuthMode('login');
        setIsAuthOpen(true);
      } else if (hash === '#register' || hash === '#signup') {
        setAuthMode('register');
        setIsAuthOpen(true);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
    // Clear hash if it was used
    if (window.location.hash === '#login' || window.location.hash === '#register') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div id="app" className="min-h-screen flex flex-col w-full relative">
      <AnnouncementBar />
      <Header
        onOpenAuth={handleOpenAuth}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main id="main-content" className="flex-1 w-full">
        <HeroSection />
        <CategoryCards />
        <FeaturedProducts />
        <BuildYourLookPromo />
        <BrandStory />
        <CommunitySection />
      </main>
      <Footer />

      {/* Split-screen Auth Modal with Smooth Transitions */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={handleCloseAuth}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Floating Quick-Access Switcher for Demonstration */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center bg-brand-black text-brand-white shadow-2xl border border-white/20 p-1.5 transition-transform hover:scale-105">
        <span className="text-[0.625rem] font-medium tracking-[0.15em] uppercase px-2.5 text-white/70 hidden sm:inline">
          AUTH DEMO:
        </span>
        <button
          onClick={() => handleOpenAuth('login')}
          className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase bg-white/10 hover:bg-white hover:text-brand-black transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={() => handleOpenAuth('register')}
          className="ml-1 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase bg-white/10 hover:bg-white hover:text-brand-black transition-colors"
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default App;
