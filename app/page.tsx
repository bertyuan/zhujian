import { PatchsetTable } from "@/components/patchset-table";
import { SyncHealth } from "@/components/sync-health";
import { getMetadata, getPatchsets, getSyncRunState } from "@/lib/data/loader";

export default function HomePage() {
  const patchsets = getPatchsets();
  const metadata = getMetadata();
  const syncRunState = getSyncRunState();

  return (
    <>
      <section className="shell content-section">
        <div className="page-heading">
          <div>
            <h1>Patchsets</h1>
            <p>Tracking Linux Chinese documentation patches from lore to mainline.</p>
          </div>
          <span className="heading-count">{metadata.mode === "live" ? "live data" : "fixture data"}</span>
        </div>
        <SyncHealth metadata={metadata} runState={syncRunState} />
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
