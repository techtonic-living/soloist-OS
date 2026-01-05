# Next steps: harmonize modes + aliases

This document is generated from the current baseline snapshot set:

- `baseline-manifest.json` (pins the canonical 8 snapshot files)
- `latest-inventory.json` (counts)
- `latest-findings.json` (planning details)

## What stands out right now

### 1) “Mode 1” is still pervasive (12 occurrences)
These aren’t *wrong*, but they block shared semantics, reusability, and automated transforms.

From `latest-findings.json`, `Mode 1` appears in these files/collections:

- **00_Global Design System**: `Variable collection`
- **Flock Design Library**: `Soloist Primitives`
- **Global Library**: `Primitives`
- **GS - Primitives**: `Foundations`
- **sandman**: `User`, `System`, `Interface`
- **Smart Swatch**: `User`, `System`, `Interface`
- **Soloist OS Plugin**: `Global`
- **unBind Library**: `System`

### 2) Hidden-from-publishing usage is concentrated (282 total)
Hidden variables often indicate:
- scratch/workbench tokens,
- internal-only primitives,
- or a deliberate “don’t publish this” stance.

Current hotspots:

- **Soloist OS Plugin**: **229 hidden**
  - `Global` 184
  - `Size` 33
  - `Density` 12
- **sandman**: **26 hidden** (all in `System`)
- **Smart Swatch**: **26 hidden** (all in `System`)
- **GS - Primitives**: **1 hidden** (in `Scales`)

### 3) Non-local alias targets exist in exactly one file (for now)
- **Soloist OS Plugin** has **6** alias references that point to variable IDs **not present in the snapshot** (typically remote/library variables).

Sample targets (from the findings file):
- `Semantic/Wrappers/box-shadow-drop` -> `VariableID:2001:3789`
- `Semantic/Wrappers/box-shadow-glow` -> `VariableID:2001:3789`
- `Color/Aliases/Neutrals/transparent` -> `VariableID:2232:663`

That’s good news: alias hygiene is already pretty clean across the other 7.

### 4) Possible “twin” files: sandman vs Smart Swatch
Both have identical high-level structure:
- 5 collections
- 483 variables
- 26 hidden (all in `System`)
- Mode 1 in `User`, `System`, `Interface`

Also notable: their collection IDs look identical (e.g. `VariableCollectionId:1:2955`). That strongly suggests one is a clone/derivative of the other (or duplicated from a common ancestor).

**Recommended action:** decide whether these are:
- two distinct products that should remain separate (but harmonized), or
- one canonical library + one deprecated copy.

## Recommended decision points (fast, high impact)

### A) Pick your canonical “source of truth” token stack
You don’t have to merge everything immediately, but you do need a direction:

1) Choose a *single* file to be the canonical primitives/system baseline (likely **GS - Primitives** or **00_Global Design System**).
2) Decide whether **Soloist OS Plugin** is a consumer of that baseline (ideal) vs an independent, partially-harvested system.

### B) Standardize mode naming
A practical baseline naming convention that plays well with transforms:

- **Single-mode collections**: rename `Mode 1` → `Default`.
- **Theme collections**: prefer `Light`, `Dark` (and optionally `HC` variants if real).
- **Density**: `Compact`, `Default`, `Spacious`.
- **Viewport**: `Min`, `Default`, `Max` (or `Condensed`/`Expanded` if that’s your language).

**Immediate wins:**
- `Global Library / Primitives`: `Mode 1` → `Default`
- `unBind Library / System`: `Mode 1` → `Default`
- `Soloist OS Plugin / Global`: `Mode 1` → `Default` (unless it’s actually a theme mode)

### C) Resolve non-local aliases (Soloist OS Plugin)
Pick one strategy and apply it consistently:

1) **Make it self-contained** (best for portability):
   - copy/import the missing target variables into the file, then repoint aliases locally.
2) **Make the dependency explicit** (best for shared libraries):
   - ensure the target variables come from a published library,
   - and document/verify the library dependency (no “harvested” ghosts).
3) **Bake values** (best for one-off tokens):
   - replace aliases with resolved literal values in the target modes.

Given your goal (cross-file refactor + re-import), #1 tends to be the least surprising.

### D) Decide what “hiddenFromPublishing” means in your governance
Two clean policies:

- **Strict**: hidden means “internal-only, never exported.”
- **Loose**: hidden means “not ready / experimental.”

Right now, the plugin file’s 229 hidden variables will heavily impact whatever gets treated as publishable.

## Concrete outputs you can expect next

These artifacts are now generated in this same `_inventory/` folder:

1) `mode-rename-proposal.json`
   - A **single proposal file** that includes mode renames for all baseline files.
   - Apply it by repeating the same steps in each Figma file (open file → run plugin → Export tab → upload proposal → Dry run → Apply).
   - The plugin will only apply entries where `fileName` matches the currently-open file name (`figma.root.name`).

2) `alias-missing-local-report.soloist-os-plugin.json`
   - Deep breakdown of alias values that reference non-local/remote variable IDs.

Optional next automation (still useful): generate a “candidate merge map” for sandman vs Smart Swatch if you decide to dedupe/merge.
