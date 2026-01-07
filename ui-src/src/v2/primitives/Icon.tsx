import type { ComponentType } from "react";
import {
	IconAffiliate,
	IconBook,
	IconBrandSafari,
	IconChevronRight,
	IconCircleChevronRight,
	IconCircleChevronsRight,
	IconDeviceDesktopAnalytics,
	IconHome,
	IconMinus,
	IconMinusVertical,
	IconSettings2,
	IconSlash,
	IconWritingSign,
	type IconProps as TablerIconProps,
} from "@tabler/icons-react";

/**
 * Icon primitive — 9 variants (sm/md/lg × primary/secondary/muted)
 *
 * CONTRACT: design/contracts/primitives/Icon.contract.json
 * GLYPHS: design/contracts/primitives/Icon.glyphs.json
 * SCHEMA: soloist-os.primitives.icon.contract.v1
 * GLYPH COUNT: 13
 * GLYPH LIBRARY: node-id=2002-217 (IconGlyph/* frame with glyph containers)
 * LAST EXPORT: 2026-01-07T20:31:22.310Z
 * STROKE WEIGHTS: IconGlyph/{name} frames contain stroke variant components (hairline/thin/medium/bold)
 *
 * FIGMA STRUCTURE: IconGlyph/{name} (FRAME) → stroke=thin/hairline/medium/bold (COMPONENTs)
 *
 * SIZES: 16×16 (sm), 20×20 (md), 24×24 (lg)
 * STROKE: stroke/thin (1px) used in code for all glyphs
 * TONE: color/text/{tone} (primary/secondary/muted)
 * GOVERNANCE: Icons are tone-based, never tool colors
 *
 * NOTE: Each IconGlyph frame in Figma contains multiple stroke weight components.
 * Current implementation uses stroke/thin (1px) for all. Multi-stroke support would
 * require adding a stroke prop and icon-specific stroke weight selection logic.
 *
 * 🔄 AUTO-GENERATED from Icon.glyphs.json
 * Do not edit manually. Run: npm run generate:icons
 */

export type IconSize = "sm" | "md" | "lg";
export type IconTone = "primary" | "secondary" | "muted";

export type IconName =
	| "IconGlyph/affiliate"
	| "IconGlyph/book"
	| "IconGlyph/brand-safari"
	| "IconGlyph/chevron-right"
	| "IconGlyph/circle-chevron-right"
	| "IconGlyph/circle-chevrons-right"
	| "IconGlyph/device-desktop-analytics"
	| "IconGlyph/home"
	| "IconGlyph/minus"
	| "IconGlyph/minus-vertical"
	| "IconGlyph/settings-2"
	| "IconGlyph/slash"
	| "IconGlyph/writing-sign";

const ICONS: Record<IconName, ComponentType<TablerIconProps>> = {
	"IconGlyph/affiliate": IconAffiliate,
	"IconGlyph/book": IconBook,
	"IconGlyph/brand-safari": IconBrandSafari,
	"IconGlyph/chevron-right": IconChevronRight,
	"IconGlyph/circle-chevron-right": IconCircleChevronRight,
	"IconGlyph/circle-chevrons-right": IconCircleChevronsRight,
	"IconGlyph/device-desktop-analytics": IconDeviceDesktopAnalytics,
	"IconGlyph/home": IconHome,
	"IconGlyph/minus": IconMinus,
	"IconGlyph/minus-vertical": IconMinusVertical,
	"IconGlyph/settings-2": IconSettings2,
	"IconGlyph/slash": IconSlash,
	"IconGlyph/writing-sign": IconWritingSign,
};

// Contract-defined sizes: 16×16 (sm), 20×20 (md), 24×24 (lg)
const SIZE_MAP: Record<IconSize, number> = {
	sm: 16,
	md: 20,
	lg: 24,
};

// Contract-defined tones: color/text/{tone}
const TONE_MAP: Record<IconTone, string> = {
	primary: "text-white", // color/text/primary
	secondary: "text-gray-400", // color/text/secondary
	muted: "text-gray-500", // color/text/muted
};

export type IconProps = {
	name: IconName;
	size?: IconSize;
	tone?: IconTone;
	className?: string;
	/** For non-decorative icons only. Prefer leaving this undefined in buttons and labeling the button itself. */
	ariaLabel?: string;
	/** Optional tooltip/title text for the SVG */
	title?: string;
};

export function Icon({
	name,
	size = "md",
	tone = "primary",
	className = "",
	ariaLabel,
	title,
}: Readonly<IconProps>) {
	const Svg = ICONS[name];
	const isDecorative = !ariaLabel;
	const sizePixels = SIZE_MAP[size];
	const toneClass = TONE_MAP[tone];

	return (
		<Svg
			size={sizePixels}
			stroke={1} // stroke/thin = 1px (contract-defined)
			className={`${toneClass} ${className}`}
			focusable={false}
			role={isDecorative ? undefined : "img"}
			aria-hidden={isDecorative ? true : undefined}
			aria-label={isDecorative ? undefined : ariaLabel}
			title={title}
		/>
	);
}
