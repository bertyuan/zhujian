# Generated data

The JSON files in this directory are generated application data and will be replaced by the synchronization pipeline. Do not edit them by hand once automated ingestion is enabled.

`internal/` stores incremental synchronization cursors and the lore message cache. `indexes/` stores relevant commits discovered in each tracked Linux tree. Both directories are committed so a new runner can continue from the last successful state.

`overrides.yml` is the exception: it is intentionally maintained and reviewed by humans.
