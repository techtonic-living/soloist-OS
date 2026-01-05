# Mockup Annotation Guide (High Leverage, Low Clutter)

This guide answers: **what’s worth documenting while you mock up**, and what is just wheel-spinning.

The goal is to keep the UI feeling like *yours*: the repo should capture **your decisions** as **contracts** (things that can be validated), not as endless commentary.

## The core rule: encode > annotate

If something can be expressed as any of the following, **do that instead of writing notes**:

- **Variables (tokens)** — colors/spacing/radius/type/shadows
- **Component properties** — `variant`, `size`, `state`, etc.
- **Auto Layout / constraints** — layout intent, resizing behavior
- **Naming** — consistent component/page names that are scrapeable

Write text annotations only for things that **cannot** be captured mechanically.

## What’s actually “high leverage” to document

These are the areas where small clarity saves large rework.

### 1) Invariants (what must never drift)
Write 5–15 bullet points total. This is the “nails on chalkboard” section: what you *refuse* to compromise.

Examples:
- Disabled UI should **not** use `cursor-not-allowed` (only opacity + no hover affordance).
- No hardcoded hex colors in components; everything routes through semantic tokens.
- Actions in group headers are **always visible** (no hover-only discoverability traps).

Where to put it:
- `docs/admin/DESIGN_INTENT.md` → “North Star” + “Acceptance Criteria”

### 2) State + behavior (anything interactive)
Static visuals are cheap; behavior is expensive.

Document (or encode) these:
- **State model**: `default`, `hover`, `pressed`, `focus`, `disabled`, `invalid`, etc.
- **Keyboard**: Enter/Escape behavior for inline edits, focus order expectations
- **Async affordances**: e.g., “favorite heart has a pending animation while metadata loads”
- **Mode gating**: e.g., drop zones only appear in Organize/Edit mode

Prefer to encode in:
- Component set properties (`state`, `variant`, etc.)

Write notes when needed:
- Only when a behavior can’t be represented via variants alone (timing rules, async, persistence).

### 3) Content semantics (words are part of the design)
If copy matters, **it needs a contract**, otherwise it gets “helpfully rewritten” by accident.

High-leverage to specify:
- Title casing rules (“Tooltips: Title Case, no punctuation”)
- Error message style (“Sentence case with punctuation”)
- Empty state copy (short, consistent patterns)

This prevents subtle drift that makes the product feel generic.

### 4) Layout intent (how it resizes)
Most drift happens when resizing rules aren’t explicit.

Encode:
- Shell regions (header/rail/main/panel/footer) using constraints and Auto Layout
- Scroll rules (what scrolls, what stays pinned)
- Minimum sizes for rails/panels (even as a note if Figma can’t encode it cleanly)

## What is *usually* wasted effort

### Pixel-perfect micromanagement
- Exact x/y coordinates for everything
- “This is 12px from that” annotations everywhere

Use tokens + Auto Layout rhythm instead. Let the system do the work.

### Redundant documentation
- Re-stating what the component already encodes
- Copy-pasting the same rules into 4 different docs

If it’s already encoded (tokens/props), avoid describing it again.

### Raw values instead of semantic roles
- Hex values in callouts
- “Use #111111 here”

Prefer: `color/bg/void` (semantic) and let the token definition own the actual value.

### Premature completeness
Don’t spec every edge case before you have the first real shell.

A good rule: **one canonical shell + the 6 primitives is enough to start**:
- `Button`, `IconButton`, `Card`, `Input`, `Slider`, `Tabs`
- `Shell / Default`

## A decision test when you’re tempted to add a note

Add documentation only if the answer is **yes** to at least one:

1) Would two competent builders implement this differently without guidance?
2) Would the wrong interpretation materially damage the brand/feel?
3) Can we validate this later (acceptance criteria), or is it hand-wavy?
4) Can this be encoded as a token/property instead of prose?

If the answer is “no” across the board, skip it.

## The “minimum effective” package for a mockup handoff (to future-you + agents)

When you have a first mockup, the handoff that creates *leverage* (not clutter) is:

1) **Figma**
- Variables exist (at least the minimal set)
- `01_PRIMITIVES` contains the primitives as component sets with properties
- `03_SHELL` contains `Shell / Default` built using those components

2) **Repo**
- `docs/admin/DESIGN_INTENT.md` filled with:
  - North Star bullets (invariants)
  - Canonical layout description (behavior + resizing)
  - MVP flows list
  - Acceptance criteria
  - Figma URL + node IDs

That’s it. Anything beyond that should earn its keep.
