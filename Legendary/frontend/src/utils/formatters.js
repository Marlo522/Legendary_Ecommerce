const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const date = new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

export function money(value) {
  return value === null || value === undefined || !Number.isFinite(Number(value)) ? '—' : peso.format(Number(value));
}

export function formatDate(value) {
  const parsed = new Date(value);
  return value && !Number.isNaN(parsed.getTime()) ? date.format(parsed) : '—';
}
