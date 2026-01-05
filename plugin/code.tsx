console.log("PLUGIN: initializing...");
figma.showUI(__html__, { width: 1000, height: 700, themeColors: true });

// --- Types ---

type PluginMessage =
	| {
			type: "create-variables";
			payload: { colors: { name: string; hex: string }[] };
	  }
	| {
			type: "seed-soloist-starter-kit";
			payload?: { overwriteExistingValues?: boolean };
	  }
	| {
			type: "validate-soloist-starter-kit";
	  }
	| {
			type: "create-text-styles";
			payload: {
				styles: {
					name: string;
					fontSize: number;
					lineHeight: number;
					fontFamily: string;
					fontWeight: string;
				}[];
			};
	  }
	| {
			type: "create-spacing-variables";
			payload: { variables: { name: string; value: number }[] };
	  }
	| {
			type: "create-semantic-variables";
			payload: {
				tokens: {
					name: string;
					values: { light: string; dark: string };
				}[];
			};
	  }
	| {
			type: "sync-everything";
			payload: {
				colors: { name: string; hex: string }[];
				spacing: { name: string; value: number }[];
				textStyles: {
					name: string;
					fontSize: number;
					lineHeight: number;
					fontFamily: string;
					fontWeight: string;
				}[];
				semantics: {
					name: string;
					values: { light: string; dark: string };
				}[];
			};
	  }
	| { type: "save-storage"; payload: { key: string; data: any } }
	| { type: "load-storage"; payload: { key: string } }
	| { type: "resize-ui"; payload: { width: number; height: number } }
	| {
			type: "export-variables-snapshot";
			payload?: {
				includeValues?: boolean;
				includeIssues?: boolean;
			};
	  }
	| {
			type: "apply-mode-renames";
			payload: {
				dryRun?: boolean;
				requireFromNameMatch?: boolean;
				changes: Array<{
					fileName?: string;
					collectionId: string;
					collectionName?: string;
					modeId: string;
					fromName?: string;
					toName: string;
				}>;
			};
	  }
	| { type: "pick-color" }
	| { type: "request-selection-colors" };

type ModeRenameResultV1 = {
	schemaVersion: "soloist-os.harmonization.mode-rename-result.v1";
	meta: {
		ranAt: string;
		currentFileName: string;
		dryRun: boolean;
	};
	summary: {
		received: number;
		relevant: number;
		applied: number;
		skipped: number;
		errors: number;
	};
	items: Array<{
		index: number;
		fileName?: string;
		collectionId: string;
		collectionName?: string;
		modeId: string;
		fromName?: string;
		toName: string;
		status: "applied" | "skipped" | "error";
		message: string;
	}>;
};

function modeRenameItem(
	change: {
		fileName?: string;
		collectionId: string;
		collectionName?: string;
		modeId: string;
		fromName?: string;
		toName: string;
	},
	index: number,
	status: ModeRenameResultV1["items"][number]["status"],
	message: string
): ModeRenameResultV1["items"][number] {
	return {
		index,
		fileName: change.fileName,
		collectionId: change.collectionId,
		collectionName: change.collectionName,
		modeId: change.modeId,
		fromName: change.fromName,
		toName: change.toName,
		status,
		message,
	};
}

function resolveModeRenameTarget(
	change: {
		collectionId: string;
		collectionName?: string;
		modeId: string;
	},
	collectionById: Map<string, VariableCollection>
):
	| {
			ok: true;
			collection: VariableCollection;
			mode: { modeId: string; name: string };
	  }
	| {
			ok: false;
			errorMessage: string;
			collectionName?: string;
	  } {
	const collection = collectionById.get(change.collectionId);
	if (!collection) {
		return {
			ok: false,
			errorMessage: `Collection not found in this file (id: ${change.collectionId})`,
		};
	}
	const mode = collection.modes.find((m) => m.modeId === change.modeId);
	if (!mode) {
		return {
			ok: false,
			collectionName: change.collectionName ?? collection.name,
			errorMessage: `Mode not found in collection "${collection.name}" (modeId: ${change.modeId})`,
		};
	}
	return { ok: true, collection, mode };
}

function checkModeRenamePreconditions(opts: {
	change: { fromName?: string; toName: string };
	modeName: string;
	requireFromNameMatch: boolean;
}): { ok: true } | { ok: false; status: "skipped"; message: string } {
	const { change, modeName, requireFromNameMatch } = opts;
	if (requireFromNameMatch) {
		if (!change.fromName) {
			return {
				ok: false,
				status: "skipped",
				message:
					"Skipped: fromName missing and requireFromNameMatch=true",
			};
		}
		if (modeName !== change.fromName) {
			return {
				ok: false,
				status: "skipped",
				message: `Skipped: mode name is "${modeName}", expected "${change.fromName}"`,
			};
		}
	}
	if (modeName === change.toName) {
		return {
			ok: false,
			status: "skipped",
			message: `Skipped: mode already named "${change.toName}"`,
		};
	}
	return { ok: true };
}

type VariablesSnapshotV1 = {
	schemaVersion: "soloist-os.variables.snapshot.v1";
	meta: {
		exportedAt: string;
		fileName: string;
		fileKey: string | null;
	};
	issues?: Array<{
		severity: "info" | "warning" | "error";
		code:
			| "DUPLICATE_VARIANT_COMBINATION"
			| "MISSING_VARIANT_PROPERTY"
			| "UNKNOWN_VARIANT_VALUE";
		message: string;
		nodeId?: string;
		nodeName?: string;
		details?: any;
	}>;
	counts: {
		collections: number;
		variables: number;
		variablesByCollectionId: Record<string, number>;
	};
	collections: Array<{
		id: string;
		name: string;
		defaultModeId: string;
		modes: Array<{ modeId: string; name: string }>;
	}>;
	variables: Array<{
		id: string;
		key?: string;
		name: string;
		description?: string;
		resolvedType: VariableResolvedDataType;
		variableCollectionId: string;
		collectionName?: string;
		scopes?: string[];
		hiddenFromPublishing?: boolean;
		remote?: boolean;
		valuesByMode?: Record<string, unknown>;
	}>;
};

// --- Helpers ---

function hexToRgb(hex: string) {
	const result =
		/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
	if (!result) return { r: 0, g: 0, b: 0 };
	return {
		r: Number.parseInt(result[1], 16) / 255,
		g: Number.parseInt(result[2], 16) / 255,
		b: Number.parseInt(result[3], 16) / 255,
		a: result[4] ? Number.parseInt(result[4], 16) / 255 : 1,
	};
}

function cssColorToRgba(color: string): RGBA {
	const c = color.trim();
	if (c.startsWith("#")) {
		return hexToRgb(c) as RGBA;
	}
	// rgb(255, 255, 255) / rgba(255, 255, 255, 0.08)
	const rgbaMatch =
		/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([0-9.]+)\s*)?\)$/i.exec(
			c
		);
	if (rgbaMatch) {
		const r = Math.max(0, Math.min(255, Number(rgbaMatch[1])));
		const g = Math.max(0, Math.min(255, Number(rgbaMatch[2])));
		const b = Math.max(0, Math.min(255, Number(rgbaMatch[3])));
		const aRaw = rgbaMatch[4];
		const a =
			aRaw === undefined ? 1 : Math.max(0, Math.min(1, Number(aRaw)));
		return { r: r / 255, g: g / 255, b: b / 255, a };
	}
	// Fallback: transparent-ish so we don't hard fail.
	return { r: 0, g: 0, b: 0, a: 0 };
}

