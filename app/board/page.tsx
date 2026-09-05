import Link from "next/link";
import { LanguageBadge } from "@/components/language-badge";
import { UpstreamLights } from "@/components/upstream-lights";
import { getPatchsets } from "@/lib/data/loader";
import type { PatchsetSummary } from "@/lib/data/schema";

const columns: Array<{ title: string; branch: string; statuses: PatchsetSummary["status"][] }> = [
  { title: "On lore", branch: "Awaiting Git evidence", statuses: ["on-lore", "superseded", "previously-queued"] },
  { title: "Alex", branch: "docs-next", statuses: ["queued-alex"] },
  { title: "Corbet", branch: "docs-mw", statuses: ["in-docs-mw", "partially-applied"] },
  { title: "Linus", branch: "master", statuses: ["mainline"] },
];

export default function BoardPage() {
  const patchsets = getPatchsets().filter((item) => item.latestRevision);
  return (
    <>
      <section className="page-intro">
        <div className="shell">
          <p className="eyebrow">Upstream path</p>
          <h1 className="page-title">Board</h1>
          <p className="page-description">An evidence-based view of each series’ furthest confirmed stage. Cards move only when the Git data changes.</p>
        </div>
      </section>
      <section className="shell content-section">
        <div className="board-grid">
          {columns.map((column) => {
            const items = patchsets.filter((item) => column.statuses.includes(item.status));
            return (
              <section className="board-column" key={column.title}>
                <header className="board-head">
                  <span className="board-count">{items.length}</span>
                  <h2>{column.title}</h2>
                  <span>{column.branch}</span>
                </header>
                <div className="board-cards">
                  {items.map((item) => (
                    <Link className="board-card" href={`/patchsets/${item.id}`} key={item.id}>
                      <h3 className="board-card-title">{item.subject}</h3>
                      <div className="board-card-meta">
                        <LanguageBadge language={item.language} />
                        <UpstreamLights trees={item.trees} compact />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}
