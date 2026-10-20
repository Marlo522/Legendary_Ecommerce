export default function PageHeading({ eyebrow, title, children }) {
  return <div className="mb-8 border-b border-brand-line pb-7">
    {eyebrow && <p className="editorial-caption mb-3">{eyebrow}</p>}
    <h1 className="font-display text-4xl tracking-wide sm:text-5xl">{title}</h1>
    {children && <p className="mt-3 max-w-2xl text-sm text-brand-gray">{children}</p>}
  </div>;
}
