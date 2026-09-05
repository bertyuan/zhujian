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

## GitHub Action

`.github/workflows/sync.yml` runs every 30 minutes and can also be started from
the Actions tab. A manual run accepts an optional `since` date for backfills.
It installs `lei`, runs the same synchronization code, validates the JSON,
tests the project, and commits only files under `data/` when they changed.

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

The current real-data milestone covers lore ingestion. The Alex, Corbet, and
Linus lamps are still `missing` for live data until Git synchronization and
patch reconciliation are implemented in the next phases.
