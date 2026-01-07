#!/usr/bin/env node
/**
 * Generate Icon.tsx from Icon.glyphs.json
 *
 * This script reads design/contracts/primitives/Icon.glyphs.json (exported from Figma)
 * and generates ui-src/src/v2/primitives/Icon.tsx with the correct icon mappings.
 *
 * Usage: npm run generate:icons
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GLYPHS_PATH = path.resolve(
	__dirname,
	"../design/contracts/primitives/Icon.glyphs.json"
);
const ICON_COMPONENT_PATH = path.resolve(
	__dirname,
	"../ui-src/src/v2/primitives/Icon.tsx"
);

// Mapping: Figma component name → Tabler icon import name
// This needs to be maintained manually when new icons are added
const FIGMA_TO_TABLER = {
	"IconGlyph/home": "IconHome",
	"IconGlyph/brand-safari": "IconBrandSafari",
	"IconGlyph/settings-2": "IconSettings2",
	"IconGlyph/affiliate": "IconAffiliate",
	"IconGlyph/device-desktop-analytics": "IconDeviceDesktopAnalytics",
	"IconGlyph/book": "IconBook",
	"IconGlyph/writing-sign": "IconWritingSign",
	"IconGlyph/slash": "IconSlash",
	"IconGlyph/minus": "IconMinus",
	"IconGlyph/minus-vertical": "IconMinusVertical",
	"IconGlyph/chevron-right": "IconChevronRight",
	"IconGlyph/circle-chevron-right": "IconCircleChevronRight",
	"IconGlyph/circle-chevrons-right": "IconCircleChevronsRight",
};

function generateIconComponent(glyphsInventory) {
	const glyphs = glyphsInventory.glyphs || [];

	if (glyphs.length === 0) {
		console.warn(
			"⚠️  No glyphs found in Icon.glyphs.json. Export from Figma first."
		);
		return null;
	}

	// Extract glyph names and check for stroke weight variants
	const glyphNames = glyphs.map((g) => g.componentName).sort();
	const hasStrokeVariants = glyphs.some(
		(g) => g.strokeVariants && g.strokeVariants.length > 0
	);

	// Log stroke weight information for diagnostics
	if (hasStrokeVariants) {
		console.log("📊 Icon glyphs with stroke weight variants detected:");
		glyphs
			.filter((g) => g.strokeVariants && g.strokeVariants.length > 0)
			.forEach((g) => {
				const strokes = g.strokeVariants
					?.map((v) => v.stroke)
					.filter(Boolean)
					.join(", ");
				console.log(
					`   • ${g.componentName} (${g.nodeType}): [${
						strokes || "unknown"
					}]`
				);
			});
	} else {
		console.log(
			"📊 Icon glyphs are simple components (no stroke weight variants)"
		);
	}

	// Generate import statements (needs Figma → Tabler mapping)
	const imports = glyphNames
		.map((name) => {
			const tablerName = FIGMA_TO_TABLER[name];
			if (!tablerName) {
				console.warn(`⚠️  No Tabler mapping for Figma glyph: ${name}`);
				return null;
			}
			return tablerName;
		})
		.filter(Boolean)
		.sort();

	const uniqueImports = [...new Set(imports)];

	// Generate IconName type
	const iconNameUnion = glyphNames.map((name) => `\t| "${name}"`).join("\n");

	// Generate ICONS mapping
	const iconsMapping = glyphNames
		.map((name) => {
			const tablerName = FIGMA_TO_TABLER[name];
			if (!tablerName) return null;
			return `\t"${name}": ${tablerName},`;
		})
		.filter(Boolean)
		.join("\n");

	const exportedAt = glyphsInventory.meta?.exportedAt || "UNKNOWN";
	const glyphCount = glyphNames.length;

	// Build stroke weight info note
	const strokeNote = hasStrokeVariants
		? "\n * STROKE WEIGHTS: IconGlyph/{name} frames contain stroke variant components (hairline/thin/medium/bold)"
		: "\n * STROKE WEIGHTS: Simple components (no stroke weight variants)";

	return `import type { ComponentType } from "react";
import {
${uniqueImports.map((imp) => `\t${imp},`).join("\n")}
\ttype IconProps as TablerIconProps,
} from "@tabler/icons-react";

/**
 * Icon primitive — 9 variants (sm/md/lg × primary/secondary/muted)
 *
 * CONTRACT: design/contracts/primitives/Icon.contract.json
 * GLYPHS: design/contracts/primitives/Icon.glyphs.json
 * SCHEMA: soloist-os.primitives.icon.contract.v1
 * GLYPH COUNT: ${glyphCount}
 * GLYPH LIBRARY: node-id=2002-217 (IconGlyph/* frame with glyph containers)
 * LAST EXPORT: ${exportedAt}${strokeNote}
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
${iconNameUnion};

const ICONS: Record<IconName, ComponentType<TablerIconProps>> = {
${iconsMapping}
};

// Contract-defined sizes: 16×16 (sm), 20×20 (md), 24×24 (lg)
const SIZE_MAP: Record<IconSize, number> = {
\tsm: 16,
\tmd: 20,
\tlg: 24,
};

// Contract-defined tones: color/text/{tone}
const TONE_MAP: Record<IconTone, string> = {
\tprimary: "text-white", // color/text/primary
\tsecondary: "text-gray-400", // color/text/secondary
\tmuted: "text-gray-500", // color/text/muted
};

export type IconProps = {
\tname: IconName;
\tsize?: IconSize;
\ttone?: IconTone;
\tclassName?: string;
\t/** For non-decorative icons only. Prefer leaving this undefined in buttons and labeling the button itself. */
\tariaLabel?: string;
\t/** Optional tooltip/title text for the SVG */
\ttitle?: string;
};

