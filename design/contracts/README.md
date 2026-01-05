# Design Contracts (drift-killer artifacts)

These files are the **mechanical bridge** between Figma and code.

Instead of treating mockups as screenshots or vibes, we export **structured facts** from selected Figma nodes and store them here.

## What belongs here

- `primitives/*.contract.json`
  - Example: `design/contracts/primitives/Button.contract.json`
  - Contains: component name, variant property schema, variant values, token bindings (variables), styles used (text/effect), and structural hints (auto-layout / constraints).

- `shell/*.contract.json`
  - Example: `design/contracts/shell/ShellDefault.contract.json`
  - Contains: canonical shell layout structure + bindings.

- `tokens/*.tokens.json`
  - Example: `design/contracts/tokens/color.tokens.json`
  - Contains: exported variables snapshot(s) reduced to a scrape-friendly token map.

## Live co-design loop (the drift-killer)

1. Design/update a node in Figma (`01_PRIMITIVES`, `02_COMPONENTS`, or `03_SHELL`).
2. Select the node.
3. Export a contract JSON.
4. Commit contract JSON.
5. Update code to match the contract.
6. Validate drift (Figma ↔ contract ↔ code).

## Notes

- These artifacts are intentionally small and reviewable.
- Contracts should be stable across time; when a contract changes, it should reflect an intentional design evolution.
