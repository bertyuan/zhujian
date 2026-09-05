export default function MessagesPage() {
  return (
    <>
      <section className="page-intro">
        <div className="shell">
          <p className="eyebrow">Mail archive index</p>
          <h1 className="page-title">Messages</h1>
          <p className="page-description">Raw lore messages will become searchable here after fixture ingestion is added in Phase 3.</p>
        </div>
      </section>
      <section className="shell content-section">
        <div className="panel message-placeholder">
          <strong>Patchset tracking comes first.</strong>
          Message-level browsing is reserved for the fixture ingestion milestone.
        </div>
      </section>
    </>
  );
}
