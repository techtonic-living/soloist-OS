# Soloist OS — Design System Starter Kit (for Figma-first build)

This starter kit is designed for your workflow:

1) You build the mockup with the design system **baked in** (variables + components).
2) We scrape/translate that mockup into a reusable component library (code) with minimal interpretation.

It intentionally prioritizes **mechanical extractability** over “cleverness”.

---

## 0) Ground rules (non-negotiables)

- **Token-first**: No hardcoded colors in components. Components consume variables.
- **Semantic > raw**: Prefer semantic color roles (bg/surface/stroke/accent) over numeric shades.
- **Variants are explicit**: `variant`, `state`, `size` are component properties (no hidden rules).
- **Accessible by default**: All interactive elements have labeled hit targets and text contrast intent.

---

## 1) Figma file structure (pages)

Create these pages (names matter):

- `00_TOKENS` — all Variables and style references
- `01_PRIMITIVES` — Button, IconButton, Input, Slider, Card, Tabs
- `02_COMPONENTS` — composed UI blocks (tool header, library header, inspector card)
- `03_SHELL` — the app shell frames (header/rail/main/panel/footer)
- `99_SANDBOX` — experiments (not scraped)

Scraping rule: we only scrape from `01_PRIMITIVES`, `02_COMPONENTS`, `03_SHELL`.

---

## 2) Variable naming scheme (matches Soloist’s “semantic Tailwind tokens”)

Use these variable collections:

### Collection: `Soloist / Color`

Modes:
- `Default`

Variable names (minimum viable set):

#### Backgrounds
- `color/bg/void`
- `color/bg/surface`
- `color/bg/raised`

#### Glass (overlays & strokes)
- `color/glass/subtle`
- `color/glass/stroke`
- `color/glass/highlight`

#### Accents
- `color/primary`
- `color/accent/cyan`
- `color/accent/sky`
- `color/accent/blue`
- `color/accent/indigo`
- `color/accent/violet`
- `color/accent/magenta`
- `color/accent/error`
- `color/accent/success`

#### Tool accents (optional, recommended for app nav)
- `color/tool/explore`
- `color/tool/define`
- `color/tool/structure`
- `color/tool/document`
- `color/tool/learn`
- `color/tool/record`

Recommended rule (what we use in the `Soloist OS` file):

- Tool colors are **aliases** to accent tokens (no duplicated hex values).
- Mapping:
	- `color/tool/explore` → `color/accent/cyan`
	- `color/tool/define` → `color/accent/sky`
	- `color/tool/structure` → `color/accent/blue`
	- `color/tool/document` → `color/accent/indigo`
	- `color/tool/learn` → `color/accent/violet`
	- `color/tool/record` → `color/accent/magenta`

#### Text
- `color/text/primary`
- `color/text/secondary`
- `color/text/muted`

> These map 1:1 with the existing semantic Tailwind tokens in `ui-src/tailwind.config.js`.

### Suggested uses for `Soloist / Color` variables

Think of these as **roles**, not “a palette”. If a layer’s job changes, change the *role* token—not the hex.

#### Background roles
- `color/bg/void`
	- Suggested use: app chrome behind everything (shell, page backgrounds, empty “void” areas).
	- Avoid: using for cards/buttons; it should feel like the deepest layer.
- `color/bg/surface`
	- Suggested use: default container surfaces (panels, cards, sheets).
	- Great for: most primitives’ backgrounds when *not* using glass.
- `color/bg/raised`
	- Suggested use: elevated containers (modals, popovers, floating inspector panels).
	- Rule of thumb: use when you need a distinct separation from `bg/surface` without adding borders everywhere.

#### Glass roles (overlays & strokes)
- `color/glass/subtle`
	- Suggested use: translucent fills (glass buttons, glass cards, overlay containers).
	- Use on: container fill rectangles.
- `color/glass/stroke`
	- Suggested use: borders/dividers for glass and raised surfaces.
	- Use on: 1px strokes, separators, outlines.
- `color/glass/highlight`
	- Suggested use: top-edge highlights and inner strokes (the “specular” part of glass).
	- Use sparingly: highlight should be an accent of depth, not a second border.

#### Accent roles
- `color/primary`
	- Suggested use: primary brand accent when you need exactly one “main” accent.
	- Keep rare: if everything is primary, nothing is.
- `color/accent/cyan` / `color/accent/violet`
	- Suggested use: interactive emphasis (focus rings, active tabs, sliders, selected states).
	- Great for: focus outline, active indicator bars, subtle glows.
- `color/accent/error` / `color/accent/success`
	- Suggested use: validation and system feedback states.
	- Rule: don’t use status colors as decoration—only for meaning.

#### Text roles
- `color/text/primary`
	- Suggested use: default readable text on `bg/*` and glass surfaces (titles, body copy).
- `color/text/secondary`
	- Suggested use: labels, helper text, captions, less prominent UI copy.
