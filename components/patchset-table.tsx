"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Language, PatchsetStatus, PatchsetSummary } from "@/lib/data/schema";
import { TRACKED_TREES } from "@/lib/git/config";
import { LanguageBadge } from "./language-badge";
import { PatchsetCard } from "./patchset-card";
import { StatusBadge } from "./status-badge";
import { UpstreamLights } from "./upstream-lights";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "2-digit", timeZone: "UTC" }).format(new Date(value));

type StatusFilter = "all" | "lore" | "review" | "alex" | "corbet" | "linus" | "partial" | "superseded";

const statusMatches = (status: PatchsetStatus, filter: StatusFilter) => {
  if (filter === "all") return true;
  if (filter === "lore") return status === "on-lore";
  if (filter === "review") return status === "in-review";
  if (filter === "alex") return status === "queued-alex" || status === "previously-queued";
  if (filter === "corbet") return status === "in-docs-mw";
  if (filter === "linus") return status === "mainline";
  if (filter === "partial") return status === "partially-applied";
  return status === "superseded";
};

export function PatchsetTable({ patchsets }: { patchsets: PatchsetSummary[] }) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<"all" | Language>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [versions, setVersions] = useState<"latest" | "all">("latest");
  const [selectedIndex, setSelectedIndex] = useState(-1);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isControl = target.matches("input, select, button, a");
      if (event.key === "/" && !isControl) {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (isControl) return;
      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((value) => Math.min(value + 1, visible.length - 1));
      } else if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((value) => Math.max(value - 1, 0));
      } else if ((event.key === "Enter" || event.key === "o") && selectedIndex >= 0) {
        event.preventDefault();
        router.push(`/patchsets/${visible[selectedIndex].id}`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, selectedIndex, visible]);

  return (
    <>
      <div className="controls">
        <select className="filter" aria-label="Filter by language" value={language} onChange={(e) => { setLanguage(e.target.value as typeof language); setSelectedIndex(-1); }}>
          <option value="all">All languages</option>
          <option value="zh_CN">zh_CN</option>
          <option value="zh_TW">zh_TW</option>
          <option value="mixed">Mixed</option>
        </select>
        <label className="search-wrap">
          <span className="sr-only">Search patchsets</span>
          <input
            ref={searchRef}
            className="search-input"
            type="search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setSelectedIndex(-1); }}
            placeholder="Search (subject, author, email, Message-ID)"
          />
        </label>
        <button className="control-button" type="button" disabled={!query} onClick={() => { setQuery(""); setSelectedIndex(-1); }}>Clear</button>
        <select className="filter" aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value as StatusFilter); setSelectedIndex(-1); }}>
          <option value="all">All statuses</option>
          <option value="lore">On lore</option>
          <option value="review">In review</option>
          {TRACKED_TREES.map((tree) => <option value={tree.id} key={tree.id}>{tree.name}</option>)}
          <option value="partial">Partial</option>
          <option value="superseded">Superseded</option>
        </select>
        <select className="filter" aria-label="Filter by version" value={versions} onChange={(e) => { setVersions(e.target.value as typeof versions); setSelectedIndex(-1); }}>
          <option value="latest">Latest only</option>
          <option value="all">All revisions</option>
        </select>
        <span className="control-spacer" />
        <Link className="control-button active" href="/">Patchsets</Link>
        <Link className="control-button" href="/messages">Messages</Link>
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
                {visible.map((patchset, index) => (
                  <tr className={selectedIndex === index ? "selected" : ""} key={patchset.id} onMouseEnter={() => setSelectedIndex(index)}>
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
          <div className="stats" aria-live="polite">
            <strong>{visible.length}</strong> of {patchsets.length} patchsets
            <span> · </span>
            <span><kbd>/</kbd> search</span>
            <span> · </span>
            <span><kbd>j</kbd><kbd>k</kbd> navigate</span>
            <span> · </span>
            <span><kbd>Enter</kbd> open</span>
          </div>
          <div className="kbd-hint" aria-hidden="true">
            <kbd>/</kbd> search <kbd>j</kbd><kbd>k</kbd> nav <kbd>Enter</kbd> open
          </div>
        </>
      ) : (
        <div className="panel empty-state">No patch series match these filters.</div>
      )}
    </>
  );
}
