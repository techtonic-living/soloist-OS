import { V2Shell } from "./layout/V2Shell";

/**
 * V2 foundation app.
 *
 * Intentionally isolated from the legacy UI to avoid collateral damage.
 * Opt-in via `?v2` in the URL (wired in `src/main.tsx`).
 */
export function V2App() {
	return <V2Shell />;
}
