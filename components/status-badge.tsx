import type { PatchsetStatus } from "@/lib/data/schema";

const statusLabels: Record<PatchsetStatus, string> = {
  "waiting-for-review": "Waiting for review",
  "in-review": "In review",
  updated: "Updated",
  "queued-alex": "Queued by Alex",
  "in-docs-mw": "In docs-mw",
  mainline: "Mainline",
  "partially-applied": "Partially applied",
  "previously-queued": "Previously queued",
};

const statusClasses: Record<PatchsetStatus, string> = {
  "waiting-for-review": "status-waiting",
  "in-review": "status-review",
  updated: "status-updated",
  "queued-alex": "status-alex",
  "in-docs-mw": "status-docs-mw",
  mainline: "status-mainline",
  "partially-applied": "status-partial",
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
