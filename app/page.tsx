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
      <section className="hero">
        <div className="shell hero-row">
          <div>
            <p className="eyebrow">Linux Chinese documentation patch tracker</p>
            <h1>Where is my patch now?</h1>
            <p className="hero-copy">
              Follow zh_CN and zh_TW documentation patches from linux-doc lore through Alex’s docs-next,
              Corbet’s docs-mw, and into Linus’s mainline tree.
            </p>
          </div>
          <div className="sync-card">
            <span className="sync-label">Last synchronized</span>
            <time className="sync-time" dateTime={metadata.generatedAt}>{generatedAt} CST</time>
            <span className="sync-note">
              {metadata.mode === "live" ? "Live data from linux-doc lore" : "Fixture preview"}
            </span>
            <div className="sync-sources" aria-label="Tracked Git source revisions">
              {sources.map((source) => (
                <span className="sync-source" key={source.id}>
                  <span>{source.label} / {source.branch}</span>
                  <code>{metadata.sources[source.id]?.head?.slice(0, 8) ?? "fixture"}</code>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="shell content-section">
        <div className="status-guide" aria-label="Upstream status legend">
          <span className="guide-item"><span className="light-dot light-confirmed" aria-hidden="true" />Confirmed by exact Git evidence</span>
          <span className="guide-item"><span className="light-dot light-candidate" aria-hidden="true" />Candidate, partial, or previously present</span>
          <span className="guide-item"><span className="light-dot light-missing" aria-hidden="true" />Not found in this tree</span>
        </div>
        <PatchsetTable patchsets={patchsets} />
      </section>
    </>
  );
}