function findLocalEffectStyleByName(
	styles: readonly EffectStyle[],
	name: string
): EffectStyle | undefined {
	return styles.find((s) => s.name === name);
}

function hasOwn(obj: Record<string, any>, key: string): boolean {
	return Object.getOwnPropertyDescriptor(obj, key) !== undefined;
}

type StarterKitValidationResult = {
	ok: boolean;
	missing: {
		collections: string[];
		variables: Array<{ collectionName: string; name: string }>;
		effectStyles: string[];
		textStyles: string[];
	};
};

function findLocalTextStyleByName(
	styles: readonly TextStyle[],
	name: string
): TextStyle | undefined {
	const exact = styles.find((s) => s.name === name);
	if (exact) return exact;
	const normalized = name.toLowerCase();
	return styles.find((s) => s.name.toLowerCase() === normalized);
}

async function loadFontSafe(fontName: FontName): Promise<boolean> {
	try {
		await figma.loadFontAsync(fontName);
		return true;
	} catch {
		return false;
	}
}

const STARTER_KIT_COLLECTIONS = [
	"Soloist / Color",
	"Soloist / Spacing",
	"Soloist / Radius",
	"Soloist / Stroke",
	"Soloist / Typography",
] as const;

const STARTER_KIT_VARIABLE_SPECS: Array<{
	collectionName: (typeof STARTER_KIT_COLLECTIONS)[number];
	name: string;
	type: VariableResolvedDataType;
	value?: string | number;
	aliasTo?: {
		collectionName: (typeof STARTER_KIT_COLLECTIONS)[number];
		name: string;
	};
}> = [
	// Color (aligned to ui-src/tailwind.config.js)
	{
		collectionName: "Soloist / Color",
		name: "color/bg/void",
		type: "COLOR",
		value: "#050505",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/bg/surface",
		type: "COLOR",
		value: "#0F1115",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/bg/raised",
		type: "COLOR",
		value: "#1A1D24",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/glass/subtle",
		type: "COLOR",
		value: "rgba(255, 255, 255, 0.02)",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/glass/stroke",
		type: "COLOR",
		value: "rgba(255, 255, 255, 0.08)",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/glass/highlight",
		type: "COLOR",
		value: "rgba(255, 255, 255, 0.15)",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/primary",
		type: "COLOR",
		value: "#3D8BFF",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/accent/cyan",
		type: "COLOR",
		value: "#3FE3F2",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/accent/sky",
		type: "COLOR",
		value: "#69B1FF",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/accent/blue",
		type: "COLOR",
		value: "#3F5CFF",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/accent/indigo",
		type: "COLOR",
		value: "#5016DC",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/accent/violet",
		type: "COLOR",
		value: "#9254DE",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/accent/magenta",
		type: "COLOR",
		value: "#F759AB",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/accent/error",
		type: "COLOR",
		value: "#FF453A",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/accent/success",
		type: "COLOR",
		value: "#32D74B",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/tool/explore",
		type: "COLOR",
		aliasTo: {
			collectionName: "Soloist / Color",
			name: "color/accent/cyan",
		},
	},
	{
		collectionName: "Soloist / Color",
		name: "color/tool/define",
		type: "COLOR",
		aliasTo: {
			collectionName: "Soloist / Color",
			name: "color/accent/sky",
		},
	},
	{
		collectionName: "Soloist / Color",
		name: "color/tool/structure",
		type: "COLOR",
		aliasTo: {
			collectionName: "Soloist / Color",
			name: "color/accent/blue",
		},
	},
	{
		collectionName: "Soloist / Color",
		name: "color/tool/document",
		type: "COLOR",
		aliasTo: {
			collectionName: "Soloist / Color",
			name: "color/accent/indigo",
		},
	},
	{
		collectionName: "Soloist / Color",
		name: "color/tool/learn",
		type: "COLOR",
		aliasTo: {
			collectionName: "Soloist / Color",
			name: "color/accent/violet",
		},
	},
	{
		collectionName: "Soloist / Color",
		name: "color/tool/record",
		type: "COLOR",
		aliasTo: {
			collectionName: "Soloist / Color",
			name: "color/accent/magenta",
		},
	},
	{
		collectionName: "Soloist / Color",
		name: "color/text/primary",
		type: "COLOR",
		value: "rgba(255, 255, 255, 0.92)",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/text/secondary",
		type: "COLOR",
		value: "rgba(255, 255, 255, 0.72)",
	},
	{
		collectionName: "Soloist / Color",
		name: "color/text/muted",
		type: "COLOR",
		value: "rgba(255, 255, 255, 0.52)",
	},

	// Spacing
	{
		collectionName: "Soloist / Spacing",
		name: "space/1",
		type: "FLOAT",
		value: 4,
	},
	{
		collectionName: "Soloist / Spacing",
		name: "space/2",
		type: "FLOAT",
		value: 8,
	},
	{
		collectionName: "Soloist / Spacing",
		name: "space/3",
		type: "FLOAT",
		value: 12,
	},
	{
		collectionName: "Soloist / Spacing",
		name: "space/4",
		type: "FLOAT",
		value: 16,
	},
	{
		collectionName: "Soloist / Spacing",
		name: "space/5",
		type: "FLOAT",
		value: 20,
	},
	{
		collectionName: "Soloist / Spacing",
		name: "space/6",
		type: "FLOAT",
		value: 24,
	},

	// Radius
	{
		collectionName: "Soloist / Radius",
		name: "radius/sm",
		type: "FLOAT",
		value: 8,
	},
	{
		collectionName: "Soloist / Radius",
		name: "radius/md",
		type: "FLOAT",
		value: 12,
	},
	{
		collectionName: "Soloist / Radius",
		name: "radius/lg",
		type: "FLOAT",
		value: 16,
	},
	{
		collectionName: "Soloist / Radius",
		name: "radius/pill",
		type: "FLOAT",
		value: 999,
	},

	// Stroke
	{
		collectionName: "Soloist / Stroke",
		name: "stroke/hairline",
		type: "FLOAT",
		value: 0.5,
	},
	{
		collectionName: "Soloist / Stroke",
		name: "stroke/thin",
		type: "FLOAT",
		value: 1,
	},
	{
		collectionName: "Soloist / Stroke",
		name: "stroke/medium",
		type: "FLOAT",
		value: 1.5,
	},
	{
		collectionName: "Soloist / Stroke",
		name: "stroke/bold",
		type: "FLOAT",
		value: 2,
	},

	// Typography
	{
		collectionName: "Soloist / Typography",
		name: "font/brand",
		type: "STRING",
		value: "Hubballi",
	},
	{
		collectionName: "Soloist / Typography",
		name: "font/ui",
		type: "STRING",
		value: "Inter",
	},
	{
		collectionName: "Soloist / Typography",
		name: "font/display",
		type: "STRING",
		value: "Acier BAT",
	},
	{
		collectionName: "Soloist / Typography",
		name: "font/mono",
		type: "STRING",
		value: "JetBrains Mono",
	},
];

