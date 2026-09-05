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

Queries are restricted to `https://lore.kernel.org/linux-doc/`. Later runs use
the committed last-success state with a one-hour overlap and deduplicate by
Message-ID.

To build the Git commit indexes locally as well:

```sh
pnpm sync:git
```

This maintains blobless bare repositories under `.cache/git`, follows Alex's
`docs-next`, Corbet's `docs-mw`, and Linus's `master`, and indexes only commits
touching the `zh_CN` or `zh_TW` translation directories. Set `GIT_SYNC_SINCE`
to change the initial scan date.

## GitHub Action

`.github/workflows/sync.yml` runs every 30 minutes and can also be started from
the Actions tab. A manual run accepts an optional `since` date for backfills.
It installs `lei`, restores a daily cache of the three Linux repositories, runs
the same lore and Git synchronization code, validates the JSON, tests the
project, and commits only files under `data/` when they changed.

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

The real-data pipeline now covers lore ingestion and Git commit indexing. The
Alex, Corbet, and Linus lamps remain `missing` until the indexed stable patch
IDs are reconciled with the email patches in the next phase.
