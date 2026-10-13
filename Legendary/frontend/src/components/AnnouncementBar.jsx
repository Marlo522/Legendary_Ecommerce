/**
 * AnnouncementBar — Thin black strip at the top of every page.
 * Design.md §4 & §7: "A thin black announcement strip with compact uppercase text."
 */
export default function AnnouncementBar() {
  return (
    <div
      id="announcement-bar"
      className="bg-brand-black text-brand-white py-2.5 px-4 text-center"
    >
      <p className="text-[0.6875rem] font-medium tracking-[0.15em] uppercase font-body">
        Free shipping on orders over ₱2,500 &mdash; New drop available now
      </p>
    </div>
  );
}
