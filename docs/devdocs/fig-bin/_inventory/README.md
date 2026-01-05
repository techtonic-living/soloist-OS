# Snapshot baseline (_inventory)

This folder contains machine-readable artifacts that define the **canonical snapshot baseline** for the current refactor/harmonization phase.

## Files

- `latest-inventory.json` / `latest-inventory.csv`
  - One row per **unique** `meta.fileName`.
  - Uses the **newest snapshot per fileName**.
  - Intended for quick planning metrics (counts, hidden totals, alias-missing-local counts).

- `latest-findings.json`
  - One row per **unique** `meta.fileName`.
  - Includes planning details:
    - where modes are still named `"Mode 1"`
    - `hiddenFromPublishing` breakdown by collection
    - alias targets that are **not present locally** (usually remote/library variables)

- `baseline-manifest.json`
  - The pinned 8-file baseline set (paths + timestamps).
  - Treat this as the “lock file” for downstream transforms.

- `mode-rename-proposal.json`
  - **One shared proposal file** for renaming modes across the whole baseline.
  - Contains an array of proposed renames keyed by `fileName`, `collectionId`, and `modeId`.
  - Intended usage: open each Figma file and apply the **same** `mode-rename-proposal.json` repeatedly.
    - The plugin filters by the currently-open file name (`figma.root.name`) and only applies relevant entries.

- `alias-missing-local-report.soloist-os-plugin.json`
  - Deep report of alias values that reference non-local/remote variable IDs.
  - Currently expected to be concentrated in **Soloist OS Plugin** (per findings).

## Regeneration

Run the auditor with:

- `--inventory` to refresh inventory CSV/JSON
- `--findings` to refresh findings JSON
- `--latest` to keep the console output focused

If you create new snapshots and intend to change the baseline, re-run the above and update `baseline-manifest.json`.
