# Level Up Soloist’s Workflow — Implementation Plan

**Last updated:** 2026-01-07
**Prime directive:** Do not introduce drift. Contracts-first, deterministic exports, small reversible steps.

This plan levels up the Soloist OS workflow by tightening the loop between:

- **Figma** (design intent + variables + components)
- **Contracts** (`design/contracts/**` exported facts)
- **Code** (UI + plugin + tests)
- **Dev tooling** (MCP, Code Connect, Dev Resources)

It’s intentionally staged so each phase is shippable, reviewable, and measurable.

---

## 0) Baseline: stabilize the drift-killer loop (1–2 sessions)

### Goal
Make the “happy path” for the loop dead simple and make drift visible early.

### Deliverables
- ✅ `npm run build` remains the canonical verification step.
- ✅ `npm run preflight` is treated as mandatory before exporting/committing new snapshots.
- A short “workflow quickstart” snippet (can live in `docs/HANDOFF.md`) describing:
  - `npm run dev:plugin` (dist-based)
  - `npm run dev:plugin:live` (fast UI)
  - when to use `manifest.json` vs `manifest.dev.json`

### Acceptance criteria
- A new contributor can: run the plugin loop, export a variables snapshot, and pass preflight without tribal knowledge.

### Notes / risks
- Keep tooling changes minimal: prefer docs + scripts you already have.

---

## 1) Thin slice: Button contract → Button implementation (highest priority)

### Goal
Establish the pattern for “Figma component → exported contract → code component → drift-check”.

### Deliverables
1. **Figma**: finalize a `Button` component set (variants + bindings).
2. **Contracts**: export `design/contracts/primitives/Button.contract.json`.
3. **Code**: implement `Button` in the UI codebase against that contract (start with a minimal API that matches the contract).
4. **Verification**:
   - `npm run build`
   - (optional next) add a small contract validation script to ensure contract shape is stable and reviewable.

### Contract scope (suggested)
Keep V1 narrow and deterministic:
- `componentName`, `sourceNodeId`, `sourceNodeName`
- `variantProperties` schema (e.g. `kind`, `size`, `state`, `icon`, `tone`)
- enumerated allowed values
- token bindings (variables) for:
  - background / stroke / text
  - focus ring
  - hover/press/disabled states
- structural constraints:
  - min hit target
  - padding + radius tokens
  - icon slot rules

### Acceptance criteria
- The contract is reviewable in PRs (small, stable, not “entire Figma dump”).
- The code `Button` can be rendered in isolation with variants and uses tokens instead of hardcoded styling.

### Button in Figma: drift-proof build checklist (recommended)

This is the “minimal but correct” construction recipe for a Button that:

- avoids variant explosion
- keeps tool identity on **surfaces** (not icons)
- stays compatible with deterministic contract export later

#### 1.1 Structure

- Create a component set named `Button` in `02_COMPONENTS`.
- Use **Auto Layout (horizontal)** on the root:
  - Align center (vertical)
  - Gap: token-based (e.g. `space/2` or `space/3` depending on density)
- Children order:
  1) `IconLeft` (instance of `Icon`) — optional
  2) `Label` (TEXT)
  3) `IconRight` (instance of `Icon`) — optional

#### 1.2 Component properties (avoid variant explosion)

Prefer **component properties** over multiplying variants:

- `label` → TEXT property on `Label`
- `iconLeft` → boolean property controlling visibility of `IconLeft`
- `iconRight` → boolean property controlling visibility of `IconRight`

If you want glyph selection inside Button:

- Expose the nested Icon’s Instance Swap property named `name` (the Icon contract expects this pattern).

#### 1.3 Variants (keep V1 small)

Recommended first-pass variant schema:

- `variant`: `glass | ghost`
- `size`: `sm | md | lg`
- `state`: `default | disabled`

Add `hover | pressed | focus` later if you need deterministic state styling in contracts.

#### 1.4 Token bindings (align with invariants)

Bind these to variables (no hardcoded hex/px when a token exists):

- Surface fill: `color/bg/surface` (or `color/bg/raised` for elevated variants)
- Surface stroke: `color/glass/stroke`
- Radius: `radius/lg` (or `radius/md` if needed, but keep ladder-based)
- Padding: use spacing tokens (e.g. `space/2`, `space/3`, `space/4`, `space/5`) per `size`
- Label style: use a Text Style ladder and tone-based text color tokens (`color/text/*`).

For Button labels, we need three **mono** text styles (one per `size`).

Important governance notes:

