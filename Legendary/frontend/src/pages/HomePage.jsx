import HeroSection from '../components/HeroSection';
import CategoryCards from '../components/CategoryCards';
import FeaturedProducts from '../components/FeaturedProducts';
import BuildYourLookPromo from '../components/BuildYourLookPromo';
import BrandStory from '../components/BrandStory';
import CommunitySection from '../components/CommunitySection';

export default function HomePage() {
  return <>
    <HeroSection /><CategoryCards /><FeaturedProducts /><BuildYourLookPromo /><BrandStory /><CommunitySection />
  </>;
}
