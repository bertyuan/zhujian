import type { TreeId, TreeSummary } from "@/lib/data/schema";

const treeLabels: Record<TreeId, { short: string; full: string }> = {
  alex: { short: "Alex", full: "Alex docs-next" },
  corbet: { short: "Corbet", full: "Corbet docs-mw" },
  linus: { short: "Linus", full: "Linus master" },
};

const stateLabels: Record<TreeSummary["state"], string> = {
  confirmed: "confirmed",
  partial: "partially confirmed",
  candidate: "candidate match",
  "previously-present": "previously present",
  missing: "not found",
};

export function UpstreamLights({ trees, compact = false }: { trees: Record<TreeId, TreeSummary>; compact?: boolean }) {
  return (
    <div className="lights" role="group" aria-label="Upstream tree status">
      {(Object.keys(treeLabels) as TreeId[]).map((id) => {
        const tree = trees[id];
        const description = `${treeLabels[id].full}: ${stateLabels[tree.state]}, ${tree.matched} of ${tree.total} patches`;
        return (
          <span className="light-item" key={id} title={description} aria-label={description}>
            <span className={`light-dot light-${tree.state}`} aria-hidden="true" />
            {!compact && <span className="light-label">{treeLabels[id].short}</span>}
            {!compact && <span className="light-count">{tree.matched}/{tree.total}</span>}
          </span>
        );
      })}
    </div>
  );
}
