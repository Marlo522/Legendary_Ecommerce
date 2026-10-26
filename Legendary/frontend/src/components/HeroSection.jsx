import { Link } from 'react-router';
import heroImg from '../assets/pictures/481088805_994430486084644_4070894412361349226_n.jpg';

export default function HeroSection() {
  return (
    <section id="hero" aria-labelledby="hero-heading" className="bg-brand-paper">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 lg:grid-cols-12">
        <div className="order-2 flex flex-col justify-center px-6 py-12 lg:order-1 lg:col-span-5 lg:px-10 lg:py-20">
          <p className="editorial-caption mb-6 text-[#655c55]">Legendary Lifestyle / Everyday essentials</p>
          <h1 id="hero-heading" className="display-heading mb-7 text-[3.75rem] leading-[0.85] text-brand-black sm:text-[5rem] lg:text-[6rem] xl:text-[7rem]">
            Wear<br />Your<br /><span className="text-[#766658]">Legend</span>
          </h1>
          <p className="mb-8 max-w-sm text-base leading-relaxed text-[#625e58] lg:text-lg">
            Graphic tees, signature caps, and carry-everywhere totes. Make the everyday your own.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/shop" id="hero-cta-primary" className="inline-flex min-h-12 items-center justify-center bg-brand-black px-7 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-[#766658]">
              Shop the collection
            </Link>
            <a href="#brand-story" id="hero-cta-secondary" className="inline-flex min-h-12 items-center gap-3 px-1 py-4 text-xs font-medium uppercase tracking-[0.12em] underline underline-offset-4">
              The Legendary lifestyle <span aria-hidden="true">&#8599;</span>
            </a>
          </div>
          <p className="mt-10 border-t border-brand-line pt-5 text-[0.65rem] uppercase tracking-[0.18em] text-[#655c55]">Be legend. Be rare.</p>
        </div>
        <figure className="order-1 flex min-w-0 flex-col bg-[#9e8b80] lg:order-2 lg:col-span-7">
          <div className="relative aspect-[3/2] overflow-hidden sm:aspect-[4/3] lg:aspect-auto lg:min-h-[640px] lg:flex-1">
            <img src={heroImg} alt="Legend Is Rare print on a dark brown Legendary T-shirt, with branded neck and sleeve labels" width="1776" height="1184" className="absolute inset-0 h-full w-full object-cover object-[42%_center]" loading="eager" fetchPriority="high" />
          </div>
          <figcaption className="flex items-center justify-between gap-4 bg-[#e8e0d8] px-6 py-4 text-[0.65rem] uppercase tracking-[0.15em] text-[#554a40]">
            <span>In focus / Legend is rare</span><span>Legendary Lifestyle</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
