import { Link } from 'react-router';
import heroImg from '../assets/hero-lifestyle.jpg';

/**
 * HeroSection — Full-width editorial hero.
 * Design.md §7: "A split-screen or off-center hero is preferred over a generic centered banner."
 * One strong image, one short statement, one clear CTA.
 */
export default function HeroSection() {
  return (
    <section id="hero" className="relative bg-brand-paper">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[75vh] lg:min-h-[85vh]">
          {/* Left: Editorial text — off-center, oversized */}
          <div className="lg:col-span-5 flex flex-col justify-center px-6 lg:px-10 py-16 lg:py-24 order-2 lg:order-1">
            <span className="editorial-caption mb-6">Drop 01 — Everyday Uniform</span>

            <h1 className="display-heading text-brand-black text-[3.5rem] sm:text-[4.5rem] lg:text-[6rem] xl:text-[7rem] leading-[0.85] mb-8">
              Wear
              <br />
              Your
              <br />
              <span className="text-brand-gray">Legend</span>
            </h1>

            <p className="text-brand-gray font-light text-base lg:text-lg max-w-sm mb-10 leading-relaxed">
              T-shirts, caps, and tote bags built for the ones who show up daily and make it count.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                id="hero-cta-primary"
                className="inline-flex items-center justify-center bg-brand-black text-brand-white
                           px-8 py-4 text-[0.75rem] font-semibold tracking-[0.15em] uppercase
                           hover:bg-brand-gray transition-colors duration-300"
              >
                Shop the collection
              </Link>
              <a
                href="#"
                id="hero-cta-secondary"
                className="inline-flex items-center justify-center border border-brand-black text-brand-black
                           px-8 py-4 text-[0.75rem] font-semibold tracking-[0.15em] uppercase
                           hover:bg-brand-black hover:text-brand-white transition-colors duration-300"
              >
                Build your look
              </a>
            </div>
          </div>

          {/* Right: Hero image — editorial crop, off-center */}
          <div className="lg:col-span-7 relative overflow-hidden order-1 lg:order-2">
            <img
              src={heroImg}
              alt="Person wearing Legendary Lifestyle black t-shirt, cap, and tote bag"
              className="w-full h-full object-cover object-top min-h-[50vh] lg:min-h-full"
              loading="eager"
              fetchPriority="high"
            />
            {/* Editorial overlay detail */}
            <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10">
              <span className="editorial-caption text-brand-white bg-brand-black/60 px-3 py-1.5 backdrop-blur-sm">
                Field notes — Vol. I
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
