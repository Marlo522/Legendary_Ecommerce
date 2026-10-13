/**
 * CommunitySection — Customer / community social proof.
 * Design.md §7 homepage order item 9: "Customer or community section."
 */
export default function CommunitySection() {
  return (
    <section
      id="community"
      className="border-t border-brand-line bg-brand-paper"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <span className="editorial-caption block mb-6">Community</span>
          <h2 className="display-heading text-brand-black text-[2rem] lg:text-[3rem] mb-6">
            The people make it legendary
          </h2>
          <p className="text-brand-gray text-base lg:text-lg leading-relaxed mb-12">
            Join the community of everyday legends who rep the uniform.
            Share your look and tag us to get featured.
          </p>

          {/* Social links */}
          <div className="flex items-center justify-center gap-6">
            {/* Instagram */}
            <a
              href="#"
              id="social-instagram"
              aria-label="Follow us on Instagram"
              className="w-12 h-12 flex items-center justify-center border border-brand-line
                         text-brand-black hover:bg-brand-black hover:text-brand-white
                         transition-all duration-300"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="#"
              id="social-tiktok"
              aria-label="Follow us on TikTok"
              className="w-12 h-12 flex items-center justify-center border border-brand-line
                         text-brand-black hover:bg-brand-black hover:text-brand-white
                         transition-all duration-300"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.01a6.32 6.32 0 0 0-.88-.07 6.34 6.34 0 0 0 0 12.68 6.34 6.34 0 0 0 6.34-6.34V9.06a8.16 8.16 0 0 0 3.76.92V6.69z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="#"
              id="social-facebook"
              aria-label="Follow us on Facebook"
              className="w-12 h-12 flex items-center justify-center border border-brand-line
                         text-brand-black hover:bg-brand-black hover:text-brand-white
                         transition-all duration-300"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="#"
              id="social-twitter"
              aria-label="Follow us on X"
              className="w-12 h-12 flex items-center justify-center border border-brand-line
                         text-brand-black hover:bg-brand-black hover:text-brand-white
                         transition-all duration-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>

          {/* Hashtag CTA */}
          <p className="mt-10 text-[0.75rem] font-medium tracking-[0.12em] uppercase text-brand-gray">
            Tag us @legendarylifestyle &mdash; #WearYourLegend
          </p>
        </div>
      </div>
    </section>
  );
}
