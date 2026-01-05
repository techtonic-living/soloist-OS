# Soloist OS — Design Intent (Authoritative)

This document captures the **current planned design** for Soloist OS.
It exists to prevent drift: implementation must follow this intent.

> Status: **Fill this out before further foundational UI work.**

## Related docs

- Design system rules: `docs/DESIGN_SYSTEM.md`
- Design system starter kit (how to build the mockup for scraping): `docs/admin/DESIGN_SYSTEM_STARTER_KIT.md`
- Scrape playbook (how we extract components/tokens): `docs/admin/FIGMA_SCRAPE_PLAYBOOK.md`
- What to annotate (and what to skip) while mocking up: `docs/admin/MOCKUP_ANNOTATION_GUIDE.md`
- Roadmap + workflow (includes the drift-killer co-design loop): `docs/ROADMAP.md`

## 1) North Star

- What must the UI feel like?
- What must it never become?

## 2) Canonical Layout

Describe the layout in terms of regions and behavior (not just pixels):

- Primary navigation: where, how it expands/collapses
- Main work surface: scrolling rules
- Inspector/assistant: where, how it docks
- Footer/task/status: what it is for

### Interaction rules

- Keyboard affordances
- Hover/active patterns
- What is always visible vs. hover-only

## 3) Visual Language

Reference `docs/DESIGN_SYSTEM.md` for tokens/rules and add anything missing here.

## 4) Screens / Flows (MVP)

List the core screens and the minimal interactions they require.

## 5) Figma Source of Truth

Provide links/identifiers so this can be mechanically validated:

- Figma file URL
- Key frames/pages that define the shell
- Node IDs for the layout components

## 6) Acceptance Criteria

- What observable properties must match the planned design?
- What is explicitly out of scope?
