import { useSearchParams } from 'react-router';
import { Field } from './AdminFields';

export default function AdminFilters({ statuses, searchLabel }) {
  const [params, setParams] = useSearchParams();
  return <form className="mb-6 grid items-end gap-3 sm:grid-cols-[1fr_200px_auto_auto]" onSubmit={event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    if (data.get('search').trim()) next.set('search', data.get('search').trim());
    if (data.get('status')) next.set('status', data.get('status'));
    setParams(next);
  }}>
    <Field label={searchLabel}><input key={params.get('search') || ''} className="form-input" name="search" maxLength={80} defaultValue={params.get('search') || ''} /></Field>
    <Field label="Status"><select key={params.get('status') || ''} className="form-input" name="status" defaultValue={params.get('status') || ''}>
      <option value="">All statuses</option>{statuses.map(status => <option key={status}>{status}</option>)}
    </select></Field>
    <button className="button-secondary">Apply filters</button>
    <button type="button" className="button-secondary" onClick={() => setParams({})}>Clear</button>
  </form>;
}
