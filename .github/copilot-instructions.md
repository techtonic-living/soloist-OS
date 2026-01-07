# Copilot / Agent Instructions — Soloist OS (Drift-Killer Mode)

You are working in **soloist-OS**.

This repo is intentionally "contracts-first" to prevent drift between **Figma ⇄ contracts ⇄ code**.

## Prime directive

**Do not introduce drift.**

-   If you are unsure, stop and rehydrate context by reading the docs listed below before changing code.
-   Prefer **small, testable, reversible** changes over broad refactors.

## Rehydrate context (MUST DO at the start of any session)

Before touching code, read these files (in this order):

1. `docs/HANDOFF.md` (current truth + next steps)
2. `docs/DESIGN_SYSTEM.md` (visual rules + conventions)
3. `docs/DEVELOPMENT.md` (build/dev loops + gotchas)
4. `design/contracts/README.md` (contracts workflow)
5. The latest variables snapshot under `design/contracts/variables/` (ground truth tokens)

If you suspect the agent context was reset/pruned, **assume you are missing important constraints** and re-read the above.

## Never-events (absolutes)

### Token invariants (do not regress)

These are considered **hard constraints** unless the user explicitly changes them and updates contracts:

-   **Tool colors are aliases**: `color/tool/*` must be `VARIABLE_ALIAS` → `color/accent/*` (no duplicated hex "tool" values).
-   **Stroke ladder is fixed**:
    -   `stroke/hairline = 0.5`
    -   `stroke/thin = 1`
    -   `stroke/medium = 1.5`
    -   `stroke/bold = 2`
-   **Typography governance**:
    -   Typography Variables store **font family only** (`font/ui`, `font/mono`, `font/brand`, `font/display`).
    -   Text Styles govern size/line-height.
    -   Text style names are lowercase ladders: `ui/01..12`, `mono/01..12`, `brand/01..06`, `display/01..06`.
-   **Icon/tool identity rule (Option A)**:
    -   Tool identity belongs to the **button surface** (tool-colored surfaces).
    -   Icons remain tone-based (no tool-color icon variants).

### Safety / non-destructive rules

-   Do not delete or rename large surfaces of tokens/styles without an explicit user request.
-   The Figma starter-kit seeding must remain **non-destructive by default**.
-   Do not silently change build tooling, manifests, or output paths.
-   Do not commit secrets. `.env` is ignored; prefer `ui-src/.env.example`.

## Workflow for ANY change (required)

1. **State the goal** and identify which docs/contracts govern it.
2. **Investigate first**: search/read before editing.
3. Make **small** changes.
4. Run verification:
    - `npm run build`
5. If the change affects design/tokens/components, update the relevant docs and/or contracts.
6. Summarize changes with file list and why.

## Drift-killer loop (how work should proceed)

1. Design/update in Figma.
2. Export contract/snapshot to `design/contracts/`.
3. Commit contracts.
4. Implement in code against the contract.
5. Re-export and compare.

**Next planned thin slice:** Button contract (`design/contracts/primitives/Button.contract.json`).

## When uncertain

If you find contradictions between code and docs/contracts:

-   Prefer **contracts + HANDOFF** over assumptions.
-   Propose a minimal, reversible plan.
-   Ask for confirmation before any rename/migration that could cause widespread churn.
