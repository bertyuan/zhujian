import type { SyncRunState } from "@/lib/data/schema";
import { formatSyncTime } from "@/lib/data/time";

export function GeneratedStatus({
  generatedAt,
  status,
  label = "Generated",
  className = "",
}: {
  generatedAt: string;
  status?: SyncRunState["status"];
  label?: string;
  className?: string;
}) {
  return (
    <span className={`generated-status ${className}`.trim()}>
      <span>{label}</span>
      <time dateTime={generatedAt}>{formatSyncTime(generatedAt)} CST</time>
      {status && <strong className={status === "error" ? "sync-error-text" : ""}>{status}</strong>}
    </span>
  );
}
