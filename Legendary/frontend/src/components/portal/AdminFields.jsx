export function Field({ label, error, required, hint, children }) {
  return <label className="block"><span className="mb-2 flex flex-wrap items-baseline gap-x-2">
    <span className="form-label mb-0">{label}</span>
    {required !== undefined && <span className="text-xs text-brand-gray">{required ? 'Required' : 'Optional'}</span>}
  </span>{children}
    {hint && <span className="mt-1 block text-xs text-brand-gray">{hint}</span>}
    {error && <span className="mt-1 block text-xs text-brand-danger">{error.join(' ')}</span>}
  </label>;
}

export function FieldGuide({ required, optional, children }) {
  return <div className="my-4 space-y-2 border border-brand-line bg-brand-paper p-4 text-sm text-brand-gray">
    <p><strong className="text-brand-black">Required:</strong> {required}</p>
    {optional && <p><strong className="text-brand-black">Optional:</strong> {optional}</p>}
    {children}
  </div>;
}

export function MutationFeedback({ error, success }) {
  return <>{error && <div role="alert" className="my-4 border border-brand-danger p-4 text-sm text-brand-danger">
    <p>{error.message}</p>
    {Object.entries(error.errors || {}).map(([field, messages]) => <p key={field}>{field}: {messages.join(' ')}</p>)}
  </div>}
    {success && <p role="status" className="my-4 text-sm text-brand-success">{success}</p>}
  </>;
}
