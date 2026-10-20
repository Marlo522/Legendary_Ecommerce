export default function StatGrid({ items }) {
  return <dl className="mb-9 grid grid-cols-2 border-l border-t border-brand-line lg:grid-cols-4">
    {items.map(item => <div key={item.label} className="border-b border-r border-brand-line p-5 sm:p-6">
      <dt className="text-xs font-medium uppercase tracking-wider text-brand-gray">{item.label}</dt>
      <dd className="mt-4 font-display text-4xl">{item.value}</dd>
    </div>)}
  </dl>;
}
