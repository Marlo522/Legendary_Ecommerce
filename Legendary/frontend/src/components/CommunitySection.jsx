import embroideryImg from '../assets/pictures/480742823_988279943366365_5313703834636959938_n.jpg';

export default function CommunitySection() {
  return (
    <section id="community" aria-labelledby="community-heading" className="border-t border-brand-line bg-brand-paper">
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="editorial-caption mb-4">Wear it your way</p>
            <h2 id="community-heading" className="display-heading mb-5 text-4xl lg:text-5xl">The people make it legendary</h2>
            <p className="max-w-md text-base leading-relaxed text-[#625e58]">Your style. Your everyday. Share how you wear Legendary and make the look your own.</p>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.15em]">#WearYourLegend</p>
        </div>
        <img src={embroideryImg} alt="Close-up of white Legendary Lifestyle script embroidery on black fabric" width="1536" height="603" className="aspect-[1536/603] w-full bg-brand-black object-contain" loading="lazy" decoding="async" />
        <p className="mt-4 text-[0.65rem] uppercase tracking-[0.15em] text-[#625e58]">The signature / Legendary Lifestyle</p>
      </div>
    </section>
  );
}
