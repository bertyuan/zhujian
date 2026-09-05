"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Language, PatchsetStatus, TreeId, TreeSummary } from "@/lib/data/schema";
import { LanguageBadge } from "./language-badge";
import { StatusBadge } from "./status-badge";
import { UpstreamLights } from "./upstream-lights";

export interface MessageSummary {
  messageId: string;
  subject: string;
  authorName: string;
  authorEmail: string;
  postedAt: string;
  language: Language;
  patchId?: string;
  changedFiles: string[];
  loreUrl: string;
  seriesId: string;
  revision: number;
  index: number;
  total: number;
  status: PatchsetStatus;
  trees: Record<TreeId, TreeSummary>;
}

const formatDate = (value: string) => new Intl.DateTimeFormat("en", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(value));

export function MessageBrowser({ messages }: { messages: MessageSummary[] }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<"all" | Language>("all");
  const [versions, setVersions] = useState<"latest" | "all">("latest");
  const [limit, setLimit] = useState(100);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const latestSeries = new Set(messages.filter((message) => message.status !== "superseded").map((message) => message.seriesId));
    return messages.filter((message) => {
      const haystack = [
        message.subject,
        message.messageId,
        message.authorName,
        message.authorEmail,
        message.patchId ?? "",
        ...message.changedFiles,
      ].join(" ").toLocaleLowerCase();
      return (!needle || haystack.includes(needle))
        && (language === "all" || message.language === language)
        && (versions === "all" || latestSeries.has(message.seriesId));
    });
  }, [language, messages, query, versions]);
  const displayed = visible.slice(0, limit);

  return (
    <>
      <div className="toolbar">
        <label className="search-wrap">
          <span className="search-icon" aria-hidden="true">/</span>
          <span className="sr-only">Search patch messages</span>
          <input
            className="search-input mono"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subject, Message-ID, patch-id, file…"
          />
        </label>
        <div className="filters">
          <select className="filter" aria-label="Filter messages by language" value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}>
            <option value="all">All languages</option>
            <option value="zh_CN">zh_CN</option>
            <option value="zh_TW">zh_TW</option>
            <option value="mixed">Mixed</option>
          </select>
          <select className="filter" aria-label="Filter messages by series version" value={versions} onChange={(event) => setVersions(event.target.value as typeof versions)}>
            <option value="latest">Latest series only</option>
            <option value="all">All revisions</option>
          </select>
        </div>
      </div>

      <div className="section-heading">
        <h2>Patch messages</h2>
        <span className="result-count" aria-live="polite">{visible.length} of {messages.length} patches</span>
      </div>

      {visible.length ? (
        <div className="message-results">
          {displayed.map((message) => (
            <article className="message-card" key={message.messageId}>
              <div className="message-main">
                <div className="message-tags">
                  <LanguageBadge language={message.language} />
                  <StatusBadge status={message.status} />
                  <span className="message-part mono">v{message.revision} · {message.index}/{message.total}</span>
                </div>
                <h2 className="message-title">
                  <a href={message.loreUrl} target="_blank" rel="noreferrer">{message.subject} ↗</a>
                </h2>
                <div className="message-id mono">{message.messageId}</div>
                <div className="message-meta">
                  <span>{message.authorName}</span>
                  <span>{formatDate(message.postedAt)}</span>
                  {message.patchId && <span className="mono" title={message.patchId}>patch-id {message.patchId.slice(0, 10)}</span>}
                  <Link className="text-link" href={`/patchsets/${message.seriesId}`}>Series details</Link>
                </div>
              </div>
              <UpstreamLights trees={message.trees} />
            </article>
          ))}
          {displayed.length < visible.length && (
            <div className="message-more">
              <button className="load-more" type="button" onClick={() => setLimit((value) => value + 100)}>
                Show 100 more
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="panel empty-state">No patch messages match these filters.</div>
      )}
    </>
  );
}
