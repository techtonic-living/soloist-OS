# Soloist OS — Figma Scrape Playbook

This playbook ensures the mockup can be scraped into code with low ambiguity.

## 1) What “scrapeable” means here

A design is scrapeable when:

- Components are named consistently.
- Variants are expressed as component properties.
- Tokens are variables, not hardcoded values.
- Layout intent is represented by autolayout + constraints.

## 2) Naming conventions (strict)

### Pages
- `00_TOKENS`, `01_PRIMITIVES`, `02_COMPONENTS`, `03_SHELL`

### Components
- `Button`
- `IconButton`
- `Card`
- `Input`
- `Slider`
- `Tabs`

### Component Sets
Use Figma component sets for variant props.
Example:
- `Button` (component set)
  - `variant=glass, size=md, state=default, iconLeft=false, iconRight=false`

### Styles (Text + Effect)

To keep scraping deterministic, treat style names like tokens:

- Use **lowercase group prefixes** for *all* styles (consistent with `shadow/*`).
- Use `/` as the only grouping separator.
- Avoid spaces.

Examples:

- Effect styles:
  - `shadow/monolith`
  - `shadow/monolith-hover`
  - `shadow/neon-glow`

- Text styles (mechanically sortable):
  - `ui/01` … `ui/12`
  - `mono/01` … `mono/12`
  - `brand/01` … `brand/06`
  - `display/01` … `display/06`

If you already created TitleCase groups (e.g. `UI/01`), rename them to lowercase early to avoid drift.

## 3) Property schema (do not improvise)

Allowed property names:
- `variant`
- `size`
- `state`
- `density`
- `elevation`
- `iconLeft`
- `iconRight`

Allowed state values:
- `default`, `hover`, `pressed`, `active`, `focus`, `disabled`, `invalid`

## 4) Layout extraction rules

- Use Auto Layout for:
  - toolbars
  - headers
  - list rows
  - button clusters

- Use constraints for:
  - shell regions (header/rail/main/panel/footer)

- Avoid absolute positioning unless it’s purely decorative.

## 5) Token linkage rules

- All colors must reference variables from `Soloist / Color`.
- Spacing and radii should reference variables when possible.
- Shadows may be effect styles but must use token-like naming.

## 5.5) Icon provenance (policy)

If you paste/trace icon vectors from third-party sources (e.g. Tabler), store provenance in the **Figma component description** for the icon glyph:

- Source URL
- Library (+ version if known)
- License name + URL
- Modification notes

If you want this provenance to be machine-readable for agents/tools, mirror it in `design/contracts/icons/icon-provenance.json`.

## 6) Handoff package checklist

When you share the Figma file, include:

- File URL
- Node ID: `Shell / Default`
- Confirmation that components live on `01_PRIMITIVES`/`02_COMPONENTS`
- Confirmation variables exist (at least the minimum set)

## 7) What we do after you share the file

- Generate a component inventory (names, props, variants)
- Generate token map (variable names → code tokens)
- Produce a “component contract” JSON that both humans and agents can follow

## 8) Drift prevention (the live co-design loop)

We prevent drift by exporting **contracts** from selected nodes and storing them in-repo.

Recommended artifact paths:

- `design/contracts/primitives/Button.contract.json`
- `design/contracts/shell/ShellDefault.contract.json`
- `design/contracts/tokens/color.tokens.json`

Rule:
- If a primitive changes in Figma, we update the contract, then update code to match.
- If a primitive changes in code, we update Figma + contract to match.
