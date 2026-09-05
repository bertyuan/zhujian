"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Language, PatchsetStatus, PatchsetSummary } from "@/lib/data/schema";
import { LanguageBadge } from "./language-badge";
import { PatchsetCard } from "./patchset-card";
import { StatusBadge } from "./status-badge";
import { UpstreamLights } from "./upstream-lights";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "2-digit" }).format(new Date(value));

type StatusFilter = "all" | "lore" | "alex" | "corbet" | "linus" | "partial" | "superseded";

const statusMatches = (status: PatchsetStatus, filter: StatusFilter) => {
  if (filter === "all") return true;
  if (filter === "lore") return status === "on-lore";
  if (filter === "alex") return status === "queued-alex" || status === "previously-queued";
  if (filter === "corbet") return status === "in-docs-mw";
  if (filter === "linus") return status === "mainline";
  if (filter === "partial") return status === "partially-applied";
  return status === "superseded";
};

export function PatchsetTable({ patchsets }: { patchsets: PatchsetSummary[] }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<"all" | Language>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [versions, setVersions] = useState<"latest" | "all">("latest");

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return patchsets.filter((patchset) => {
      const haystack = [patchset.subject, patchset.authorName, patchset.authorEmail, ...patchset.messageIds]
        .join(" ")
        .toLocaleLowerCase();
      return (
        (!needle || haystack.includes(needle)) &&
        (language === "all" || patchset.language === language) &&
        statusMatches(patchset.status, status) &&
        (versions === "all" || patchset.latestRevision)
      );
    });
  }, [language, patchsets, query, status, versions]);

  return (
    <>
      <div className="toolbar">
        <label className="search-wrap">
          <span className="search-icon" aria-hidden="true">/</span>
          <span className="sr-only">Search patchsets</span>
          <input
            className="search-input mono"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subject, author, email, Message-ID…"
          />
        </label>
        <div className="filters">
          <select className="filter" aria-label="Filter by language" value={language} onChange={(e) => setLanguage(e.target.value as typeof language)}>
            <option value="all">All languages</option>
            <option value="zh_CN">zh_CN</option>
            <option value="zh_TW">zh_TW</option>
            <option value="mixed">Mixed</option>
          </select>
          <select className="filter" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
            <option value="all">All statuses</option>
            <option value="lore">On lore</option>
            <option value="alex">Alex</option>
            <option value="corbet">Corbet</option>
            <option value="linus">Linus</option>
            <option value="partial">Partial</option>
            <option value="superseded">Superseded</option>
          </select>
          <select className="filter" aria-label="Filter by version" value={versions} onChange={(e) => setVersions(e.target.value as typeof versions)}>
            <option value="latest">Latest only</option>
            <option value="all">All revisions</option>
          </select>
        </div>
      </div>

      <div className="section-heading">
        <h2>Patch series</h2>
        <span className="result-count">{visible.length} of {patchsets.length} series</span>
      </div>

      {visible.length ? (
        <>
          <div className="table-shell">
            <table className="patch-table">
              <thead>
                <tr>
                  <th>Subject</th><th>Author</th><th>Date</th><th>Parts</th><th>Lang</th><th>Status</th><th>Upstream</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((patchset) => (
                  <tr key={patchset.id}>
                    <td>
                      <Link className="subject-link" href={`/patchsets/${patchset.id}`}>{patchset.subject}</Link>
                      <span className="subline mono">v{patchset.revision} · {patchset.authorEmail}</span>
                    </td>
                    <td className="nowrap">{patchset.authorName}</td>
                    <td className="nowrap mono">{formatDate(patchset.postedAt)}</td>
                    <td className="mono">{patchset.patchCount}</td>
                    <td><LanguageBadge language={patchset.language} /></td>
                    <td><StatusBadge status={patchset.status} /></td>
                    <td><UpstreamLights trees={patchset.trees} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-list">{visible.map((patchset) => <PatchsetCard key={patchset.id} patchset={patchset} />)}</div>
        </>
      ) : (
        <div className="panel empty-state">No patch series match these filters.</div>
      )}
    </>
  );
}
