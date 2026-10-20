export default function AddressCard({ address }) {
  return <article className="border border-brand-line bg-brand-white p-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-semibold">{address.label || 'Delivery address'}</h3>
      {address.is_default && <span className="border border-brand-line px-2 py-1 text-[0.65rem] uppercase tracking-wider">Default</span>}
    </div>
    <address className="text-sm not-italic leading-7">
      <p className="font-medium">{address.recipient_name}</p>
      <p>{address.address_line_1}</p>{address.address_line_2 && <p>{address.address_line_2}</p>}
      <p>{address.city}, {address.province} {address.postal_code}</p><p>{address.country}</p>
      <p className="mt-3 text-brand-gray">{address.phone}</p>
    </address>
  </article>;
}