- `color/text/muted`
	- Suggested use: placeholders, disabled labels, subtle metadata.
	- Avoid: long-form body copy.

Practical component guidance:
- Buttons (glass): fill = `color/glass/subtle`, stroke = `color/glass/stroke`, label = `color/text/primary`, focus ring = `color/accent/cyan`.
- Cards: background = `color/bg/surface`, border = `color/glass/stroke`, title = `color/text/primary`, meta = `color/text/secondary`.
- Dividers: use `color/glass/stroke` (not a hardcoded gray).

### Collection: `Soloist / Spacing`
- `space/1` (4)
- `space/2` (8)
- `space/3` (12)
- `space/4` (16)
- `space/5` (20)
- `space/6` (24)

### Collection: `Soloist / Radius`
- `radius/sm` (8)
- `radius/md` (12)
- `radius/lg` (16)
- `radius/pill` (999)

### Collection: `Soloist / Stroke`

Use this for **icon stroke widths** and other ultra-thin linework. Keeping stroke widths tokenized helps avoid “almost the same” drift across components.

- `stroke/hairline` (0.5)
- `stroke/thin` (1)
- `stroke/medium` (1.5)
- `stroke/bold` (2)

### Collection: `Soloist / Typography`

**Important:** In this system, **Variables store font family only**. Font sizes/line-heights live in **Text Styles** (see below). This avoids “two sources of truth” and keeps scraping deterministic.

- `font/brand` (Hubballi)
	- Suggested use: top-level feature headings, “SYSTEM” / module headers, hero labels, brand accents.
	- Keep usage intentional (brand moments), not for dense body copy.
- `font/ui` (Inter)
	- Suggested use: all UI copy: buttons, labels, inputs, menus, body text, tooltips.
	- Default choice for anything that needs maximum readability.
- `font/display` (Acier BAT)
	- Suggested use: big display moments: splash/hero, empty-state headlines, primary “title cards”.
	- Avoid for small sizes; reserve for impact.
- `font/mono` (JetBrains Mono)
	- Suggested use: token names, code blocks, IDs, measurements, debug readouts, “terminal” surfaces.
	- Use wherever alignment and scanability matter.

### Typography sizing: use Text Styles (recommended)

Do **not** add font sizes to Variables right now. Instead, create Text Styles with strict naming so scraping can map them 1:1.

Recommended style naming (mechanically sortable):

- ui / Inter (12 sizes):
	- `ui/01` … `ui/12`
- mono / JetBrains Mono (12 sizes):
	- `mono/01` … `mono/12`
- brand / Hubballi (6 sizes):
	- `brand/01` … `brand/06`
- display / Acier BAT (6 sizes):
	- `display/01` … `display/06`

Style case rule:
- All style group prefixes are **lowercase** (e.g. `shadow/*`, `ui/*`, `mono/*`). This keeps style names token-like and avoids case-based drift.

Suggested default size ladders (edit to taste, but keep counts):

- 12-size ladder (UI + Mono): $10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 28, 32$ px
- 6-size ladder (Brand + Display): $20, 24, 32, 40, 48, 64$ px

Line-height guidance:

- UI/Memo small sizes: $1.25$–$1.4$ (depending on density)
- Display sizes: $1.05$–$1.2$ (tighter, but never cramped)

Scrape rule of thumb:

- Primitives should always use a named style (no ad-hoc font sizes), so “what you see” is what we can reliably extract.

### Collection: `Soloist / Shadow`
Use effect styles if you prefer, but name them like tokens:
- `shadow/monolith`
- `shadow/monolith-hover`
- `shadow/neon-glow`

---

## 2.5) Plugin seeding: what “Overwrite existing values” actually does

The **Seed Starter Kit** action is intentionally **non-destructive**. It is *not* a “wipe the slate clean / reset the whole library” operation.

When **Overwrite existing values** is **OFF**:
- The plugin creates any missing **starter-kit collections** and **starter-kit variables**.
- It will only set a variable’s value if the variable is currently **missing a value for the collection’s default mode**.
- Existing values (for variables that already have a default-mode value) are left as-is.

When **Overwrite existing values** is **ON**:
- The plugin will set (overwrite) the **default-mode value** for the starter-kit variables **that exist at the expected destination**:
	- Same **collection name** (e.g. `Soloist / Color`)
	- Same **variable name** (e.g. `color/bg/surface`)
- It does **not** delete other variables, rename your custom variables, or remove extra collections.

Important nuances:
- This overwrite is **scoped to the starter kit spec only**. Variables outside the starter-kit collections/names are not touched.
- If you already have a similarly-named variable in a *different* collection (or a different naming scheme), the seed will **create the starter-kit variable in the starter-kit collection** rather than trying to “merge” libraries.
- The seed does **not** remove extra modes; it may rename the collection’s **default mode** to `Default`, but it won’t delete other modes.
- **Effect styles** (`shadow/*`) are treated as a contract: if they exist, their *effects are overwritten* to match the kit (this is currently independent of the overwrite toggle).

