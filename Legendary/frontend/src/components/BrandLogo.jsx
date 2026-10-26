import logoImg from '../assets/logo/legendary-logo.jpg';

export default function BrandLogo({ className = '', inverted = false }) {
  return <span className={'relative block aspect-[9/5] shrink-0 overflow-hidden ' + (inverted ? 'bg-white ' : 'bg-black ') + className}>
    <img src={logoImg} alt="Legendary Lifestyle" width="960" height="960" decoding="async"
      className={'absolute inset-0 h-full w-full object-cover ' + (inverted ? 'invert' : '')} />
  </span>;
}
