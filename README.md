# zhujian

A static tracker for Chinese Linux documentation patch series. It reconstructs
`zh_CN` and `zh_TW` series from the public `linux-doc` archive and renders the
generated JSON with Next.js.

## Local preview

```sh
pnpm install
pnpm ingest:fixtures
pnpm dev
```

Open <http://localhost:3000>. Fixture mode does not require network access or
`lei`.

## Real lore data

Install `lei` (from the public-inbox project), verify that `lei q --help` works,
then run:

```sh
pnpm sync:lore
pnpm dev
```

The first synchronization starts at `2025-01-01`. Override only that first
starting point with `INITIAL_SYNC_SINCE`. To deliberately fetch an older range:

```sh
SYNC_SINCE=2024-01-01 pnpm backfill
```

`pnpm backfill` runs the complete lore, Git, reconciliation, generation, and
validation pipeline from that date. Use `pnpm backfill:lore` only when you
deliberately want to update the mail cache without rescanning Git.

Queries are restricted to `https://lore.kernel.org/linux-doc/`. Later runs use
the committed last-success state with a one-hour overlap and deduplicate by
Message-ID.

To build the Git commit indexes locally as well:

```sh
pnpm sync:git
pnpm reconcile
```

Or run the complete, idempotent pipeline in one command:

```sh
pnpm sync
```

That command synchronizes lore, updates all three Git indexes, regenerates and
reconciles the JSON, then validates the result. `pnpm generate` repeats only the
deterministic generation and reconciliation step from the committed lore cache
and Git indexes.

This maintains blobless bare repositories under `.cache/git`, follows Alex's
`docs-next`, Corbet's `docs-mw`, and Linus's `master`, and indexes only commits
touching the `zh_CN` or `zh_TW` translation directories. Set `GIT_SYNC_SINCE`
to change the initial scan date. Lore synchronization computes and caches
`git patch-id --stable` values for relevant email patches. Reconciliation uses
exact patch IDs for confirmed matches; a strict subject, author, file, and date
comparison can only produce an amber candidate, never a confirmation.

Reviewed exceptions belong in `data/overrides.yml`:

```yaml
matches:
  - message_id: "<patch@example.com>"
    tree: alex
    commit: abcdef1234567890
    reason: "Patch edited while applying"
ignore:
  - message_id: "<noise@example.com>"
    reason: "Not actually a Chinese translation patch"
```

Each exception requires a reason. A manual match is rejected if its Message-ID
does not identify a generated patch, while an ignore remains valid after that
patch has been removed on the first run. A manual match may use a unique 7–40
character Git SHA; use the full SHA when possible.

## GitHub Action

`.github/workflows/sync.yml` runs every 30 minutes and can also be started from
the Actions tab. A manual run accepts an optional `since` date for backfills.
It installs `lei`, restores a daily cache of the three Linux repositories, runs
the same lore, Git synchronization, and reconciliation code, validates the
JSON, tests the project, and commits only files under `data/` when they changed.

The workflow needs GitHub Actions to have write permission for repository
contents. Branch protection must also allow the workflow to update the default
branch, or the generated-data push will be rejected.

## Checks

```sh
pnpm test
pnpm lint
pnpm validate:data
pnpm build
```

The real-data pipeline covers lore ingestion, Git commit indexing, and
patch-level reconciliation. The Alex, Corbet, and Linus lamps are aggregated
independently from exact, candidate, historical, and manual matches.
