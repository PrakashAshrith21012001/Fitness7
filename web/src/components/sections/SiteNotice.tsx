import type { AnnouncementRow } from "@f7/content";

/** One-line notice bar under the nav — only when the owner has posted one for the site. */
export function SiteNotice({ notices }: { notices: AnnouncementRow[] }) {
  const n = notices[0];
  if (!n) return null;
  const inner = (
    <>
      <span className="font-bold text-lime">{n.title}</span>
      {n.body ? <span className="text-white/80"> — {n.body}</span> : null}
    </>
  );
  return (
    <div className="border-b border-line bg-surface px-4 py-2.5 text-center text-sm" role="status">
      {n.link_url ? (
        <a href={n.link_url} className="hover:underline" target="_blank" rel="noreferrer">{inner}</a>
      ) : (
        inner
      )}
    </div>
  );
}
