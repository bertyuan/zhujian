import type { PatchsetStatus } from "@/lib/data/schema";

const statusLabels: Record<PatchsetStatus, string> = {
  "on-lore": "On lore",
  "in-review": "In review",
  "queued-alex": "Queued by Alex",
  "in-docs-mw": "In docs-mw",
  mainline: "Mainline",
  "partially-applied": "Partially applied",
  superseded: "Superseded",
  "previously-queued": "Previously queued",
};

const statusClasses: Record<PatchsetStatus, string> = {
  "on-lore": "status-lore",
  "in-review": "status-review",
  "queued-alex": "status-alex",
  "in-docs-mw": "status-docs-mw",
  mainline: "status-mainline",
  "partially-applied": "status-partial",
  superseded: "status-superseded",
  "previously-queued": "status-previous",
};

export function StatusBadge({ status }: { status: PatchsetStatus }) {
  return (
    <span className={`status-badge ${statusClasses[status]}`}>
      <span className="status-marker" aria-hidden="true">#</span>
      <span className="status-text">{statusLabels[status]}</span>
    </span>
  );
}

export function statusLabel(status: PatchsetStatus) {
  return statusLabels[status];
}
