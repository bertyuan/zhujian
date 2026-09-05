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
          </div>
        </div>
      </section>
      <section className="shell content-section">
        <PatchsetTable patchsets={patchsets} />
      </section>
    </>
  );
}