Note on Figma’s Variables table “overwrite” checkbox (spreadsheet-style paste):
- In the native Variables UI, matching is effectively **name-based within the currently open collection** (because you’re editing one collection at a time).
- Our plugin’s seed overwrite is conceptually similar (update existing rows when allowed), but it is explicitly scoped to **(collection name + variable name)** because the plugin is operating across multiple collections in one action.

---

## 3) Primitive components (the scrape targets)

All primitives must be **components** (not frames), with **component properties**.

### 3.0 Property intent (so designers don’t guess)

These properties are not decorative—they’re the contract we scrape into code.

- `variant` (visual treatment)
	- Use when the same component must appear in different contexts (surface vs overlay vs minimal).
	- Avoid inventing one-off variants; prefer evolving the existing ones.
- `size` (spacing + typography scale)
	- Use to express density and hierarchy (toolbar vs form vs hero).
	- Size should drive padding, icon size, and text style choice.
- `state` (interaction + validation)
	- Use for interactive states (hover/pressed/focus/disabled/invalid).
	- State should be representable without “magic” layer tweaks.

Suggested usage defaults:

- `variant=glass` is the default “Soloist” look for interactive surfaces.
- `variant=ghost` is for minimal, low-emphasis actions.
- `variant=solid` is reserved for rare moments of emphasis (use sparingly).
- `size=md` should be the default.

### 3.1 Button
Component name:
- `Button`

Properties:
- `variant`: `glass | ghost | solid` (start with `glass` + `ghost`)
- `size`: `sm | md | lg`
- `state`: `default | hover | pressed | disabled`
- `iconLeft`: `true | false`
- `iconRight`: `true | false`

Rules:
- Disabled state: **opacity change**, not cursor change.
- Uses `color/glass/*` for container and `color/text/*` for label.

### 3.2 IconButton
Component name:
- `IconButton`

Properties:
- `variant`: `ghost | glass`
- `size`: `sm | md | lg`
- `state`: `default | hover | pressed | disabled`

Rules:
- Hit target: min 44×44 in final shell (can be visually smaller).

### 3.4 Card
Component name:
- `Card`

Properties:
- `elevation`: `surface | raised`
- `state`: `default | hover | active`

Rules:
- Border uses `color/glass/stroke`.
- Shadow uses `shadow/monolith`.

### 3.5 Input
Component name:
- `Input`

Properties:
- `size`: `sm | md | lg`
- `state`: `default | focus | invalid | disabled`

Rules:
- Focus ring should reference `color/accent/cyan`.

### 3.6 Slider
Component name:
- `Slider`

Properties:
- `size`: `sm | md`
- `state`: `default | hover | active | disabled`

Rule:
- Thumb glow references `color/accent/cyan`.


### 3.2 Icon (Tabler-backed)

Component name:
- `Icon`

Properties:
- `name`: (component set variant)
	- Use kebab-case, Tabler-like names (e.g. `home`, `compass`, `chevron-right`).
	- Rule: **name selects glyph only** (never implies color).
- `size`: `sm | md | lg`
	- Suggested mapping: `sm=16`, `md=20`, `lg=24` px.
- `tone`: `primary | secondary | muted`
	- `primary` → `color/text/primary`
	- `secondary` → `color/text/secondary`
	- `muted` → `color/text/muted`

Rules:
- Icon vectors should be stroke-based and use the `Soloist / Stroke` variables for stroke width once those exist.
- **Do not** create “tool-colored icon variants” inside `Icon`.

Tool color rule (Option A):
- Tool identity belongs to the **button**, not the icon.
- If an icon needs a tool color (e.g. Explore cyan), the **ToolButton** variant applies `color/tool/{tool}` to the *Icon instance* stroke/fill in that component.

### 3.3 IconButton
### 3.7 Tabs
Component name:
- `Tabs`

Properties:
- `density`: `compact | cozy`
- `state`: `default | active`

---

## 4) Composition components (reused blocks)

Once primitives exist, build these on `02_COMPONENTS`:

- `ToolHeader` (title, breadcrumb, density controls)
- `LibraryHeader` (tabs + actions)
- `InspectorCard` (stripe card layout)
- `EmptyState` (mode-gated drop zone style)

---

## 5) Shell frames (what we validate against)

Create one canonical shell frame in `03_SHELL` with the full layout.
Name it:

- `Shell / Default`

The shell should be built using only primitives + composition components.

---

## 6) What you give me when it’s ready

When you’re ready to scrape reliably, provide:

- Figma file URL
- The node ID for `Shell / Default`
- The page names must match this doc

Then I can map:
- Variables → code tokens
- Components → React primitives
- Shell frame → layout scaffold