export function Icon({
\tname,
\tsize = "md",
\ttone = "primary",
\tclassName = "",
\tariaLabel,
\ttitle,
}: Readonly<IconProps>) {
\tconst Svg = ICONS[name];
\tconst isDecorative = !ariaLabel;
\tconst sizePixels = SIZE_MAP[size];
\tconst toneClass = TONE_MAP[tone];

\treturn (
\t\t<Svg
\t\t\tsize={sizePixels}
\t\t\tstroke={1} // stroke/thin = 1px (contract-defined)
\t\t\tclassName={\`\${toneClass} \${className}\`}
\t\t\tfocusable={false}
\t\t\trole={isDecorative ? undefined : "img"}
\t\t\taria-hidden={isDecorative ? true : undefined}
\t\t\taria-label={isDecorative ? undefined : ariaLabel}
\t\t\ttitle={title}
\t\t/>
\t);
}
`;
}

// Main
try {
	console.log("📦 Generating Icon.tsx from Icon.glyphs.json...");

	const glyphsRaw = fs.readFileSync(GLYPHS_PATH, "utf-8");
	const glyphsInventory = JSON.parse(glyphsRaw);

	if (!glyphsInventory.glyphs || glyphsInventory.glyphs.length === 0) {
		console.error("❌ Icon.glyphs.json is empty or invalid.");
		console.error(
			"   Export glyphs from Figma plugin first (Connect → Export → Icon glyph inventory)."
		);
		process.exit(1);
	}

	const generatedCode = generateIconComponent(glyphsInventory);

	if (!generatedCode) {
		console.error(
			"❌ Failed to generate Icon.tsx. Check Figma→Tabler mappings."
		);
		process.exit(1);
	}

	fs.writeFileSync(ICON_COMPONENT_PATH, generatedCode, "utf-8");
	console.log(
		`✅ Generated Icon.tsx with ${glyphsInventory.glyphs.length} glyphs.`
	);
	console.log(`   File: ${ICON_COMPONENT_PATH}`);
} catch (error) {
	console.error("❌ Error generating Icon.tsx:", error.message);
	process.exit(1);
}