- In Figma, bind the label *font family* via the typography variable `font/mono` (JetBrains Mono).
- Keep **color** as a variable on the text layer (e.g. `color/text/primary`); text styles should not be treated as the home for color.
- Enable **Text Trim** on the label text layer (Text Trim is not owned by text styles).

Requested Button label styles (spec):

- `size=sm`
  - Font: `font/mono` (JetBrains Mono)
  - Weight: 100
  - Size: 16
  - Case: Uppercase
  - Text trim: `trim-both`
  - Text box edge: `cap alphabetic`
  - Color token: `color/text/primary`

- `size=md`
  - Font: `font/mono` (JetBrains Mono)
  - Weight: 100
  - Size: 20
  - Case: Uppercase
  - Text trim: `trim-both`
  - Text box edge: `cap alphabetic`
  - Color token: `color/text/primary`

- `size=lg`
  - Font: `font/mono` (JetBrains Mono)
  - Weight: 100
  - Size: 24
  - Case: Uppercase
  - Text trim: `trim-both`
  - Text box edge: `cap alphabetic`
  - Color token: `color/text/primary`

Naming: keep names mechanical + sortable. If these don’t already exist in your mono ladder, add them as new ladder entries (e.g. `mono/??`) rather than ad-hoc names.

Icon governance:

- Icons remain tone-based (`color/text/*`).
- **Do not** bind icon strokes/fills to `color/tool/*`.
- If you introduce tool identity (explore/define/etc), apply it to the **button surface** only.

#### 1.5 Dev Mode content (what to add to the node)

Add a short component description (or Dev Mode annotation) directly on the `Button` component set:

- What it is: “Button primitive (contracts-first).”
- Variant schema (exact prop names/values).
- Property rules (iconLeft/iconRight booleans; label text property).
- Token binding rules (surface vs icon identity).
- Link to the contract path: `design/contracts/primitives/Button.contract.json` (once exported).

#### 1.6 Code Connect mapping (optional but recommended)

To attach code snippets in Dev Mode via Code Connect, the component/component set must be **published**.

- Publish the library/component set in Figma.
- Then map the `Button` node to the code component (currently `ui-src/src/v2/primitives/Button.tsx` → `Button`).

### Notes / risks
- Don’t broaden to multiple primitives until Button proves the pipeline.

---

## 2) Annotation system: from “contract annotations” to true Dev Mode annotations (dual support)

### Goal
Make annotations truly agent-readable/writable **in the same place designers work** (Dev Mode annotations), while keeping repo-stored artifacts deterministic.

### Current state (already implemented)
- “Contract annotations” are stored as child frame `__annotations` with TEXT nodes.
- Plugin exports/applies snapshots under `design/contracts/spec/`.

### Upgrade approach (recommended)
Add **Dev Mode annotations snapshot v2** while keeping v1:

#### 2.1 Export
- Export `node.annotations` for selected targets (component set, component variants, or selected frames).
- Capture:
  - `targetId`, `targetName`, `targetType`
  - annotations array: `labelMarkdown` (preferred), fallback `label`
  - `categoryId` + **category metadata** (label + color) to make snapshots portable
  - pinned properties (if used)

#### 2.2 Apply
- Resolve target node by `targetId` (strict) with optional fallback by name (warning-only).
- Ensure categories exist (create or update label/color as needed).
- Replace annotations in “replace” mode (keep an optional “merge” mode later).

#### 2.3 Keep `__annotations` as a compatibility surface
- Continue to support v1 snapshots for deterministic text-based annotations.
- Optional: add a “mirror” option:
  - Dev Mode → `__annotations` (for scraping-friendly local inspection)
  - `__annotations` → Dev Mode (for designers)

### Acceptance criteria
- You can round-trip annotations:
  1) add/edit Dev Mode annotation in Figma
  2) export deterministic JSON
  3) apply to another file (or branch) and get the same annotation content/categories

### Risks / constraints
- Category IDs may differ between files; treat “category label + color” as the portable identity.
- Some annotation fields may evolve; keep schema versioned.

---

## 3) Close known drift: icon library + stroke governance

### Goal
Ensure code matches the documented iconography rules (Tabler icons, default 1px stroke, and the stroke ladder tokens).

### Deliverables
- Replace `lucide-react` usage with Tabler (or confirm the intended library and update docs/contracts accordingly).
- Ensure the icon stroke width defaults to `stroke/thin` (1) unless intentionally overridden.

### Verification surface: `Icon.contract.json`

