import type { TreeId, TreeSummary } from "@/lib/data/schema";

const stages: Array<{ id: TreeId; name: string; branch: string; repository: string }> = [
  { id: "alex", name: "Alex", branch: "docs-next", repository: "alexs/linux" },
  { id: "corbet", name: "Corbet", branch: "docs-mw", repository: "docs/linux" },
  { id: "linus", name: "Linus", branch: "master", repository: "torvalds/linux" },
];

const stateLabels: Record<TreeSummary["state"], string> = {
  confirmed: "Confirmed",
  partial: "Partially confirmed",
  candidate: "Candidate match",
  "previously-present": "Previously present",
  missing: "Not found",
};

export function Pipeline({ trees }: { trees: Record<TreeId, TreeSummary> }) {
  return (
    <div className="pipeline">
      {stages.map((stage) => {
        const tree = trees[stage.id];
        const label = `${stage.name} ${stage.branch}: ${tree.state}, ${tree.matched} of ${tree.total} patches`;
        return (
          <div className="pipeline-stage" key={stage.id} role="group" aria-label={label}>
            <span className={`light-dot pipeline-dot light-${tree.state}`} aria-hidden="true" />
            <div className="pipeline-name">{stage.name}</div>
            <span className="pipeline-branch">{stage.branch}</span>
            <span className="pipeline-count">{tree.matched} of {tree.total} confirmed</span>
            <span className={`pipeline-state pipeline-state-${tree.state}`}>{stateLabels[tree.state]}</span>
            {tree.commit && (
              <a className="pipeline-sha" href={`https://git.kernel.org/pub/scm/linux/kernel/git/${stage.repository}.git/commit/?id=${tree.commit}`} target="_blank" rel="noreferrer">
                {tree.commit.slice(0, 8)} ↗
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
