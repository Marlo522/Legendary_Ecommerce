import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import CategoryCards from './components/CategoryCards';
import FeaturedProducts from './components/FeaturedProducts';
import BuildYourLookPromo from './components/BuildYourLookPromo';
import BrandStory from './components/BrandStory';
import CommunitySection from './components/CommunitySection';
import Footer from './components/Footer';

/**
 * App — Landing page assembly.
 * Follows the homepage section order from Design.md §7:
 *  1. Announcement bar
 *  2. Header and navigation
 *  3. Hero section
 *  4. Main CTA (inside hero)
 *  5. Category cards
 *  6. Featured products / new arrivals
 *  7. Build Your Look promo
 *  8. Brand story
 *  9. Community section
 * 10. Footer
 */
function App() {
  return (
    <div id="app" className="min-h-screen flex flex-col w-full">
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="flex-1 w-full">
        <HeroSection />
        <CategoryCards />
        <FeaturedProducts />
        <BuildYourLookPromo />
        <BrandStory />
        <CommunitySection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