The goal is to stop “icon drift” from being subjective. We treat the exported Icon contract as the **deterministic proof** of Icon structure + bindings.

Repeatable steps:

1. In Figma, **select** the `Icon` component set.
2. Run the Soloist OS plugin → **Export** tab.
3. Under **Primitive contract: Icon**, click **EXPORT ICON CONTRACT**.
4. Save the JSON to: `design/contracts/primitives/Icon.contract.json`.
5. Commit it and review the `issues[]` field in PR.

What the contract should prove (V1):

- Variant props: `size={sm,md,lg}` and `tone={primary,secondary,muted}`
- Dimensions: 16/20/24 square
- Stroke weights are only from the ladder: 0.5 / 1 / 1.5 / 2
- No `color/tool/*` usage (tool identity stays on button surfaces)
- Glyph selection is via Instance Swap property named `name` (avoids variant explosion)

### Acceptance criteria
- Docs + code agree on icon library and default stroke behavior.

Contract-specific acceptance criteria:

- Exporting `Icon.contract.json` produces **0 errors**.
- Any warnings are intentional and documented (or fixed in Figma before moving on).

### Notes
This is intentionally separated: it can be done independently and prevents long-term “quiet drift.”

---

## 4) Code Connect adoption: make Dev Mode code snippets real

### Goal
Turn Dev Mode into a trustworthy bridge from design to code by publishing Code Connect mappings.

### Deliverables
1. Decide the first mapped target: **Button** (aligned with Phase 1).
2. Add Code Connect mapping files in the codebase (keep them small and hand-authored).
3. Publish mappings so Dev Mode can show the snippet.
4. Add “instructions for MCP” (per component) to improve agent output quality.

### Acceptance criteria
- In Dev Mode, selecting the Button component shows a working, up-to-date code snippet.
- The snippet is consistent with the Button contract.

### Risks
- Avoid generating Code Connect mappings in loops; keep mappings explicit and stable.
- Treat Code Connect files as “string templates” (not executed code).

---

## 5) MCP: standardize agent access to design context (local + remote)

### Goal
Make a predictable, repeatable agent workflow when asking “implement this design” or “sync this contract”.

### Deliverables
- A repo-stored “MCP rules” doc (or snippet) that instructs the agent to:
  1) fetch design context
  2) fetch variable defs for referenced tokens
  3) fetch Code Connect map when present
  4) prefer contracts under `design/contracts/**` as ground truth
- Enable Code Connect in MCP settings where applicable.

### Acceptance criteria
- A standard prompt produces deterministic, contract-aligned code suggestions.

---

## 6) Dev Resources: link design nodes to repo facts

### Goal
Reduce “where is this implemented?” friction by attaching dev resources to components:

- contract JSON path
- Storybook story (if/when adopted for primitives)
- source file path(s)
- related docs

### Deliverables
- Define a small set of canonical dev resource link types (label + URL pattern).
- Add dev resources to Button node(s) first.
- Optional automation: a script that syncs dev resources from repo → Figma (guarded, non-destructive).

### Acceptance criteria
- In Dev Mode, selecting Button shows the correct repo links.

---

## 7) CI / automation: keep drift from creeping in

### Goal
Catch drift before it lands.

### Deliverables
- Add a CI step (or local habit) that runs:
  - `npm run preflight`
  - `npm run build`
- Optional: a lightweight contract schema validator for `design/contracts/**/*.json`.

### Acceptance criteria
- PRs that violate invariants fail quickly and clearly.

---

## Recommended execution order (minimal thrash)

1) **Phase 1 (Button thin slice)** — establishes the “contracts-first” muscle.
2) **Phase 3 (icon drift)** — keeps system consistency.
3) **Phase 2 (Dev Mode annotations v2)** — unlocks agent-readable/writable intent where designers already work.
4) **Phase 4 (Code Connect)** — improves Dev Mode + MCP code outputs.
5) **Phase 6 (Dev resources)** — improves navigation + traceability.
6) **Phase 7 (CI)** — locks it in.

---

## Definition of Done (DoD) checklist

A workflow improvement is “done” when:

- It produces an exported artifact under `design/contracts/**` (when relevant).
- It’s non-destructive by default.
- It doesn’t violate invariants (preflight stays green).
- It’s documented in the appropriate place:
  - product/UI rules → `docs/DESIGN_SYSTEM.md`
  - Figma build + scrape rules → `docs/admin/DESIGN_SYSTEM_STARTER_KIT.md`
  - execution steps + gotchas → `docs/DEVELOPMENT.md` / `docs/HANDOFF.md`
