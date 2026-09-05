import Link from "next/link";
import { LanguageBadge } from "@/components/language-badge";
import { UpstreamLights } from "@/components/upstream-lights";
import { getPatchsets } from "@/lib/data/loader";
import { furthestConfirmedStage, type UpstreamStage } from "@/lib/data/stage";

const columns: Array<{ id: UpstreamStage; title: string; branch: string }> = [
  { id: "lore", title: "On lore", branch: "Awaiting confirmed Git evidence" },
  { id: "alex", title: "Alex", branch: "docs-next" },
  { id: "corbet", title: "Corbet", branch: "docs-mw" },
  { id: "linus", title: "Linus", branch: "master" },
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
            const items = patchsets.filter((item) => furthestConfirmedStage(item) === column.id);
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
