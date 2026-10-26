import { Link } from 'react-router';
import brandArtwork from '../assets/pictures/605638925_1223317576529266_7128786950524241560_n.jpg';

export default function BrandStory() {
  return (
    <section id="brand-story" aria-labelledby="brand-story-heading" className="scroll-mt-24 border-t border-brand-line">
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <img src={brandArtwork} alt="We Living Legendary. Have a Goodlife. A Legendary One." width="1800" height="1200" className="aspect-[3/2] w-full bg-brand-black object-contain" loading="lazy" decoding="async" />
          <div>
            <p className="editorial-caption mb-6">The Legendary lifestyle</p>
            <h2 id="brand-story-heading" className="display-heading mb-6 text-[2.75rem] leading-[0.9] lg:text-[3.5rem]">More than a name.<br />A way to show up.</h2>
            <p className="mb-6 text-base leading-relaxed text-[#625e58] lg:text-lg">Legend is rare. From expressive graphic tees to our signature script logo, Legendary Lifestyle brings a little of that energy to your everyday rotation.</p>
            <p className="mb-8 text-base leading-relaxed text-[#625e58] lg:text-lg">Wear what speaks to you. Put your own look together. Live your own version of legendary.</p>
            <Link to="/shop" id="brand-story-link" className="inline-flex min-h-11 items-center gap-3 text-xs font-medium uppercase tracking-[0.12em] underline underline-offset-4">Find your next piece <span aria-hidden="true">&#8599;</span></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
