import { MessageBrowser, type MessageSummary } from "@/components/message-browser";
import { getPatchsetDetails } from "@/lib/data/loader";

export default async function MessagesPage() {
  const patchsets = await getPatchsetDetails();
  const messages = patchsets.flatMap((patchset) => patchset.patches.map((patch) => ({
    messageId: patch.messageId,
    subject: patch.subject,
    authorName: patchset.authorName,
    authorEmail: patchset.authorEmail,
    postedAt: patchset.postedAt,
    language: patchset.language,
    ...(patch.patchId ? { patchId: patch.patchId } : {}),
    changedFiles: patch.changedFiles,
    loreUrl: patch.loreUrl,
    seriesId: patchset.id,
    revision: patchset.revision,
    index: patch.index,
    total: patch.total,
    status: patchset.status,
    trees: patch.trees,
  } satisfies MessageSummary)));

  return (
    <>
      <section className="page-intro">
        <div className="shell">
          <p className="eyebrow">Mail archive index</p>
          <h1 className="page-title">Messages</h1>
          <p className="page-description">Search individual translation patches by subject, Message-ID, stable patch-id, author, or changed file.</p>
        </div>
      </section>
      <section className="shell content-section">
        <MessageBrowser messages={messages} />
      </section>
    </>
  );
}
