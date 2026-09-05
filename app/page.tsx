import { PatchsetTable } from "@/components/patchset-table";
import { getMetadata, getPatchsets } from "@/lib/data/loader";

export default function HomePage() {
  const patchsets = getPatchsets();
  const metadata = getMetadata();
  const generatedAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(new Date(metadata.generatedAt));
  const sources = [
    { id: "alex", label: "Alex", branch: "docs-next" },
    { id: "corbet", label: "Corbet", branch: "docs-mw" },
    { id: "linus", label: "Linus", branch: "master" },
  ];

  return (
    <>
      <section className="shell content-section">
        <div className="page-heading">
          <div>
            <h1>Patchsets</h1>
            <p>Tracking Linux Chinese documentation patches from lore to mainline.</p>
          </div>
          <div className="sync-summary">
            <span>Last sync</span>
            <time dateTime={metadata.generatedAt}>{generatedAt} CST</time>
            <strong>{metadata.mode === "live" ? "live" : "fixture"}</strong>
          </div>
        </div>
        <div className="source-revisions" aria-label="Tracked Git source revisions">
          {sources.map((source) => (
            <span key={source.id}>
              {source.label}/{source.branch} <code>{metadata.sources[source.id]?.head?.slice(0, 8) ?? "fixture"}</code>
            </span>
          ))}
        </div>
        <div className="status-guide" aria-label="Upstream status legend">
          <span className="guide-label">Evidence:</span>
          <span className="guide-item"><span className="light-dot light-confirmed" aria-hidden="true" />exact Git match</span>
          <span className="guide-item"><span className="light-dot light-candidate" aria-hidden="true" />candidate / partial / previous</span>
          <span className="guide-item"><span className="light-dot light-missing" aria-hidden="true" />not found</span>
        </div>
        <PatchsetTable patchsets={patchsets} />
      </section>
    </>
  );
}
