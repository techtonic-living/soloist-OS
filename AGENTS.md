# AGENTS.md — Orientation for any AI/automation in this repo

If you are an automated agent (Copilot Chat, CLI agent, or a fresh LLM session), read this first.

## 30-second orientation

Soloist OS is using a **contracts-first** approach so Figma and code cannot silently drift.

Truth is anchored in:

- `design/contracts/` (exported facts)
- `plugin/code.tsx` (deterministic seeding + validation + snapshot export)
- `docs/` (human rules + invariants)

## Start-of-session checklist (mandatory)

1. Read `docs/HANDOFF.md`.
2. Read `docs/DESIGN_SYSTEM.md`.
3. Read `docs/DEVELOPMENT.md`.
4. Read `design/contracts/README.md`.
5. Open the latest variables snapshot in `design/contracts/variables/`.

If you did not do the above, you are not ready to change code.

## Never-events (absolutes)

Do not violate these unless the user explicitly changes the contract + docs:

- `color/tool/*` are aliases to `color/accent/*` (no duplicated tool hex values).
- Stroke ladder is fixed: 0.5 / 1 / 1.5 / 2 (hairline/thin/medium/bold).
- Typography Variables are font-family only; Text Styles own sizing/line-height; naming ladders are lowercase.
- Tool identity on surfaces; icons stay tone-based.

## Safe-change rules

- Prefer additive changes over renames/deletes.
- Anything that could cause large diffs (token renames, sweeping refactors) requires an explicit confirmation step.
- Keep the plugin seeding non-destructive by default.
- Never commit secrets; use `ui-src/.env.example`.

## Required verification

- Run `npm run build` after changes.

## Next planned work

- First primitive thin slice: **Button**
  - Export `design/contracts/primitives/Button.contract.json`
  - Implement Button in code against the contract
  - Re-export + drift-check

## If you think context was reset

Assume you are missing critical constraints.
Rehydrate by re-reading the docs/contracts above before proceeding.
