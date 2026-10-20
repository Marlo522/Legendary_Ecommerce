const tones = {
  completed: 'border-brand-success text-brand-success',
  shipped: 'border-brand-success text-brand-success',
  paid: 'border-brand-success text-brand-success',
  active: 'border-brand-success text-brand-success',
  cancelled: 'border-brand-danger text-brand-danger',
  failed: 'border-brand-danger text-brand-danger',
  archived: 'border-brand-gray text-brand-gray',
};

export default function StatusBadge({ status }) {
  const label = String(status || 'Unknown').replaceAll('_', ' ');
  return <span className={'inline-flex border px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ' + (tones[status] || 'border-brand-line text-brand-black')}>
    {label}
  </span>;
}
