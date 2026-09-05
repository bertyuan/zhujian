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
      <div className="controls">
        <select className="filter" aria-label="Filter messages by language" value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}>
          <option value="all">All languages</option>
          <option value="zh_CN">zh_CN</option>
          <option value="zh_TW">zh_TW</option>
          <option value="mixed">Mixed</option>
        </select>
        <label className="search-wrap">
          <span className="sr-only">Search patch messages</span>
          <input
            className="search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search (subject, Message-ID, patch-id, file)"
          />
        </label>
        <button className="control-button" type="button" disabled={!query} onClick={() => setQuery("")}>Clear</button>
        <select className="filter" aria-label="Filter messages by series version" value={versions} onChange={(event) => setVersions(event.target.value as typeof versions)}>
          <option value="latest">Latest series only</option>
          <option value="all">All revisions</option>
        </select>
        <span className="control-spacer" />
        <Link className="control-button" href="/">Patchsets</Link>
        <Link className="control-button active" href="/messages">Messages</Link>
      </div>

      {visible.length ? (
        <>
          <div className="table-shell message-table-shell">
            <table className="patch-table message-table">
              <thead><tr><th>Subject</th><th>Author</th><th>Date</th><th>Part</th><th>Lang</th><th>Status</th><th>Upstream</th></tr></thead>
              <tbody>
                {displayed.map((message) => (
                  <tr key={message.messageId}>
                    <td>
                      <a className="subject-link" href={message.loreUrl} target="_blank" rel="noreferrer">{message.subject} ↗</a>
                      <span className="subline">{message.messageId}</span>
                      <span className="subline">
                        {message.patchId ? `patch-id ${message.patchId.slice(0, 10)} · ` : ""}
                        <Link className="text-link" href={`/patchsets/${message.seriesId}`}>series</Link>
                      </span>
                    </td>
                    <td><span className="nowrap">{message.authorName}</span><span className="subline">{message.authorEmail}</span></td>
                    <td className="nowrap">{formatDate(message.postedAt)}</td>
                    <td className="nowrap">v{message.revision} · {message.index}/{message.total}</td>
                    <td><LanguageBadge language={message.language} /></td>
                    <td><StatusBadge status={message.status} /></td>
                    <td><UpstreamLights trees={message.trees} compact /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-list message-mobile-list">
            {displayed.map((message) => (
              <article className="message-card" key={message.messageId}>
                <div className="message-tags">
                  <LanguageBadge language={message.language} />
                  <StatusBadge status={message.status} />
                  <span className="message-part">v{message.revision} · {message.index}/{message.total}</span>
                </div>
                <a className="message-title" href={message.loreUrl} target="_blank" rel="noreferrer">{message.subject} ↗</a>
                <div className="message-id">{message.messageId}</div>
                <div className="message-meta"><span>{message.authorName}</span><span>{formatDate(message.postedAt)}</span><Link className="text-link" href={`/patchsets/${message.seriesId}`}>series</Link></div>
              </article>
            ))}
          </div>
          {displayed.length < visible.length && (
            <div className="message-more">
              <button className="load-more" type="button" onClick={() => setLimit((value) => value + 100)}>
                Show 100 more
              </button>
            </div>
          )}
          <div className="stats" aria-live="polite"><strong>{displayed.length}</strong> shown · {visible.length} matching · {messages.length} total messages</div>
        </>
      ) : (
        <div className="panel empty-state">No patch messages match these filters.</div>
      )}
    </>
  );
}
