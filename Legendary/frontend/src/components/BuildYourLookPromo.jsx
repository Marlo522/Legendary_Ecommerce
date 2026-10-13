import buildYourLookImg from '../assets/build-your-look.jpg';

/**
 * BuildYourLookPromo — Promotional section for the Build Your Look feature.
 * Design.md §7 homepage order item 7: "Build Your Look promotional section."
 * Uses offset image-and-text composition per Design.md §4 signature language.
 */
export default function BuildYourLookPromo() {
  return (
    <section
      id="build-your-look-promo"
      className="border-t border-brand-line bg-brand-paper"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Image — offset composition */}
          <div className="lg:col-span-7 relative overflow-hidden">
            <img
              src={buildYourLookImg}
              alt="Flat lay of a curated outfit: t-shirt, cap, and tote bag"
              className="w-full h-full object-cover min-h-[40vh] lg:min-h-[60vh]"
              loading="lazy"
            />
            {/* Editorial detail */}
            <div className="absolute top-6 left-6 lg:top-10 lg:left-10">
              <span className="editorial-caption text-brand-black bg-brand-white/80 px-3 py-1.5 backdrop-blur-sm">
                3 pieces — 1 look
              </span>
            </div>
          </div>

          {/* Text block */}
          <div className="lg:col-span-5 px-6 lg:px-12 xl:px-16 py-16 lg:py-24">
            <span className="editorial-caption block mb-6">Build your look</span>
            <h2 className="display-heading text-brand-black text-[2.5rem] lg:text-[3.5rem] xl:text-[4rem] leading-[0.85] mb-6">
              One tee.
              <br />
              One cap.
              <br />
              One bag.
            </h2>
            <p className="text-brand-gray font-light text-base lg:text-lg max-w-md mb-10 leading-relaxed">
              Pick your favorites across all three categories, preview the full look together, and add
              everything to your cart in one click. Color-matched suggestions included.
            </p>
            <a
              href="#"
              id="build-look-cta"
              className="inline-flex items-center justify-center bg-brand-black text-brand-white
                         px-8 py-4 text-[0.75rem] font-semibold tracking-[0.15em] uppercase
                         hover:bg-brand-gray transition-colors duration-300"
            >
              Start building
              <svg className="ml-3" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
