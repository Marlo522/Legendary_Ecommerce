import { Link } from 'react-router';
import buildYourLookImg from '../assets/pictures/622389338_17879499951461814_8096118269373520596_n.jpeg';

export default function BuildYourLookPromo() {
  return (
    <section id="build-your-look-promo" aria-labelledby="build-look-heading" className="border-t border-brand-line bg-brand-paper">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center lg:grid-cols-12">
        <figure className="relative lg:col-span-7">
          <img src={buildYourLookImg} alt="Black Legendary Lifestyle embroidered cap resting on branded tees beside a pool" width="1440" height="1919" className="aspect-[4/5] w-full object-cover object-center lg:aspect-[1/1]" loading="lazy" decoding="async" />
          <figcaption className="absolute left-6 top-6 bg-brand-white/95 px-3 py-2 text-[0.65rem] uppercase tracking-[0.15em] lg:left-10 lg:top-10">Off duty / On your terms</figcaption>
        </figure>
        <div className="px-6 py-14 lg:col-span-5 lg:px-12 lg:py-20 xl:px-16">
          <p className="editorial-caption mb-6">Build your look</p>
          <h2 id="build-look-heading" className="display-heading mb-6 text-[2.75rem] leading-[0.9] lg:text-[3.5rem] xl:text-[4rem]">Your tee.<br />Your cap.<br />Your everyday.</h2>
          <p className="mb-9 max-w-md text-base leading-relaxed text-[#625e58] lg:text-lg">Start with a graphic tee. Top it off with our signature cap. Grab a tote and take the Legendary lifestyle wherever the day leads.</p>
          <Link to="/shop" id="build-look-cta" className="inline-flex min-h-12 items-center justify-center gap-4 bg-brand-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-[#766658]">Find your essentials <span aria-hidden="true">&#8594;</span></Link>
        </div>
      </div>
    </section>
  );
}
