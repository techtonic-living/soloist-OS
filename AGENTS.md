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

**Current Primitives status:**
- Icon: ✅
- Button: ✅
- TextField: ✅
- Switch: ✅
- Slider: ✅

**Next slice:**
- Modal / Dialog loop initialized.

## DesignAssistant Workflow (Important)

When starting a new primitive component:

1. **Send instructions to Figma** (don't copy/paste manually):
   - Open plugin UI → Connect tab
   - Find "Write instructions: designAssistant" section
   - Click the component button (e.g., "TextField Instructions")
   - Instructions automatically written to node 2002:712

2. **Current components with instructions:**
   - Button: `BUTTON_BUILD_NOTES_V1` in `plugin/code.tsx`
   - TextField: `TEXTFIELD_BUILD_NOTES_V1` in `plugin/code.tsx`

3. **To add new component instructions:**
   - Add `{COMPONENT}_BUILD_NOTES_V1` constant to `plugin/code.tsx`
   - Add `write{Component}NotesIntoTextNode()` function
   - Add `handleApply{Component}BuildNotesToNode()` handler
   - Add message type to `PluginMessage` union
   - Add case to `onUiMessage` switch
   - Add button to ConnectView UI
   - Rebuild plugin + UI

4. **To add new component CONTRACT EXPORT (critical - complete checklist):**

   **A. Plugin backend (`plugin/code.tsx`):**
   - Add `{Component}ContractIssueV1` type (copy from Button/TextField)
   - Add `{Component}ContractV1` type with proper schemaVersion
   - Add `coerceSelected{Component}Target()` function
   - Add `build{Component}ContractV1()` function with:
     - Component-specific property validation (e.g., value, placeholder for TextField)
     - Variant property validation (state, size, etc.)
     - Inline variable/style detection (copy from Button - uses walk() function)
     - DO NOT call non-existent helper functions
   - Add `handleExport{Component}Contract()` handler
   - Add `export-{component}-contract` to `PluginMessage` union type
   - Add case to `onUiMessage` switch statement

   **B. UI frontend (`ui-src/src/components/ConnectView.tsx`):**
   - Add export button in Connect tab export section
   - Add `{component}-contract-ready` message handler in useEffect
   - Add `{component}-contract-error` message handler
   - Use `downloadJson()` with proper filename pattern
   - Rebuild UI

   **C. Common mistakes to avoid:**
   - ❌ Forgetting UI message handlers → export works but file doesn't download
   - ❌ Calling non-existent helper functions → runtime error
   - ❌ Forgetting UI button → no way to trigger export
   - ❌ Copy/paste validation without updating component-specific properties

5. **Future optimization:**
   - Move to `design/contracts/templates/*.md` files
   - Plugin reads at runtime (no rebuild)
   - Just create/update markdown files

## If you think context was reset

Assume you are missing critical constraints.
Rehydrate by re-reading the docs/contracts above before proceeding.
