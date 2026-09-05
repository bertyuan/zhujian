import Link from "next/link";
import { notFound } from "next/navigation";
import { LanguageBadge } from "@/components/language-badge";
import { Pipeline } from "@/components/pipeline";
import { StatusBadge } from "@/components/status-badge";
import { UpstreamLights } from "@/components/upstream-lights";
import { getPatchset, getPatchsets } from "@/lib/data/loader";

export function generateStaticParams() {
  return getPatchsets().map((patchset) => ({ id: patchset.id }));
}

export default async function PatchsetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patchset = await getPatchset(id);
  if (!patchset) notFound();

  const postedAt = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short" }).format(new Date(patchset.postedAt));

  return (
    <>
      <header className="detail-header">
        <div className="shell">
          <div className="breadcrumb"><Link href="/">Patchsets</Link> / {patchset.id}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 13 }}>
            <StatusBadge status={patchset.status} />
            <LanguageBadge language={patchset.language} />
          </div>
          <h1 className="detail-title">{patchset.subject}</h1>
        </div>
      </header>
      <div className="shell detail-layout">
        <div>
          <section className="panel">
            <h2 className="panel-title"><span>Upstream progress</span><span>{patchset.patchCount} patches</span></h2>
            <Pipeline trees={patchset.trees} />
          </section>
          <section className="panel">
            <h2 className="panel-title"><span>Series patches</span><span>{patchset.replies} replies</span></h2>
            <ol className="patch-list">
              {patchset.patches.map((patch) => (
                <li className="patch-row" key={patch.messageId}>
                  <span className="patch-number">{patch.index}/{patch.total}</span>
                  <a className="patch-subject text-link" href={patch.loreUrl} target="_blank" rel="noreferrer">{patch.subject}</a>
                  <UpstreamLights trees={patch.trees} compact />
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside>
          <section className="panel">
            <h2 className="panel-title">Series metadata</h2>
            <dl className="meta-list">
              <div className="meta-row"><dt>Author</dt><dd>{patchset.authorName}</dd></div>
              <div className="meta-row"><dt>Email</dt><dd>{patchset.authorEmail}</dd></div>
              <div className="meta-row"><dt>Posted</dt><dd>{postedAt}</dd></div>
              <div className="meta-row"><dt>Version</dt><dd>v{patchset.revision}{patchset.latestRevision ? " · latest" : " · superseded"}</dd></div>
              <div className="meta-row"><dt>RFC</dt><dd>{patchset.rfc ? "Yes" : "No"}</dd></div>
              <div className="meta-row"><dt>Message-ID</dt><dd>{patchset.messageIds[0]}</dd></div>
              <div className="meta-row"><dt>Thread</dt><dd><a className="text-link" href={patchset.loreUrl} target="_blank" rel="noreferrer">View on lore ↗</a></dd></div>
              <div className="meta-row"><dt>Raw mail</dt><dd><a className="text-link" href={patchset.rawUrl} target="_blank" rel="noreferrer">Download ↗</a></dd></div>
            </dl>
          </section>
          <section className="panel">
            <h2 className="panel-title">Versions</h2>
            <div className="version-list">
              {patchset.versions.map((version) => (
                <Link key={version.id} className={`version-chip ${version.current ? "version-current" : ""}`} href={`/patchsets/${version.id}`}>
                  v{version.revision}{version.current ? " current" : ""}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
