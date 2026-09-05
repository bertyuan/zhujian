import Link from "next/link";
import type { PatchsetSummary } from "@/lib/data/schema";
import { LanguageBadge } from "./language-badge";
import { StatusBadge } from "./status-badge";
import { UpstreamLights } from "./upstream-lights";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(value));

export function PatchsetCard({ patchset }: { patchset: PatchsetSummary }) {
  return (
    <article className="patch-card">
      <div className="patch-card-head">
        <Link href={`/patchsets/${patchset.id}`} className="patch-card-title">
          {patchset.subject}
        </Link>
        <LanguageBadge language={patchset.language} />
      </div>
      <div className="patch-card-meta">
        <span>{patchset.authorName}</span>
        <span>{formatDate(patchset.postedAt)}</span>
        <span>{patchset.patchCount} {patchset.patchCount === 1 ? "patch" : "patches"}</span>
      </div>
      <div className="patch-card-foot">
        <StatusBadge status={patchset.status} />
        <UpstreamLights trees={patchset.trees} compact />
      </div>
    </article>
  );
}