const STARTER_KIT_EFFECT_STYLES = [
	"shadow/monolith",
	"shadow/monolith-hover",
	"shadow/neon-glow",
] as const;

const STARTER_KIT_TEXT_STYLE_SPECS: Array<{
	name: string;
	fontName: FontName;
	fontSize: number;
	lineHeightPercent: number;
}> = (() => {
	const ladder12 = [10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 28, 32];
	const ladder6 = [20, 24, 32, 40, 48, 64];
	const idxLabel = (i: number) => {
		const n = i + 1;
		return n < 10 ? `0${n}` : String(n);
	};

	const inter: FontName = { family: "Inter", style: "Regular" };
	const mono: FontName = { family: "JetBrains Mono", style: "Regular" };
	const brand: FontName = { family: "Hubballi", style: "Regular" };
	const display: FontName = { family: "Acier BAT", style: "Regular" };

	const uiAndMono = ladder12.reduce<typeof STARTER_KIT_TEXT_STYLE_SPECS>(
		(acc, fontSize, i) => {
			const idx = idxLabel(i);
			return acc.concat([
				{
					name: `ui/${idx}`,
					fontName: inter,
					fontSize,
					lineHeightPercent: 135,
				},
				{
					name: `mono/${idx}`,
					fontName: mono,
					fontSize,
					lineHeightPercent: 135,
				},
			]);
		},
		[]
	);

	const brandAndDisplay = ladder6.reduce<typeof STARTER_KIT_TEXT_STYLE_SPECS>(
		(acc, fontSize, i) => {
			const idx = idxLabel(i);
			return acc.concat([
				{
					name: `brand/${idx}`,
					fontName: brand,
					fontSize,
					lineHeightPercent: 110,
				},
				{
					name: `display/${idx}`,
					fontName: display,
					fontSize,
					lineHeightPercent: 110,
				},
			]);
		},
		[]
	);

	return uiAndMono.concat(brandAndDisplay);
})();

function resolveStarterKitVariableValue(params: {
	spec: (typeof STARTER_KIT_VARIABLE_SPECS)[number];
	starterCollectionsByName: Map<string, VariableCollection>;
	localVariables: readonly Variable[];
}): unknown {
	const { spec, starterCollectionsByName, localVariables } = params;

	if (!spec.aliasTo) {
		return spec.type === "COLOR"
			? cssColorToRgba(String(spec.value))
			: spec.value;
	}

	const targetCollection = starterCollectionsByName.get(
		spec.aliasTo.collectionName
	);
	const target =
		targetCollection &&
		localVariables.find(
			(v) =>
				v.name === spec.aliasTo?.name &&
				v.variableCollectionId === targetCollection.id
		);

	if (target) return { type: "VARIABLE_ALIAS", id: target.id };
	if (spec.value !== undefined) {
		return spec.type === "COLOR"
			? cssColorToRgba(String(spec.value))
			: spec.value;
	}

	console.warn(
		"Starter kit: alias target not found and no fallback value provided",
		{
			variable: spec.name,
			aliasTo: spec.aliasTo,
		}
	);
	return null;
}

async function validateSoloistStarterKit(): Promise<StarterKitValidationResult> {
	const [collections, variables, effectStyles, textStyles] =
		await Promise.all([
			figma.variables.getLocalVariableCollectionsAsync(),
			figma.variables.getLocalVariablesAsync(),
			figma.getLocalEffectStylesAsync(),
			figma.getLocalTextStylesAsync(),
		]);

	const collectionIdByName = new Map(
		collections.map((c) => [c.name, c.id] as const)
	);

	const missingCollections: string[] = [];
	for (const name of STARTER_KIT_COLLECTIONS) {
		if (!collectionIdByName.has(name)) {
			missingCollections.push(name);
		}
	}

	const missingVariables: Array<{ collectionName: string; name: string }> =
		[];
	for (const spec of STARTER_KIT_VARIABLE_SPECS) {
		const collectionId = collectionIdByName.get(spec.collectionName);
		if (!collectionId) {
			missingVariables.push({
				collectionName: spec.collectionName,
				name: spec.name,
			});
			continue;
		}
		const found = variables.some(
			(v) =>
				v.variableCollectionId === collectionId && v.name === spec.name
		);
		if (!found) {
			missingVariables.push({
				collectionName: spec.collectionName,
				name: spec.name,
			});
		}
	}

	const effectStyleNames = new Set(effectStyles.map((s) => s.name));
	const missingEffectStyles: string[] = [];
	for (const name of STARTER_KIT_EFFECT_STYLES) {
		if (!effectStyleNames.has(name)) {
			missingEffectStyles.push(name);
		}
	}

	const existingTextStyleNames = new Set(textStyles.map((s) => s.name));
	const missingTextStyles: string[] = [];
	for (const spec of STARTER_KIT_TEXT_STYLE_SPECS) {
		if (!existingTextStyleNames.has(spec.name)) {
			missingTextStyles.push(spec.name);
		}
	}

	const ok =
		missingCollections.length === 0 &&
		missingVariables.length === 0 &&
		missingEffectStyles.length === 0 &&
		missingTextStyles.length === 0;

	return {
		ok,
		missing: {
			collections: missingCollections,
			variables: missingVariables,
			effectStyles: missingEffectStyles,
			textStyles: missingTextStyles,
		},
	};
}

