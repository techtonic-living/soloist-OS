---
name: soloist-rehydrate
description: Rehydrate Soloist OS context + confirm never-events before doing work.
argument-hint: "What are we trying to do next? (e.g. Button contract thin slice)"
agent: agent
---

# Soloist OS — Rehydrate & Drift Guard

You are in the **soloist-OS** workspace.

## 0) Reset safety (assume amnesia is possible)

If there is _any_ chance this is a new chat session or the context was pruned, **do not proceed** until you have rehydrated from repo truth.

Start your response with a single line:

-   `RESET-GUARD: rehydrated from HANDOFF + DESIGN_SYSTEM + DEVELOPMENT + latest snapshot`
    (If you did not actually re-read them, say so explicitly.)

## 1) Run mechanical preflight

Run the repo preflight check and include its output:

-   `npm run preflight`

If the preflight reports failures, stop and propose a minimal fix plan. **Do not do sweeping edits.**

## 2) Rehydrate from repo truth (must cite the files)

Read, in order:

1. [`docs/HANDOFF.md`](../../docs/HANDOFF.md)
2. [`docs/DESIGN_SYSTEM.md`](../../docs/DESIGN_SYSTEM.md)
3. [`docs/DEVELOPMENT.md`](../../docs/DEVELOPMENT.md)
4. [`design/contracts/README.md`](../../design/contracts/README.md)
5. Latest snapshot under [`design/contracts/variables/`](../../design/contracts/variables/)

Then summarize in **≤10 bullets**:

-   The current “never-events” (hard constraints)
-   The current “next step” (what we’re marching toward)
-   Any open risk/unknowns you must clarify before editing

## 3) Operating rules (hard)

-   Prefer additive changes over renames/deletes.
-   Any large diff requires explicit confirmation before editing.
-   Starter-kit seeding must remain **non-destructive by default**.
-   Verify with `npm run build` after changes.

## 4) What the user wants _right now_

Use the user’s chat input (and this prompt’s argument) to restate the goal in one sentence, then propose the smallest safe next action.

Input from user:

-   `${input:goal:What are we trying to do next?}`
