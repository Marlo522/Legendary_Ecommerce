/**
 * BrandStory — Short brand narrative section.
 * Design.md §7 homepage order item 8: "Short brand story."
 * Requirements.md §4.1: "Include a short brand story and links to social media."
 */
export default function BrandStory() {
  return (
    <section
      id="brand-story"
      className="border-t border-brand-line"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left: Oversized heading */}
          <div className="lg:col-span-5">
            <span className="editorial-caption block mb-6">About</span>
            <h2 className="display-heading text-brand-black text-[2.5rem] lg:text-[4rem] xl:text-[5rem] leading-[0.85]">
              Made for
              <br />
              the daily
              <br />
              grind
            </h2>
          </div>

          {/* Right: Story text */}
          <div className="lg:col-span-6 lg:col-start-7 flex flex-col justify-center">
            <p className="text-brand-gray text-base lg:text-lg leading-relaxed mb-6">
              Legendary Lifestyle started with a simple belief: what you wear every day should feel as
              intentional as the work you put in. We design T-shirts, caps, and tote bags that fit into
              your routine without asking for attention — but earn it anyway.
            </p>
            <p className="text-brand-gray text-base lg:text-lg leading-relaxed mb-10">
              Every piece is made with premium materials, minimal design, and a commitment to quality that
              lasts. No trends. No noise. Just the uniform for people who show up.
            </p>
            <a
              href="#"
              id="brand-story-link"
              className="inline-flex items-center gap-2 text-[0.75rem] font-medium tracking-[0.12em] uppercase
                         text-brand-black hover:text-brand-gray transition-colors duration-200 self-start"
            >
              Read our story
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