async function seedSoloistStarterKit(opts?: {
	overwriteExistingValues?: boolean;
}): Promise<{
	collections: {
		created: number;
		updated: number;
	};
	variables: {
		created: number;
		updated: number;
	};
	effectStyles: {
		created: number;
		updated: number;
	};
	textStyles: {
		created: number;
		updated: number;
	};
}> {
	const overwriteExistingValues = opts?.overwriteExistingValues ?? false;

	const localCollections =
		await figma.variables.getLocalVariableCollectionsAsync();
	const localVariables = await figma.variables.getLocalVariablesAsync();

	const collectionByName = new Map(
		localCollections.map((c) => [c.name, c] as const)
	);

	let collectionsCreated = 0;
	let collectionsUpdated = 0;
	let variablesCreated = 0;
	let variablesUpdated = 0;
	let effectStylesCreated = 0;
	let effectStylesUpdated = 0;
	let textStylesCreated = 0;
	let textStylesUpdated = 0;

	const ensureCollection = (name: string) => {
		const existing = collectionByName.get(name);
		const collection =
			existing ?? figma.variables.createVariableCollection(name);
		if (existing) collectionsUpdated++;
		else {
			collectionsCreated++;
			collectionByName.set(name, collection);
		}
		// For our seed collections we keep a single mode named "Default".
		try {
			const defaultMode = collection.modes.find(
				(m) => m.modeId === collection.defaultModeId
			);
			if (defaultMode && defaultMode.name !== "Default") {
				collection.renameMode(collection.defaultModeId, "Default");
			}
			// We intentionally do NOT remove extra modes; seed should be non-destructive.
		} catch {
			// Ignore mode rename errors; seed should continue.
		}
		return collection;
	};

	const ensureVariable = (params: {
		collection: VariableCollection;
		name: string;
		type: VariableResolvedDataType;
		value: any;
	}) => {
		const existing = localVariables.find(
			(v) =>
				v.name === params.name &&
				v.variableCollectionId === params.collection.id
		);
		const variable =
			existing ??
			figma.variables.createVariable(
				params.name,
				params.collection,
				params.type
			);
		if (!existing) {
			variablesCreated++;
			// Keep localVariables in sync for subsequent lookups.
			(localVariables as any).push(variable);
		}

		// Only set values if overwriting, or if it's currently unset.
		const currentValuesByMode = (variable as any).valuesByMode as
			| Record<string, any>
			| undefined;
		const defaultModeId = params.collection.defaultModeId;
		const hasValue =
			currentValuesByMode && hasOwn(currentValuesByMode, defaultModeId);
		if (overwriteExistingValues || !hasValue) {
			variable.setValueForMode(defaultModeId, params.value);
			variablesUpdated++;
		}
	};

	// --- Collections (Starter Kit names) ---
	const colorCollection = ensureCollection("Soloist / Color");
	const spacingCollection = ensureCollection("Soloist / Spacing");
	const radiusCollection = ensureCollection("Soloist / Radius");
	const strokeCollection = ensureCollection("Soloist / Stroke");
	const typographyCollection = ensureCollection("Soloist / Typography");

	const starterCollectionsByName = new Map<string, VariableCollection>([
		["Soloist / Color", colorCollection],
		["Soloist / Spacing", spacingCollection],
		["Soloist / Radius", radiusCollection],
		["Soloist / Stroke", strokeCollection],
		["Soloist / Typography", typographyCollection],
	]);

	for (const spec of STARTER_KIT_VARIABLE_SPECS) {
		const collection = starterCollectionsByName.get(spec.collectionName);
		if (!collection) continue;

		const resolvedValue = resolveStarterKitVariableValue({
			spec,
			starterCollectionsByName,
			localVariables,
		});
		if (resolvedValue === null) continue;
		ensureVariable({
			collection,
			name: spec.name,
			type: spec.type,
			value: resolvedValue,
		});
	}

	// --- Shadow effect styles (token-named) ---
	const localEffectStyles = await figma.getLocalEffectStylesAsync();
	const ensureEffectStyle = (params: { name: string; effects: Effect[] }) => {
		const existing = findLocalEffectStyleByName(
			localEffectStyles,
			params.name
		);
		const style = existing ?? figma.createEffectStyle();
		if (existing) effectStylesUpdated++;
		else {
			style.name = params.name;
			effectStylesCreated++;
			(localEffectStyles as any).push(style);
		}
		// We overwrite effects because styles are the contract here.
		style.effects = params.effects;
	};

	ensureEffectStyle({
		name: "shadow/monolith",
		effects: [
			{
				type: "INNER_SHADOW",
				visible: true,
				color: cssColorToRgba("rgba(255,255,255,0.08)"),
				offset: { x: 0, y: -1 },
				radius: 0,
				spread: 0,
				blendMode: "NORMAL",
			},
			{
				type: "DROP_SHADOW",
				visible: true,
				color: cssColorToRgba("rgba(0,0,0,0.8)"),
				offset: { x: 0, y: 20 },
				radius: 40,
				spread: -10,
				blendMode: "NORMAL",
			},
		],
	});

	ensureEffectStyle({
		name: "shadow/monolith-hover",
		effects: [
			{
				type: "INNER_SHADOW",
				visible: true,
				color: cssColorToRgba("rgba(255,255,255,0.2)"),
				offset: { x: 0, y: -1 },
				radius: 0,
				spread: 0,
				blendMode: "NORMAL",
			},
			{
				type: "DROP_SHADOW",
				visible: true,
				color: cssColorToRgba("rgba(0,0,0,0.9)"),
				offset: { x: 0, y: 30 },
				radius: 60,
				spread: -12,
				blendMode: "NORMAL",
			},
			{
				type: "DROP_SHADOW",
				visible: true,
				color: cssColorToRgba("rgba(61, 139, 255, 0.1)"),
				offset: { x: 0, y: 0 },
				radius: 20,
				spread: 0,
				blendMode: "NORMAL",
			},
		],
	});

	ensureEffectStyle({
		name: "shadow/neon-glow",
		effects: [
			{
				type: "DROP_SHADOW",
				visible: true,
				color: cssColorToRgba("rgba(63, 227, 242, 0.3)"),
				offset: { x: 0, y: 0 },
				radius: 10,
				spread: 0,
				blendMode: "NORMAL",
			},
			{
				type: "DROP_SHADOW",
				visible: true,
				color: cssColorToRgba("rgba(63, 227, 242, 0.1)"),
				offset: { x: 0, y: 0 },
				radius: 20,
				spread: 0,
				blendMode: "NORMAL",
			},
		],
	});

	// --- Text styles (mechanically sortable names; contract-based) ---
	const localTextStyles = await figma.getLocalTextStylesAsync();
	const ensureTextStyle = async (spec: {
		name: string;
		fontName: FontName;
		fontSize: number;
		lineHeightPercent: number;
	}) => {
		const existing = findLocalTextStyleByName(localTextStyles, spec.name);
		// If we found a case-insensitive match (legacy TitleCase), rename it to the new
		// standardized lowercase name when there isn't already an exact conflict.
		if (
			existing &&
			existing.name !== spec.name &&
			!localTextStyles.some((s) => s.name === spec.name)
		) {
			try {
				existing.name = spec.name;
			} catch {
				// Non-fatal: if rename fails, we still update the style's properties.
			}
		}
		const style = existing ?? figma.createTextStyle();
		if (existing) {
			textStylesUpdated++;
		} else {
			style.name = spec.name;
			textStylesCreated++;
			(localTextStyles as any).push(style);
		}

		const loaded = await loadFontSafe(spec.fontName);
		if (loaded) {
			style.fontName = spec.fontName;
		} else {
			// Keep going with a readable fallback; the checklist will still tell users what to create.
			await loadFontSafe({ family: "Inter", style: "Regular" });
			style.fontName = { family: "Inter", style: "Regular" };
		}
		style.fontSize = spec.fontSize;
		style.lineHeight = {
			unit: "PERCENT",
			value: spec.lineHeightPercent,
		};
	};

	for (const spec of STARTER_KIT_TEXT_STYLE_SPECS) {
		await ensureTextStyle(spec);
	}

	return {
		collections: {
			created: collectionsCreated,
			updated: collectionsUpdated,
		},
		variables: { created: variablesCreated, updated: variablesUpdated },
		effectStyles: {
			created: effectStylesCreated,
			updated: effectStylesUpdated,
		},
		textStyles: {
			created: textStylesCreated,
			updated: textStylesUpdated,
		},
	};
}

function componentToHex(c: number) {
	const hex = Math.round(c * 255).toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function safeFileKey(): string | null {
	// Not formally typed in all plugin-typings versions.
	return ((figma as any).fileKey as string | undefined) ?? null;
}

function stableVariantComboKey(variantProps: { [k: string]: string } | null) {
	if (!variantProps) return "__NO_VARIANT_PROPS__";
	const keys = Object.keys(variantProps).sort((a, b) =>
		a.localeCompare(b)
	);
	let out = "";
	for (let i = 0; i < keys.length; i++) {
		const k = keys[i];
		out += `${i === 0 ? "" : "|"}${k}=${variantProps[k]}`;
	}
	return out;
}

let allPagesLoadedPromise: Promise<void> | null = null;
async function ensureAllPagesLoaded() {
	// With `documentAccess: dynamic-page`, traversing `figma.root` across pages
	// requires an explicit load. Calling multiple times is fine, but we cache to
	// avoid repeated work across exports.
	const loader = (figma as any).loadAllPagesAsync as
		| (() => Promise<void>)
		| undefined;
	if (!loader) return;
	allPagesLoadedPromise ??= loader();
	await allPagesLoadedPromise;
}

function getVariantGroupDefinitions(set: ComponentSetNode): {
	expectedProps: string[];
	allowedValuesByProp: Record<string, string[]>;
} {
	// Figma typings: variantGroupProperties / variantProperties are deprecated, but
	// still the most compatible way to inspect variant combos across plugin-typings.
	// Keep usage isolated.
	// eslint-disable-next-line deprecation/deprecation
	const groupProps = set.variantGroupProperties ?? {};
	const expectedProps = Object.keys(groupProps);
	const allowedValuesByProp: Record<string, string[]> = {};
	for (const propName of expectedProps) {
		allowedValuesByProp[propName] =
			// eslint-disable-next-line deprecation/deprecation
			groupProps[propName]?.values ?? [];
	}
	return { expectedProps, allowedValuesByProp };
}

function addMissingVariantPropertyIssues(params: {
	issues: NonNullable<VariablesSnapshotV1["issues"]>;
	set: ComponentSetNode;
	component: ComponentNode;
	expectedProps: string[];
	props: { [key: string]: string } | null;
}) {
	const { issues, set, component, expectedProps, props } = params;
	for (const propName of expectedProps) {
		if (props && typeof props[propName] === "string") continue;
		issues.push({
			severity: "error",
			code: "MISSING_VARIANT_PROPERTY",
			message: `Variant is missing property "${propName}" in set "${set.name}"`,
			nodeId: component.id,
			nodeName: component.name,
			details: {
				componentSetId: set.id,
				componentSetName: set.name,
				expectedProperties: expectedProps,
				variantProperties: props,
			},
		});
	}
}

function addUnknownVariantValueIssues(params: {
	issues: NonNullable<VariablesSnapshotV1["issues"]>;
	set: ComponentSetNode;
	component: ComponentNode;
	expectedProps: string[];
	allowedValuesByProp: Record<string, string[]>;
	props: { [key: string]: string } | null;
}) {
	const { issues, set, component, expectedProps, allowedValuesByProp, props } =
		params;
	if (!props) return;
	for (const propName of expectedProps) {
		const v = props[propName];
		if (typeof v !== "string") continue;
		const allowed = allowedValuesByProp[propName] ?? [];
		if (allowed.length > 0 && !allowed.includes(v)) {
			issues.push({
				severity: "warning",
				code: "UNKNOWN_VARIANT_VALUE",
				message: `Variant value "${v}" is not in allowed values for "${propName}" in set "${set.name}"`,
				nodeId: component.id,
				nodeName: component.name,
				details: {
					componentSetId: set.id,
					componentSetName: set.name,
					property: propName,
					allowed,
					value: v,
				},
			});
		}
	}
}

function addDuplicateVariantCombinationIssues(params: {
	issues: NonNullable<VariablesSnapshotV1["issues"]>;
	set: ComponentSetNode;
	seen: Record<string, ComponentNode[]>;
}) {
	const { issues, set, seen } = params;
	for (const comboKey in seen) {
		const comps = seen[comboKey];
		if (comps.length <= 1) continue;
		issues.push({
			severity: "error",
			code: "DUPLICATE_VARIANT_COMBINATION",
			message: `Duplicate variant property combination in set "${set.name}" (${comps.length} variants share the same property values)`,
			nodeId: set.id,
			nodeName: set.name,
			details: {
				comboKey,
				variantIds: comps.map((c) => c.id),
				variantNames: comps.map((c) => c.name),
			},
		});
	}
}

async function scanComponentVariantIssues(): Promise<
	VariablesSnapshotV1["issues"]
> {
	const issues: NonNullable<VariablesSnapshotV1["issues"]> = [];

	// Required for dynamic-page document access when scanning across pages.
	await ensureAllPagesLoaded();

	// We can’t read Figma's “Manage libraries → Publish” validation directly,
	// but we *can* detect the most common root cause: duplicate/incomplete
	// variant property combinations inside COMPONENT_SETs.
	const sets = figma.root.findAllWithCriteria({
		types: ["COMPONENT_SET"],
	}) as ComponentSetNode[];

	for (const set of sets) {
		const { expectedProps, allowedValuesByProp } = getVariantGroupDefinitions(set);
		const seen: Record<string, ComponentNode[]> = {};
		const children = set.children ?? [];
		for (const child of children) {
			if (child.type !== "COMPONENT") continue;
			const comp = child;
			// eslint-disable-next-line deprecation/deprecation
			const props = (comp.variantProperties as { [k: string]: string } | undefined) ?? null;

			addMissingVariantPropertyIssues({
				issues,
				set,
				component: comp,
				expectedProps,
				props,
			});

			if (props) {
				addUnknownVariantValueIssues({
					issues,
					set,
					component: comp,
					expectedProps,
					allowedValuesByProp,
					props,
				});
			}

			const key = stableVariantComboKey(props);
			const bucket = seen[key];
			if (bucket) bucket.push(comp);
			else seen[key] = [comp];
		}

		addDuplicateVariantCombinationIssues({ issues, set, seen });
	}

	return issues;
}

async function buildVariablesSnapshotV1(opts?: {
	includeValues?: boolean;
	includeIssues?: boolean;
}): Promise<VariablesSnapshotV1> {
	const includeValues = opts?.includeValues ?? true;
	const includeIssues = opts?.includeIssues ?? true;

	const [collections, variables] = await Promise.all([
		figma.variables.getLocalVariableCollectionsAsync(),
		figma.variables.getLocalVariablesAsync(),
	]);

	const collectionsOut: VariablesSnapshotV1["collections"] = collections.map(
		(c) => ({
			id: c.id,
			name: c.name,
			defaultModeId: c.defaultModeId,
			modes: c.modes.map((m) => ({ modeId: m.modeId, name: m.name })),
		})
	);

	const collectionNameById = new Map(
		collectionsOut.map((c) => [c.id, c.name] as const)
	);

	const variablesByCollectionId: Record<string, number> = {};
	for (const v of variables) {
		variablesByCollectionId[v.variableCollectionId] =
			(variablesByCollectionId[v.variableCollectionId] ?? 0) + 1;
	}

	const variablesOut: VariablesSnapshotV1["variables"] = variables.map(
		(v) => {
			let valuesByMode: Record<string, unknown> | undefined;
			if (includeValues) {
				valuesByMode = {};
				const raw = (v as any).valuesByMode ?? {};
				for (const modeId in raw) {
					valuesByMode[modeId] = raw[modeId] as unknown;
				}
			}

			return {
				id: v.id,
				key: (v as any).key,
				name: v.name,
				description: v.description,
				resolvedType: v.resolvedType,
				variableCollectionId: v.variableCollectionId,
				collectionName: collectionNameById.get(v.variableCollectionId),
				scopes: (v as any).scopes,
				hiddenFromPublishing: (v as any).hiddenFromPublishing,
				remote: (v as any).remote,
				valuesByMode,
			};
		}
	);

	return {
		schemaVersion: "soloist-os.variables.snapshot.v1",
		meta: {
			exportedAt: new Date().toISOString(),
			fileName: figma.root.name,
			fileKey: safeFileKey(),
		},
		issues: includeIssues ? await scanComponentVariantIssues() : undefined,
		counts: {
			collections: collectionsOut.length,
			variables: variablesOut.length,
			variablesByCollectionId,
		},
		collections: collectionsOut,
		variables: variablesOut,
	};
}

async function applyModeRenames(opts: {
	changes: Array<{
		fileName?: string;
		collectionId: string;
		collectionName?: string;
		modeId: string;
		fromName?: string;
		toName: string;
	}>;
	dryRun?: boolean;
	requireFromNameMatch?: boolean;
}): Promise<ModeRenameResultV1> {
	const dryRun = opts.dryRun ?? true;
	const requireFromNameMatch = opts.requireFromNameMatch ?? true;
	const currentFileName = figma.root.name;

	const received = Array.isArray(opts.changes) ? opts.changes.length : 0;
	const relevantChanges = (opts.changes ?? []).filter(
		(c) => !c.fileName || c.fileName === currentFileName
	);

	const collections =
		await figma.variables.getLocalVariableCollectionsAsync();
	const collectionById = new Map(collections.map((c) => [c.id, c] as const));

	const items: ModeRenameResultV1["items"] = [];
	let applied = 0;
	let skipped = 0;
	let errors = 0;

	for (let i = 0; i < relevantChanges.length; i++) {
		const change = relevantChanges[i];
		const target = resolveModeRenameTarget(change, collectionById);
		if (!target.ok) {
			errors++;
			items.push(
				modeRenameItem(
					{
						...change,
						collectionName:
							target.collectionName ?? change.collectionName,
					},
					i,
					"error",
					target.errorMessage
				)
			);
			continue;
		}

		const pre = checkModeRenamePreconditions({
			change,
			modeName: target.mode.name,
			requireFromNameMatch,
		});
		if (!pre.ok) {
			skipped++;
			items.push(
				modeRenameItem(
					{
						...change,
						collectionName:
							change.collectionName ?? target.collection.name,
					},
					i,
					"skipped",
					pre.message
				)
			);
			continue;
		}

		try {
			if (!dryRun) {
				target.collection.renameMode(change.modeId, change.toName);
			}
			applied++;
			items.push(
				modeRenameItem(
					{
						...change,
						collectionName:
							change.collectionName ?? target.collection.name,
					},
					i,
					"applied",
					dryRun
						? `Would rename mode "${target.mode.name}" → "${change.toName}" in "${target.collection.name}"`
						: `Renamed mode "${target.mode.name}" → "${change.toName}" in "${target.collection.name}"`
				)
			);
		} catch (e: any) {
			errors++;
			items.push(
				modeRenameItem(
					{
						...change,
						collectionName:
							change.collectionName ?? target.collection.name,
					},
					i,
					"error",
					e?.message
						? `Rename failed: ${e.message}`
						: `Rename failed: ${String(e)}`
				)
			);
		}
	}

	return {
		schemaVersion: "soloist-os.harmonization.mode-rename-result.v1",
		meta: {
			ranAt: new Date().toISOString(),
			currentFileName,
			dryRun,
		},
		summary: {
			received,
			relevant: relevantChanges.length,
			applied,
			skipped,
			errors,
		},
		items,
	};
}

// --- Sync Functions ---

async function syncColors(colors: { name: string; hex: string }[]) {
	// Get or create collection
	const localCollections =
		await figma.variables.getLocalVariableCollectionsAsync();
	let collection = localCollections.find(
		(c) => c.name === "Soloist Primitives"
	);
	const existed = Boolean(collection);
	collection ??= figma.variables.createVariableCollection("Soloist Primitives");
	if (!existed) {
		collection.renameMode(collection.defaultModeId, "Value");
	}

	let count = 0;
	// Bulk fetch variables to optimize
	const existingVars = await figma.variables.getLocalVariablesAsync();

	for (const color of colors) {
		let variable = existingVars.find(
			(v) =>
				v.name === color.name &&
				v.variableCollectionId === collection?.id
		);
		variable ??= figma.variables.createVariable(color.name, collection, "COLOR");

		const rgb = hexToRgb(color.hex);
		// Note: variable.setValueForMode expects r,g,b (0-1). If alpha is needed it might be different, but figma API handles RGBA objects usually?
		// Actually setValueForMode takes RGB or RGBA.
		// My hexToRgb returns {r,g,b, a}.
		variable.setValueForMode(collection.defaultModeId, rgb);
		count++;
	}
	return count;
}

async function syncSpacing(variables: { name: string; value: number }[]) {
	const localCollections =
		await figma.variables.getLocalVariableCollectionsAsync();
	let collection = localCollections.find(
		(c) => c.name === "Soloist Primitives"
	);
	collection ??= figma.variables.createVariableCollection("Soloist Primitives");

	const existingVars = await figma.variables.getLocalVariablesAsync();

	let count = 0;
	for (const v of variables) {
		const varName = `spacing/${v.name}`;
		let variable = existingVars.find(
			(existing) =>
				existing.name === varName &&
				existing.variableCollectionId === collection?.id
		);
		variable ??= figma.variables.createVariable(varName, collection, "FLOAT");

		variable.setValueForMode(collection.defaultModeId, v.value);
		count++;
	}
	return count;
}

async function syncTextStyles(
	styles: {
		name: string;
		fontSize: number;
		lineHeight: number;
		fontFamily: string;
		fontWeight: string;
	}[]
) {
	// Load fonts
	// Retrieve unique fonts to load
	const fontsToLoad = new Set<string>();
	styles.forEach((s) => fontsToLoad.add(`${s.fontFamily}-${s.fontWeight}`));
	// Also load defaults
	await figma.loadFontAsync({ family: "Inter", style: "Regular" });
	await figma.loadFontAsync({ family: "Inter", style: "Bold" });
	await figma.loadFontAsync({ family: "Outfit", style: "Regular" }); // Likely used
	await figma.loadFontAsync({ family: "Outfit", style: "Bold" });

	let count = 0;
	const localStyles = await figma.getLocalTextStylesAsync();

	for (const style of styles) {
		let textStyle = localStyles.find((s) => s.name === style.name);

		if (!textStyle) {
			textStyle = figma.createTextStyle();
			textStyle.name = style.name;
		}

		textStyle.fontSize = style.fontSize;
		textStyle.fontName = {
			family: style.fontFamily || "Inter",
			style: style.fontWeight || "Regular",
		};

		// Line Height
		textStyle.lineHeight = {
			value: style.lineHeight * 100,
			unit: "PERCENT",
		};

		count++;
	}
	return count;
}

async function syncSemantics(
	tokens: { name: string; values: { light: string; dark: string } }[]
) {
	// 1. Get Primitives Collection (for Aliases)
	const localCollections =
		await figma.variables.getLocalVariableCollectionsAsync();
	const primCollection = localCollections.find(
		(c) => c.name === "Soloist Primitives"
	);
	if (!primCollection)
		throw new Error(
			"Primitives collection not found. Sync primitives first."
		);

	const primVars = await figma.variables.getLocalVariablesAsync();

	// 2. Get/Create Tokens Collection
	let tokenCollection = localCollections.find(
		(c) => c.name === "Soloist Tokens"
	);
	const tokenCollectionExisted = Boolean(tokenCollection);
	tokenCollection ??= figma.variables.createVariableCollection("Soloist Tokens");
	if (!tokenCollectionExisted) {
		tokenCollection.renameMode(tokenCollection.defaultModeId, "Light");
		tokenCollection.addMode("Dark");
	}

	const lightModeId = tokenCollection.modes.find(
		(m) => m.name === "Light"
	)?.modeId;
	const darkModeId = tokenCollection.modes.find(
		(m) => m.name === "Dark"
	)?.modeId;

	if (!lightModeId || !darkModeId)
		throw new Error("Could not find Light/Dark modes.");

	let count = 0;
	for (const token of tokens) {
		// Find/Create Variable
		const vars = await figma.variables.getLocalVariablesAsync();
		let variable = vars.find(
			(v) =>
				v.name === token.name &&
				v.variableCollectionId === tokenCollection?.id
		);
		variable ??= figma.variables.createVariable(token.name, tokenCollection, "COLOR");

		// Resolve Aliases
		// Light Value
		const lightPrimName = token.values.light;
		const lightTarget = primVars.find(
			(v) =>
				v.name === lightPrimName &&
				v.variableCollectionId === primCollection.id
		);

		if (lightTarget) {
			variable.setValueForMode(lightModeId, {
				type: "VARIABLE_ALIAS",
				id: lightTarget.id,
			});
		} else {
			// Fallback if primitive not found? Use hex? For now skip or error.
			// We could pass explicit hex fallback in payload if needed.
			// Assuming primitive exists if creation succeeded.
		}

		// Dark Value
		const darkPrimName = token.values.dark;
		const darkTarget = primVars.find(
			(v) =>
				v.name === darkPrimName &&
				v.variableCollectionId === primCollection.id
		);

		if (darkTarget) {
			variable.setValueForMode(darkModeId, {
				type: "VARIABLE_ALIAS",
				id: darkTarget.id,
			});
		}

		count++;
	}
	return count;
}

// --- Main Handler ---

async function handleCreateVariables(
	msg: Extract<PluginMessage, { type: "create-variables" }>
): Promise<void> {
	try {
		const count = await syncColors(msg.payload.colors);
		figma.notify(`Synced ${count} color variables.`);
	} catch (e: any) {
		console.error("PLUGIN: Error syncing colors", e);
		figma.notify("Error: " + e.message, { error: true });
	}
}

async function handleSeedSoloistStarterKit(
	msg: Extract<PluginMessage, { type: "seed-soloist-starter-kit" }>
): Promise<void> {
	try {
		figma.notify("Seeding Soloist starter kit tokens...");
		const result = await seedSoloistStarterKit({
			overwriteExistingValues: msg.payload?.overwriteExistingValues ?? false,
		});
		figma.ui.postMessage({
			type: "seed-starter-kit-result",
			payload: result,
		});
		figma.notify(
			`Starter kit ready: ${result.collections.created} collection(s) created, ${result.variables.created} variable(s) created, ${result.textStyles.created} text style(s) created.`
		);
	} catch (e: any) {
		console.error("PLUGIN: Error seeding starter kit", e);
		figma.notify("Seed error: " + (e?.message ?? String(e)), {
			error: true,
		});
		figma.ui.postMessage({
			type: "seed-starter-kit-error",
			message: e?.message ?? String(e),
		});
	}
}

async function handleValidateSoloistStarterKit(
	_msg: Extract<PluginMessage, { type: "validate-soloist-starter-kit" }>
): Promise<void> {
	try {
		const result = await validateSoloistStarterKit();
		figma.ui.postMessage({
			type: "starter-kit-validation-result",
			payload: result,
		});
		figma.notify(
			result.ok
				? "Starter kit checklist: all set."
				: `Starter kit checklist: missing ${
						result.missing.collections.length +
						result.missing.variables.length +
						result.missing.effectStyles.length +
						result.missing.textStyles.length
				  } item(s).`,
			{ error: !result.ok }
		);
	} catch (e: any) {
		console.error("PLUGIN: Error validating starter kit", e);
		figma.ui.postMessage({
			type: "starter-kit-validation-error",
			message: e?.message ?? String(e),
		});
		figma.notify("Checklist error: " + (e?.message ?? String(e)), {
			error: true,
		});
	}
}

async function handleCreateTextStyles(
	msg: Extract<PluginMessage, { type: "create-text-styles" }>
): Promise<void> {
	try {
		const count = await syncTextStyles(msg.payload.styles);
		figma.notify(`Synced ${count} text styles.`);
	} catch (e: any) {
		console.error("PLUGIN: Error syncing text styles", e);
		figma.notify("Error: " + e.message, { error: true });
	}
}

async function handleCreateSpacingVariables(
	msg: Extract<PluginMessage, { type: "create-spacing-variables" }>
): Promise<void> {
	try {
		const count = await syncSpacing(msg.payload.variables);
		figma.notify(`Synced ${count} spacing variables.`);
	} catch (e: any) {
		console.error("PLUGIN: Error syncing spacing", e);
		figma.notify("Error: " + e.message, { error: true });
	}
}

async function handleCreateSemanticVariables(
	msg: Extract<PluginMessage, { type: "create-semantic-variables" }>
): Promise<void> {
	try {
		const count = await syncSemantics(msg.payload.tokens);
		figma.notify(`Synced ${count} semantic tokens.`);
	} catch (e: any) {
		console.error("PLUGIN: Error syncing semantics", e);
		figma.notify("Error: " + e.message, { error: true });
	}
}

async function handleSyncEverything(
	msg: Extract<PluginMessage, { type: "sync-everything" }>
): Promise<void> {
	try {
		figma.notify("Starting Sync...");
		const colorCount = await syncColors(msg.payload.colors);
		const spacingCount = await syncSpacing(msg.payload.spacing);
		const textCount = await syncTextStyles(msg.payload.textStyles);
		const semanticCount = await syncSemantics(msg.payload.semantics);
		figma.notify(
			`Sync Complete: ${colorCount} Colors, ${spacingCount} Spacing, ${textCount} Styles, ${semanticCount} Semantics.`
		);
		figma.ui.postMessage({ type: "sync-complete" });
	} catch (e: any) {
		console.error("PLUGIN: Sync Everything Error", e);
		figma.notify("Sync Error: " + e.message, { error: true });
		figma.ui.postMessage({ type: "sync-error", message: e.message });
	}
}

async function handleSaveStorage(
	msg: Extract<PluginMessage, { type: "save-storage" }>
): Promise<void> {
	const { key, data } = msg.payload;
	await figma.clientStorage.setAsync(key, data);
}

async function handleLoadStorage(
	msg: Extract<PluginMessage, { type: "load-storage" }>
): Promise<void> {
	const { key } = msg.payload;
	const data = await figma.clientStorage.getAsync(key);
	figma.ui.postMessage({
		type: "storage-loaded",
		payload: { key, data },
	});
}

async function handleExportVariablesSnapshot(
	msg: Extract<PluginMessage, { type: "export-variables-snapshot" }>
): Promise<void> {
	try {
		figma.notify("Exporting variables snapshot...");
		const snapshot = await buildVariablesSnapshotV1({
			includeValues: msg.payload?.includeValues ?? true,
			includeIssues: msg.payload?.includeIssues ?? true,
		});
		const issueCount = snapshot.issues?.length ?? 0;
		const errorCount = (snapshot.issues ?? []).filter(
			(i) => i.severity === "error"
		).length;
		figma.ui.postMessage({
			type: "variables-snapshot-ready",
			payload: snapshot,
		});
		if (issueCount > 0) {
			figma.notify(
				`Snapshot exported with ${issueCount} issue(s) (${errorCount} error). See Export panel.`,
				{ error: errorCount > 0 }
			);
		} else {
			figma.notify(
				`Snapshot exported: ${snapshot.counts.collections} collections, ${snapshot.counts.variables} variables.`
			);
		}
	} catch (e: any) {
		console.error("PLUGIN: Error exporting variables snapshot", e);
		figma.notify("Snapshot export error: " + e.message, {
			error: true,
		});
		figma.ui.postMessage({
			type: "variables-snapshot-error",
			message: e?.message ?? String(e),
		});
	}
}

async function handleApplyModeRenames(
	msg: Extract<PluginMessage, { type: "apply-mode-renames" }>
): Promise<void> {
	try {
		const result = await applyModeRenames({
			changes: msg.payload.changes,
			dryRun: msg.payload.dryRun,
			requireFromNameMatch: msg.payload.requireFromNameMatch,
		});
		figma.ui.postMessage({
			type: "mode-renames-result",
			payload: result,
		});
		const verb = result.meta.dryRun ? "Preview" : "Applied";
		const appliedLabel = result.meta.dryRun
			? `${result.summary.applied} planned`
			: `${result.summary.applied} renamed`;
		figma.notify(
			`${verb}: ${appliedLabel}, ${result.summary.skipped} skipped, ${result.summary.errors} error(s).`,
			{ error: result.summary.errors > 0 }
		);
	} catch (e: any) {
		console.error("PLUGIN: Error applying mode renames", e);
		figma.notify("Mode rename error: " + e.message, { error: true });
		figma.ui.postMessage({
			type: "mode-renames-error",
			message: e?.message ?? String(e),
		});
	}
}

function handleResizeUi(
	msg: Extract<PluginMessage, { type: "resize-ui" }>
): void {
	const { width, height } = msg.payload;
	figma.ui.resize(width, height);
}

async function onUiMessage(msg: PluginMessage): Promise<void> {
	switch (msg.type) {
		case "create-variables":
			return handleCreateVariables(msg);
		case "seed-soloist-starter-kit":
			return handleSeedSoloistStarterKit(msg);
		case "validate-soloist-starter-kit":
			return handleValidateSoloistStarterKit(msg);
		case "create-text-styles":
			return handleCreateTextStyles(msg);
		case "create-spacing-variables":
			return handleCreateSpacingVariables(msg);
		case "create-semantic-variables":
			return handleCreateSemanticVariables(msg);
		case "sync-everything":
			return handleSyncEverything(msg);
		case "save-storage":
			return handleSaveStorage(msg);
		case "load-storage":
			return handleLoadStorage(msg);
		case "export-variables-snapshot":
			return handleExportVariablesSnapshot(msg);
		case "apply-mode-renames":
			return handleApplyModeRenames(msg);
		case "resize-ui":
			handleResizeUi(msg);
			return;
		case "request-selection-colors":
			handleSelectionChange();
			return;
		case "pick-color":
			handlePickColor();
			return;
		default:
			return;
	}
}

figma.ui.onmessage = (msg: PluginMessage) => {
	void onUiMessage(msg);
};

// --- Selection Sampling Logic ---

function handleSelectionChange() {
	const selection = figma.currentPage.selection;
	const colors = new Set<string>();

	for (const node of selection) {
		// 1. Check Fills
		if ("fills" in node) {
			const fills = node.fills as Paint[];
			fills.forEach((fill) => {
				if (fill.type === "SOLID") {
					colors.add(
						rgbToHex(fill.color.r, fill.color.g, fill.color.b)
					);
				}
			});
		}

		// 2. Check Strokes
		if ("strokes" in node) {
			const strokes = node.strokes as Paint[];
			strokes.forEach((stroke) => {
				if (stroke.type === "SOLID") {
					colors.add(
						rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b)
					);
				}
			});
		}
	}

	const sampledColors = Array.from(colors).slice(0, 10); // Limit to top 10
	figma.ui.postMessage({
		type: "selection-colors",
		payload: { colors: sampledColors },
	});
}

function handlePickColor() {
	const selection = figma.currentPage.selection;
	if (selection.length === 0) {
		figma.notify("Please select an object with a solid fill.");
		return;
	}

	let foundColor = false;
	for (const node of selection) {
		if ("fills" in node) {
			const fills = node.fills as Paint[];
			const solidFill = fills.find(
				(f) => f.type === "SOLID"
			) as SolidPaint;
			if (solidFill) {
				const hex = rgbToHex(
					solidFill.color.r,
					solidFill.color.g,
					solidFill.color.b
				);
				figma.ui.postMessage({
					type: "color-picked",
					payload: { hex },
				});
				foundColor = true;
				break;
			}
		}
	}

	if (!foundColor) {
		figma.notify("No solid fill found in selection.");
	}
}

// Subscribe to selection changes
figma.on("selectionchange", handleSelectionChange);
