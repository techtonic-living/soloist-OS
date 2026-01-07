import { useState, useEffect, type ChangeEvent } from "react";
import { AnimatePresence } from "framer-motion";
import { useCopyFeedback } from "../hooks/useCopyFeedback";
import {
	Copy,
	Check,
	Terminal as TerminalIcon,
	FileJson,
	FileCode,
	Wind,
	RefreshCw,
	Zap,
	Share2,
	Download,
	Upload,
} from "lucide-react";

// --- Generators (Migrated from ExportTerminal) ---

const flattenColors = (props: any) => {
	const allRamps = {
		primary: props.ramp,
		secondary: props.secondaryRamp,
		tertiary: props.tertiaryRamp,
		neutral: props.neutralRamp,
		signal: props.signalRamp,
		alpha: props.alphaRamp,
	};
	return allRamps;
};

const generateCSS = (props: any) => {
	let css = `:root {\n  /* Colors */\n`;
	const colors = flattenColors(props);
	Object.entries(colors).forEach(([_, tokens]: any) => {
		tokens.forEach((token: any) => {
			const name = token.name.replace("/", "-");
			css += `  --color-${name}: ${token.hex};\n`;
		});
	});
	// Typography
	css += `\n  /* Typography */\n`;
	css += `  --font-base-size: ${props.baseSize}px;\n`;
	css += `  --font-scale-ratio: ${props.scale.ratio};\n`;
	// Spacing
	css += `\n  /* Spacing */\n`;
	const spacingSteps = [1, 2, 4, 6, 8, 12, 16, 24, 32];
	const stepNames = [
		"xs",
		"sm",
		"md",
		"lg",
		"xl",
		"2xl",
		"3xl",
		"4xl",
		"5xl",
	];
	stepNames.forEach((name, i) => {
		css += `  --space-${name}: ${spacingSteps[i] * props.baseSpacing}px;\n`;
	});
	// Radius
	css += `\n  /* Radius */\n`;
	const radiusSteps = [0.5, 1, 2, 3, 4];
	const radiusNames = ["xs", "sm", "md", "lg", "xl"];
	radiusNames.forEach((name, i) => {
		css += `  --radius-${name}: ${radiusSteps[i] * props.baseRadius}px;\n`;
	});
	css += `  --radius-full: 9999px;\n`;
	css += `}`;
	return css;
};

const generateTailwind = (props: any) => {
	const colors = flattenColors(props);
	const colorConfig: any = {};
	Object.entries(colors).forEach(([group, tokens]: any) => {
		// eslint-disable-next-line
		colorConfig[group] = {};
		tokens.forEach((token: any) => {
			const shade = token.name.split("/")[1];
			colorConfig[group][shade] = token.hex;
		});
	});
	// Spacing
	const spacingConfig: any = {};
	const spacingSteps = [1, 2, 4, 6, 8, 12, 16, 24, 32];
	const stepNames = [
		"xs",
		"sm",
		"md",
		"lg",
		"xl",
		"2xl",
		"3xl",
		"4xl",
		"5xl",
	];
	stepNames.forEach((name, i) => {
		spacingConfig[name] = `${spacingSteps[i] * props.baseSpacing}px`;
	});
	// Radius
	const radiusConfig: any = {};
	const radiusSteps = [0.5, 1, 2, 3, 4];
	const radiusNames = ["xs", "sm", "md", "lg", "xl"];
	radiusNames.forEach((name, i) => {
		radiusConfig[name] = `${radiusSteps[i] * props.baseRadius}px`;
	});
	const config = {
		theme: {
			extend: {
				colors: colorConfig,
				spacing: spacingConfig,
				borderRadius: radiusConfig,
				fontFamily: {
					sans: ["Inter", "sans-serif"],
					display: ["Outfit", "sans-serif"],
				},
			},
		},
	};
	const jsonContent = JSON.stringify(config, null, 4)
		.replace(/"([^"]+)":/g, "$1:")
		.replace(/"/g, "'");
	return `// tailwind.config.js\nmodule.exports = ${jsonContent}`;
};

const generateJSON = (props: any) => {
	const colors = flattenColors(props);
	const tokens: any = {
		color: {},
		size: { font: {}, spacing: {}, radius: {} },
	};
	Object.entries(colors).forEach(([group, list]: any) => {
		tokens.color[group] = {};
		list.forEach((token: any) => {
			const shade = token.name.split("/")[1];
			tokens.color[group][shade] = { value: token.hex, type: "color" };
		});
	});
	// Spacing
	const spacingSteps = [1, 2, 4, 6, 8, 12, 16, 24, 32];
	const stepNames = [
		"xs",
		"sm",
		"md",
		"lg",
		"xl",
		"2xl",
		"3xl",
		"4xl",
		"5xl",
	];
	stepNames.forEach((name, i) => {
		tokens.size.spacing[name] = {
			value: `${spacingSteps[i] * props.baseSpacing}px`,
			type: "dimension",
		};
	});
	return JSON.stringify(tokens, null, 2);
};

const generateSwift = (props: any) => {
	const colors = flattenColors(props);
	let swift = `import SwiftUI\n\nextension Color {\n`;
	Object.entries(colors).forEach(([group, list]: any) => {
		list.forEach((token: any) => {
			const shade = token.name.split("/")[1];
			swift += `    static let ${group}${shade} = Color(hex: "${token.hex}")\n`;
		});
	});
	swift += `}\n\nstruct Spacing {\n`;
	const spacingSteps = [1, 2, 4, 6, 8, 12, 16, 24, 32];
	const stepNames = [
		"xs",
		"sm",
		"md",
		"lg",
		"xl",
		"2xl",
		"3xl",
		"4xl",
		"5xl",
	];
	stepNames.forEach((name, i) => {
		swift += `    static let ${name}: CGFloat = ${
			spacingSteps[i] * props.baseSpacing
		}\n`;
	});
	swift += `}`;
	return swift;
};

// --- Component ---

import { useSoloist } from "../context/SoloistContext";

// ... imports

// Generators stay same, they just take "context" object now which is compatible with "props" object shape conceptually.

// --- Component ---

export const ConnectView = ({
	initialTab = "sync",
	initialFormat = "css",
}: {
	initialTab?: "sync" | "export";
	initialFormat?: "css" | "json" | "swift" | "tailwind";
} = {}) => {
	const ctx = useSoloist(); // Get everything
	const [activeTab, setActiveTab] = useState<"sync" | "export">(initialTab);
	const [format, setFormat] = useState<"css" | "json" | "swift" | "tailwind">(
		initialFormat
	);
	const { isCopied, copy } = useCopyFeedback();
	const [syncStatus, setSyncStatus] = useState<
		"idle" | "syncing" | "success"
	>("idle");
	const [snapshotStatus, setSnapshotStatus] = useState<
		"idle" | "exporting" | "success" | "error"
	>("idle");
	const [snapshotSummary, setSnapshotSummary] = useState<
		| {
				collections: number;
				variables: number;
				fileName?: string;
				issueCount?: number;
				errorCount?: number;
		  }
		| undefined
	>(undefined);
	const [snapshotError, setSnapshotError] = useState<string | undefined>(
		undefined
	);
	const [snapshotIssues, setSnapshotIssues] = useState<
		| Array<{
				severity: "info" | "warning" | "error";
				code: string;
				message: string;
				nodeName?: string;
		  }>
		| undefined
	>(undefined);
	const [iconContractStatus, setIconContractStatus] = useState<
		"idle" | "exporting" | "success" | "error"
	>("idle");
	const [iconContractError, setIconContractError] = useState<
		string | undefined
	>(undefined);
	const [iconContractIssuePreview, setIconContractIssuePreview] = useState<
		Array<{
			severity: string;
			code: string;
			message: string;
			nodeName?: string;
		}>
	>([]);
	const [buttonContractStatus, setButtonContractStatus] = useState<
		"idle" | "exporting" | "success" | "error"
	>("idle");
	const [buttonContractError, setButtonContractError] = useState<
		string | undefined
	>(undefined);
	const [buttonContractIssuePreview, setButtonContractIssuePreview] =
		useState<
			Array<{
				severity: string;
				code: string;
				message: string;
				nodeName?: string;
			}>
		>([]);
	const [iconGlyphsStatus, setIconGlyphsStatus] = useState<
		"idle" | "exporting" | "success" | "error"
	>("idle");
	const [iconGlyphsError, setIconGlyphsError] = useState<string | undefined>(
		undefined
	);
	const [iconGlyphsData, setIconGlyphsData] = useState<any>(undefined);
	const [buttonNotesStatus, setButtonNotesStatus] = useState<
		"idle" | "applying" | "success" | "error"
	>("idle");
	const [buttonNotesError, setButtonNotesError] = useState<
		string | undefined
	>(undefined);
	const [buttonNotesAppliedTo, setButtonNotesAppliedTo] = useState<
		| {
				nodeId: string;
				nodeName?: string;
				nodeType?: string;
		  }
		| undefined
	>(undefined);

	type ModeRenameChange = {
		fileName?: string;
		collectionId: string;
		collectionName?: string;
		modeId: string;
		fromName?: string;
		toName: string;
	};

	type ModeRenameProposal = {
		schemaVersion?: string;
		generatedAt?: string;
		changes: ModeRenameChange[];
	};

	type ModeRenameResult = {
		schemaVersion?: string;
		meta?: { ranAt: string; currentFileName: string; dryRun: boolean };
		summary?: {
			received: number;
			relevant: number;
			applied: number;
			skipped: number;
			errors: number;
		};
		items?: Array<{
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

	const [modeRenameProposal, setModeRenameProposal] = useState<
		ModeRenameProposal | undefined
	>(undefined);
	const [modeRenameStatus, setModeRenameStatus] = useState<
		"idle" | "loading" | "previewing" | "applying" | "success" | "error"
	>("idle");
	const [modeRenameError, setModeRenameError] = useState<string | undefined>(
		undefined
	);
	const [modeRenameResult, setModeRenameResult] = useState<
		ModeRenameResult | undefined
	>(undefined);

	type AnnotationsSnapshotV1 = {
		schemaVersion: "soloist-os.annotations.snapshot.v1";
		meta: {
			exportedAt: string;
			fileName?: string;
			fileKey?: string | null;
			scope: "current-page";
		};
		annotations: Array<{
			pageId: string;
			pageName: string;
			targetId?: string;
			targetName?: string;
			targetType?: string;
			frameId: string;
			frameName: string;
			items: Array<{
				type: "TEXT";
				nodeId?: string;
				name?: string;
				x?: number;
				y?: number;
				characters: string;
			}>;
		}>;
	};

	type ApplyAnnotationsResultV1 = {
		schemaVersion: "soloist-os.annotations.apply-result.v1";
		meta: {
			ranAt: string;
			fileName?: string;
			fileKey?: string | null;
			pageId: string;
			pageName: string;
			mode: "replace";
		};
		summary: {
			frameCreated: boolean;
			framesCreated?: number;
			targetsApplied?: number;
			skipped?: number;
			deleted: number;
			created: number;
		};
		issues?: Array<{
			severity: "warning" | "error";
			message: string;
			targetId?: string;
			targetName?: string;
		}>;
	};

	const [annotationsStatus, setAnnotationsStatus] = useState<
		| "idle"
		| "exporting"
		| "exported"
		| "loading"
		| "ready"
		| "applying"
		| "success"
		| "error"
	>("idle");
	const [annotationsSnapshot, setAnnotationsSnapshot] = useState<
		AnnotationsSnapshotV1 | undefined
	>(undefined);
	const [annotationsApplyResult, setAnnotationsApplyResult] = useState<
		ApplyAnnotationsResultV1 | undefined
	>(undefined);
	const [annotationsError, setAnnotationsError] = useState<
		string | undefined
	>(undefined);

	const [seedOverwrite, setSeedOverwrite] = useState(false);
	const [seedStatus, setSeedStatus] = useState<
		"idle" | "seeding" | "success" | "error"
	>("idle");
	type SeedResult = {
		collections: { created: number; updated: number };
		variables: { created: number; updated: number };
		effectStyles: { created: number; updated: number };
		textStyles: { created: number; updated: number };
	};
	const [seedResult, setSeedResult] = useState<SeedResult | undefined>(
		undefined
	);
	const [seedError, setSeedError] = useState<string | undefined>(undefined);

	type StarterKitValidationResult = {
		ok: boolean;
		missing: {
			collections: string[];
			variables: Array<{ collectionName: string; name: string }>;
			effectStyles: string[];
			textStyles: string[];
		};
	};
	const [checklistStatus, setChecklistStatus] = useState<
		"idle" | "checking" | "ok" | "missing" | "error"
	>("idle");
	const [checklistResult, setChecklistResult] = useState<
		StarterKitValidationResult | undefined
	>(undefined);
	const [checklistError, setChecklistError] = useState<string | undefined>(
		undefined
	);

	const ancestorOrigins = (globalThis as any).location?.ancestorOrigins as
		| { length: number; [idx: number]: string }
		| undefined;
	const parentOrigin =
		ancestorOrigins && ancestorOrigins.length > 0
			? ancestorOrigins[0]
			: "https://www.figma.com";

	const downloadJson = (filename: string, data: unknown) => {
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	};

	const sanitizeFilename = (s: string) =>
		s
			.trim()
			.replace(/\s+/g, "_")
			.replace(/[^a-zA-Z0-9._-]/g, "_")
			.replace(/_+/g, "_");

	const normalizeModeRenameProposal = (raw: any): ModeRenameProposal => {
		const changesRaw = Array.isArray(raw?.changes) ? raw.changes : [];
		const changes: ModeRenameChange[] = changesRaw
			.filter((c: any) => c && typeof c === "object")
			.map((c: any) => ({
				fileName:
					typeof c.fileName === "string" ? c.fileName : undefined,
				collectionId: String(c.collectionId ?? ""),
				collectionName:
					typeof c.collectionName === "string"
						? c.collectionName
						: undefined,
				modeId: String(c.modeId ?? ""),
				fromName:
					typeof c.fromName === "string" ? c.fromName : undefined,
				toName: String(c.toName ?? ""),
			}))
			.filter(
				(c: ModeRenameChange) =>
					c.collectionId.length > 0 &&
					c.modeId.length > 0 &&
					c.toName.length > 0
			);

		return {
			schemaVersion:
				typeof raw?.schemaVersion === "string"
					? raw.schemaVersion
					: undefined,
			generatedAt:
				typeof raw?.generatedAt === "string"
					? raw.generatedAt
					: undefined,
			changes,
		};
	};

	const handleLoadModeRenameProposal = async (
		e: ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setModeRenameStatus("loading");
		setModeRenameError(undefined);
		setModeRenameResult(undefined);

		try {
			const text = await file.text();
			const parsed = JSON.parse(text);
			const proposal = normalizeModeRenameProposal(parsed);
			if (proposal.changes.length === 0) {
				throw new Error(
					"No valid changes found in proposal (expected a non-empty changes[] array)."
				);
			}
			setModeRenameProposal(proposal);
			setModeRenameStatus("idle");
		} catch (err: any) {
			setModeRenameStatus("error");
			setModeRenameError(err?.message ?? String(err));
		}
		// Allow re-uploading the same file.
		e.target.value = "";
	};

	const postApplyModeRenames = (opts: { dryRun: boolean }) => {
		if (!modeRenameProposal) return;
		setModeRenameError(undefined);
		setModeRenameResult(undefined);
		setModeRenameStatus(opts.dryRun ? "previewing" : "applying");
		parent.postMessage(
			{
				pluginMessage: {
					type: "apply-mode-renames",
					payload: {
						dryRun: opts.dryRun,
						requireFromNameMatch: true,
						changes: modeRenameProposal.changes,
					},
				},
			},
			parentOrigin
		);
	};

	const modeRenameItems: NonNullable<ModeRenameResult["items"]> =
		Array.isArray(modeRenameResult?.items) ? modeRenameResult.items : [];

	const buttonNotesStatusClass = (() => {
		switch (buttonNotesStatus) {
			case "success":
				return "bg-green-500/10 text-green-400 border-green-500/30";
			case "error":
				return "bg-red-500/10 text-red-400 border-red-500/30";
			default:
				return "bg-white/5 hover:bg-white/10 text-gray-200 border-white/10";
		}
	})();

	const attachButtonNotesLabel = (() => {
		switch (buttonNotesStatus) {
			case "applying":
				return "APPLYING...";
			case "success":
				return "NOTES ADDED";
			default:
				return "ADD BUTTON BUILD NOTES";
		}
	})();

	const handleExportVariablesSnapshot = () => {
		setSnapshotStatus("exporting");
		setSnapshotError(undefined);
		parent.postMessage(
			{
				pluginMessage: {
					type: "export-variables-snapshot",
					payload: { includeValues: true },
				},
			},
			parentOrigin
		);
	};

	const handleExportAnnotationsSnapshot = () => {
		setAnnotationsStatus("exporting");
		setAnnotationsError(undefined);
		setAnnotationsApplyResult(undefined);
		parent.postMessage(
			{
				pluginMessage: {
					type: "export-annotations-snapshot",
					payload: { scope: "current-page" },
				},
			},
			parentOrigin
		);
	};

	const handleExportIconContract = () => {
		setIconContractStatus("exporting");
		setIconContractError(undefined);
		setIconContractIssuePreview([]);
		parent.postMessage(
			{
				pluginMessage: {
					type: "export-icon-contract",
					payload: { includeVariableNames: true },
				},
			},
			parentOrigin
		);
	};

	const handleExportButtonContract = () => {
		setButtonContractStatus("exporting");
		setButtonContractError(undefined);
		setButtonContractIssuePreview([]);
		parent.postMessage(
			{
				pluginMessage: {
					type: "export-button-contract",
					payload: { includeVariableNames: true },
				},
			},
			parentOrigin
		);
	};

	const handleExportIconGlyphs = () => {
		setIconGlyphsStatus("exporting");
		setIconGlyphsError(undefined);
		setIconGlyphsData(undefined);
		parent.postMessage(
			{
				pluginMessage: {
					type: "export-icon-glyphs",
					payload: {},
				},
			},
			parentOrigin
		);
	};

	const handleApplyButtonBuildNotes = () => {
		setButtonNotesStatus("applying");
		setButtonNotesError(undefined);
		setButtonNotesAppliedTo(undefined);
		parent.postMessage(
			{
				pluginMessage: {
					type: "apply-button-build-notes",
					payload: { mode: "append" },
				},
			},
			parentOrigin
		);
	};

	const handleWriteButtonBuildNotesToDesignAssistant = () => {
		setButtonNotesStatus("applying");
		setButtonNotesError(undefined);
		setButtonNotesAppliedTo(undefined);
		parent.postMessage(
			{
				pluginMessage: {
					type: "apply-button-build-notes-to-node",
					payload: { nodeId: "2002:712", mode: "replace" },
				},
			},
			parentOrigin
		);
	};

	const handleWriteTextFieldBuildNotesToDesignAssistant = () => {
		setButtonNotesStatus("applying");
		setButtonNotesError(undefined);
		setButtonNotesAppliedTo(undefined);
		parent.postMessage(
			{
				pluginMessage: {
					type: "apply-textfield-build-notes-to-node",
					payload: { nodeId: "2002:712", mode: "replace" },
				},
			},
			parentOrigin
		);
	};

	const handleLoadAnnotationsSnapshot = async (
		e: ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setAnnotationsStatus("loading");
		setAnnotationsError(undefined);
		setAnnotationsApplyResult(undefined);

		try {
			const text = await file.text();
			const parsed = JSON.parse(text);
			if (
				parsed?.schemaVersion !== "soloist-os.annotations.snapshot.v1"
			) {
				throw new Error(
					"Invalid snapshot (expected schemaVersion soloist-os.annotations.snapshot.v1)."
				);
			}
			setAnnotationsSnapshot(parsed as AnnotationsSnapshotV1);
			setAnnotationsStatus("ready");
		} catch (err: any) {
			setAnnotationsStatus("error");
			setAnnotationsError(err?.message ?? String(err));
		}
		// Allow re-uploading the same file.
		e.target.value = "";
	};

	const postApplyAnnotationsSnapshot = () => {
		if (!annotationsSnapshot) return;
		setAnnotationsStatus("applying");
		setAnnotationsError(undefined);
		setAnnotationsApplyResult(undefined);
		parent.postMessage(
			{
				pluginMessage: {
					type: "apply-annotations-snapshot",
					payload: {
						snapshot: annotationsSnapshot,
						mode: "replace",
					},
				},
			},
			parentOrigin
		);
	};

	const handleCopy = () => {
		let code = "";
		if (format === "css") code = generateCSS(ctx);
		if (format === "json") code = generateJSON(ctx);
		if (format === "tailwind") code = generateTailwind(ctx);
		if (format === "swift") code = generateSwift(ctx);
		copy(code, "Code");
	};

	const getCode = () => {
		if (format === "css") return generateCSS(ctx);
		if (format === "json") return generateJSON(ctx);
		if (format === "tailwind") return generateTailwind(ctx);
		if (format === "swift") return generateSwift(ctx);
		return "";
	};

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const { type, message } = event.data.pluginMessage || {};
			if (type === "sync-complete") {
				setSyncStatus("success");
				setTimeout(() => setSyncStatus("idle"), 2000);
			}
			if (type === "sync-error") {
				setSyncStatus("idle");
				console.error("Sync error:", message);
			}
			if (type === "variables-snapshot-ready") {
				const payload = event.data.pluginMessage?.payload;
				const exportedAt = payload?.meta?.exportedAt
					? String(payload.meta.exportedAt)
					: new Date().toISOString();
				const fileNameBase = payload?.meta?.fileName
					? String(payload.meta.fileName)
					: "figma-file";
				const fileKey = payload?.meta?.fileKey
					? String(payload.meta.fileKey)
					: "no-fileKey";
				const stamp = exportedAt.replace(/[:.]/g, "-");
				const filename = sanitizeFilename(
					`variables-snapshot__${fileNameBase}__${fileKey}__${stamp}.json`
				);

				try {
					downloadJson(filename, payload);
					setSnapshotStatus("success");
					const issues = Array.isArray(payload?.issues)
						? payload.issues
						: [];
					const errorCount = issues.filter(
						(i: any) => i?.severity === "error"
					).length;
					setSnapshotIssues(
						issues.slice(0, 8).map((i: any) => ({
							severity: i.severity,
							code: i.code,
							message: i.message,
							nodeName: i.nodeName,
						}))
					);
					setSnapshotSummary({
						collections: Number(payload?.counts?.collections ?? 0),
						variables: Number(payload?.counts?.variables ?? 0),
						fileName: String(payload?.meta?.fileName ?? ""),
						issueCount: issues.length,
						errorCount,
					});
					setTimeout(() => setSnapshotStatus("idle"), 2500);
				} catch (e: any) {
					setSnapshotStatus("error");
					setSnapshotError(e?.message ?? String(e));
				}
			}
			if (type === "variables-snapshot-error") {
				setSnapshotStatus("error");
				setSnapshotError(message || "Unknown error");
			}
			if (type === "annotations-snapshot-ready") {
				const payload = event.data.pluginMessage?.payload;
				const exportedAt = payload?.meta?.exportedAt
					? String(payload.meta.exportedAt)
					: new Date().toISOString();
				const fileNameBase = payload?.meta?.fileName
					? String(payload.meta.fileName)
					: "figma-file";
				const fileKey = payload?.meta?.fileKey
					? String(payload.meta.fileKey)
					: "no-fileKey";
				const stamp = exportedAt.replace(/[:.]/g, "-");
				const filename = sanitizeFilename(
					`annotations-snapshot__${fileNameBase}__${fileKey}__${stamp}.json`
				);

				try {
					downloadJson(filename, payload);
					setAnnotationsSnapshot(payload as AnnotationsSnapshotV1);
					setAnnotationsStatus("exported");
					setTimeout(() => setAnnotationsStatus("idle"), 2500);
				} catch (e: any) {
					setAnnotationsStatus("error");
					setAnnotationsError(e?.message ?? String(e));
				}
			}
			if (type === "annotations-snapshot-error") {
				setAnnotationsStatus("error");
				setAnnotationsError(message || "Unknown error");
			}
			if (type === "icon-contract-ready") {
				const payload = event.data.pluginMessage?.payload;
				const exportedAt = payload?.meta?.exportedAt
					? String(payload.meta.exportedAt)
					: new Date().toISOString();
				const fileNameBase = payload?.meta?.fileName
					? String(payload.meta.fileName)
					: "figma-file";
				const fileKey = payload?.meta?.fileKey
					? String(payload.meta.fileKey)
					: "no-fileKey";
				const stamp = exportedAt.replace(/[:.]/g, "-");
				const filename = sanitizeFilename(
					`Icon.contract__${fileNameBase}__${fileKey}__${stamp}.json`
				);

				try {
					downloadJson(filename, payload);
					setIconContractStatus("success");
					const issues = Array.isArray(payload?.issues)
						? payload.issues
						: [];
					setIconContractIssuePreview(
						issues.slice(0, 6).map((i: any) => ({
							severity: String(i?.severity ?? "info"),
							code: String(i?.code ?? ""),
							message: String(i?.message ?? ""),
							nodeName:
								typeof i?.nodeName === "string"
									? i.nodeName
									: undefined,
						}))
					);
					setTimeout(() => setIconContractStatus("idle"), 2500);
				} catch (e: any) {
					setIconContractStatus("error");
					setIconContractError(e?.message ?? String(e));
				}
			}
			if (type === "icon-contract-error") {
				setIconContractStatus("error");
				setIconContractError(message || "Unknown error");
				setTimeout(() => setIconContractStatus("idle"), 5000);
			}
			if (type === "button-contract-ready") {
				const payload = event.data.pluginMessage?.payload;
				const exportedAt = payload?.meta?.exportedAt
					? String(payload.meta.exportedAt)
					: new Date().toISOString();
				const fileNameBase = payload?.meta?.fileName
					? String(payload.meta.fileName)
					: "figma-file";
				const fileKey = payload?.meta?.fileKey
					? String(payload.meta.fileKey)
					: "no-fileKey";
				const stamp = exportedAt.replace(/[:.]/g, "-");
				const filename = sanitizeFilename(
					`Button.contract__${fileNameBase}__${fileKey}__${stamp}.json`
				);

				try {
					downloadJson(filename, payload);
					setButtonContractStatus("success");
					const issues = Array.isArray(payload?.issues)
						? payload.issues
						: [];
					setButtonContractIssuePreview(
						issues.slice(0, 6).map((i: any) => ({
							severity: String(i?.severity ?? "info"),
							code: String(i?.code ?? ""),
							message: String(i?.message ?? ""),
							nodeName:
								typeof i?.nodeName === "string"
									? i.nodeName
									: undefined,
						}))
					);
					setTimeout(() => setButtonContractStatus("idle"), 2500);
				} catch (e: any) {
					setButtonContractStatus("error");
					setButtonContractError(e?.message ?? String(e));
				}
			}
			if (type === "button-contract-error") {
				setButtonContractStatus("error");
				setButtonContractError(message || "Unknown error");
				setTimeout(() => setButtonContractStatus("idle"), 5000);
			}
			if (type === "icon-glyphs-ready") {
				const payload = event.data.pluginMessage?.payload;
				const exportedAt = payload?.meta?.exportedAt
					? String(payload.meta.exportedAt)
					: new Date().toISOString();
				const fileNameBase = payload?.meta?.fileName
					? String(payload.meta.fileName)
					: "figma-file";
				const fileKey = payload?.meta?.fileKey
					? String(payload.meta.fileKey)
					: "no-fileKey";
				const stamp = exportedAt.replace(/[:.]/g, "-");
				const filename = sanitizeFilename(
					`Icon.glyphs__${fileNameBase}__${fileKey}__${stamp}.json`
				);

				try {
					downloadJson(filename, payload);
					setIconGlyphsData(payload);
					setIconGlyphsStatus("success");
					setTimeout(() => setIconGlyphsStatus("idle"), 2500);
				} catch (e: any) {
					setIconGlyphsStatus("error");
					setIconGlyphsError(e?.message ?? String(e));
				}
			}
			if (type === "icon-glyphs-error") {
				setIconGlyphsStatus("error");
				setIconGlyphsError(message || "Unknown error");
				setTimeout(() => setIconGlyphsStatus("idle"), 5000);
			}
			if (type === "button-notes-applied") {
				const payload = event.data.pluginMessage?.payload;
				setButtonNotesAppliedTo(
					payload && typeof payload?.nodeId === "string"
						? {
								nodeId: payload.nodeId,
								nodeName:
									typeof payload?.nodeName === "string"
										? payload.nodeName
										: undefined,
								nodeType:
									typeof payload?.nodeType === "string"
										? payload.nodeType
										: undefined,
						  }
						: undefined
				);
				setButtonNotesStatus("success");
				setTimeout(() => setButtonNotesStatus("idle"), 3000);
			}
			if (type === "button-notes-error") {
				setButtonNotesStatus("error");
				setButtonNotesError(message || "Unknown error");
				setTimeout(() => setButtonNotesStatus("idle"), 5000);
			}
			if (type === "annotations-apply-result") {
				const payload = event.data.pluginMessage
					?.payload as ApplyAnnotationsResultV1;
				setAnnotationsApplyResult(payload);
				setAnnotationsStatus("success");
				setTimeout(() => setAnnotationsStatus("idle"), 3000);
			}
			if (type === "annotations-apply-error") {
				setAnnotationsStatus("error");
				setAnnotationsError(message || "Unknown error");
				setTimeout(() => setAnnotationsStatus("idle"), 5000);
			}
			if (type === "mode-renames-result") {
				const payload = event.data.pluginMessage
					?.payload as ModeRenameResult;
				setModeRenameResult(payload);
				setModeRenameStatus("success");

				// Auto-download a report only when actually applying changes.
				const dryRun = Boolean(payload?.meta?.dryRun);
				if (!dryRun) {
					const ranAt = payload?.meta?.ranAt
						? String(payload.meta.ranAt)
						: new Date().toISOString();
					const fileNameBase = payload?.meta?.currentFileName
						? String(payload.meta.currentFileName)
						: "figma-file";
					const stamp = ranAt.replace(/[:.]/g, "-");
					const filename = sanitizeFilename(
						`mode-renames-result__${fileNameBase}__${stamp}.json`
					);
					try {
						downloadJson(filename, payload);
					} catch {
						// Non-fatal: user still sees results in the UI.
					}
				}

				setTimeout(() => setModeRenameStatus("idle"), 3000);
			}
			if (type === "mode-renames-error") {
				setModeRenameStatus("error");
				setModeRenameError(message || "Unknown error");
			}
			if (type === "seed-starter-kit-result") {
				setSeedStatus("success");
				setSeedError(undefined);
				setSeedResult(event.data.pluginMessage?.payload as SeedResult);
				// Auto-run the checklist right after seeding for instant reassurance.
				parent.postMessage(
					{ pluginMessage: { type: "validate-soloist-starter-kit" } },
					parentOrigin
				);
				setTimeout(() => setSeedStatus("idle"), 3000);
			}
			if (type === "seed-starter-kit-error") {
				setSeedStatus("error");
				setSeedError(message || "Unknown error");
				setTimeout(() => setSeedStatus("idle"), 4000);
			}
			if (type === "starter-kit-validation-result") {
				const payload = event.data.pluginMessage
					?.payload as StarterKitValidationResult;
				setChecklistResult(payload);
				setChecklistError(undefined);
				setChecklistStatus(payload?.ok ? "ok" : "missing");
				setTimeout(() => setChecklistStatus("idle"), 4000);
			}
			if (type === "starter-kit-validation-error") {
				setChecklistStatus("error");
				setChecklistError(message || "Unknown error");
				setTimeout(() => setChecklistStatus("idle"), 5000);
			}
		};

		globalThis.addEventListener("message", handleMessage);
		return () => globalThis.removeEventListener("message", handleMessage);
	}, [parentOrigin]);

	const handleValidateStarterKit = () => {
		setChecklistStatus("checking");
		setChecklistError(undefined);
		setChecklistResult(undefined);
		parent.postMessage(
			{ pluginMessage: { type: "validate-soloist-starter-kit" } },
			parentOrigin
		);
	};

	const handleSeedStarterKit = () => {
		setSeedStatus("seeding");
		setSeedError(undefined);
		setSeedResult(undefined);
		parent.postMessage(
			{
				pluginMessage: {
					type: "seed-soloist-starter-kit",
					payload: { overwriteExistingValues: seedOverwrite },
				},
			},
			parentOrigin
		);
	};

	const seedButtonClass = (() => {
		if (seedStatus === "success")
			return "bg-green-500/10 text-green-400 border-green-500/30";
		if (seedStatus === "error")
			return "bg-red-500/10 text-red-400 border-red-500/30";
		return "bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30";
	})();

	const seedButtonLabel = (() => {
		if (seedStatus === "seeding") return "SEEDING...";
		if (seedStatus === "success") return "SEEDED";
		if (seedStatus === "error") return "SEED FAILED";
		return "SEED STARTER KIT";
	})();

	const checklistButtonClass = (() => {
		if (checklistStatus === "ok")
			return "bg-green-500/10 text-green-400 border-green-500/30";
		if (checklistStatus === "missing")
			return "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
		if (checklistStatus === "error")
			return "bg-red-500/10 text-red-400 border-red-500/30";
		return "bg-white/5 hover:bg-white/10 text-gray-200 border-white/10";
	})();

	const checklistButtonLabel = (() => {
		if (checklistStatus === "checking") return "CHECKING...";
		if (checklistStatus === "ok") return "CHECKLIST OK";
		if (checklistStatus === "missing") return "CHECKLIST: MISSING";
		if (checklistStatus === "error") return "CHECKLIST ERROR";
		return "RUN CHECKLIST";
	})();

	const annotationsExportButtonClass = (() => {
		if (annotationsStatus === "exporting")
			return "bg-white/5 text-gray-300 border-white/10";
		if (annotationsStatus === "error")
			return "bg-red-500/10 text-red-400 border-red-500/30";
		if (annotationsStatus === "success" || annotationsStatus === "exported")
			return "bg-green-500/10 text-green-400 border-green-500/30";
		return "bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30";
	})();

	const annotationsExportButtonLabel = (() => {
		if (annotationsStatus === "exporting") return "EXPORTING...";
		if (annotationsStatus === "exported") return "SNAPSHOT SAVED";
		return "EXPORT ANNOTATIONS";
	})();

	const annotationsApplyButtonLabel = (() => {
		if (annotationsStatus === "applying") return "APPLYING...";
		return "APPLY (REPLACE)";
	})();

	const missingCollections = checklistResult?.missing?.collections ?? [];
	const missingVariables = checklistResult?.missing?.variables ?? [];
	const missingEffectStyles = checklistResult?.missing?.effectStyles ?? [];
	const missingTextStyles = checklistResult?.missing?.textStyles ?? [];

	const handleSync = () => {
		setSyncStatus("syncing");

		// 1. Prepare Colors
		// Flatten all ramps into a single list
		const allRamps = {
			primary: ctx.ramp,
			secondary: ctx.secondaryRamp,
			tertiary: ctx.tertiaryRamp,
			neutral: ctx.neutralRamp,
			signal: ctx.signalRamp,
			alpha: ctx.alphaRamp,
		};
		const colors: { name: string; hex: string }[] = [];
		Object.values(allRamps).forEach((list) => {
			if (Array.isArray(list)) {
				list.forEach((t: any) => {
					colors.push({ name: t.name, hex: t.hex });
				});
			}
		});

		// 2. Prepare Spacing
		const spacingSteps = [1, 2, 4, 6, 8, 12, 16, 24, 32];
		const stepNames = [
			"xs",
			"sm",
			"md",
			"lg",
			"xl",
			"2xl",
			"3xl",
			"4xl",
			"5xl",
		];
		const spacingVariables = stepNames.map((name, i) => ({
			name: name,
			value: spacingSteps[i] * ctx.baseSpacing,
		}));

		// 3. Prepare Text Styles
		const ratio = ctx.scale.ratio;
		const base = ctx.baseSize;
		const typeSteps = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
		const typeStyles = typeSteps.map((step, i) => {
			const power = i - 2; // xs(-2), sm(-1), base(0)
			const size = base * Math.pow(ratio, power);
			return {
				name: `Body/${step}`,
				fontSize: size,
				lineHeight: 1.5,
				fontFamily: "Inter",
				fontWeight: "Regular",
			};
		});

		const headingStyles = ["H1", "H2", "H3", "H4", "H5", "H6"].map(
			(h, i) => {
				const power = 6 - i; // H1(6) ... H6(1)
				const size = base * Math.pow(ratio, power);
				return {
					name: `Heading/${h}`,
					fontSize: size,
					lineHeight: 1.2,
					fontFamily: "Outfit",
					fontWeight: "Bold",
				};
			}
		);
		const allStyles = [...typeStyles, ...headingStyles];

		// 4. Semantics
		// Normalize token values to match primitive naming (replace - with /)
		const semantics = ctx.semanticTokens.map((t) => ({
			name: t.name,
			values: {
				light: t.values.light.replace("-", "/"),
				dark: t.values.dark.replace("-", "/"),
			},
		}));

		// Send to Plugin
		parent.postMessage(
			{
				pluginMessage: {
					type: "sync-everything",
					payload: {
						colors,
						spacing: spacingVariables,
						textStyles: allStyles,
						semantics,
					},
				},
			},
			parentOrigin
		);
	};

	return (
		<div className="h-full flex flex-col overflow-hidden">
			<header className="p-6 border-b border-glass-stroke bg-bg-void/50 backdrop-blur-sm flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-brand text-white tracking-wide">
						Connect
					</h1>
					<p className="text-gray-400 text-sm">
						Design-to-Code Pipeline
					</p>
				</div>
				<div className="flex bg-bg-surface p-1 rounded-lg border border-glass-stroke">
					<TabButton
						active={activeTab === "sync"}
						onClick={() => setActiveTab("sync")}
						icon={Share2}
						label="Sync"
					/>
					<TabButton
						active={activeTab === "export"}
						onClick={() => setActiveTab("export")}
						icon={TerminalIcon}
						label="Export Code"
					/>
				</div>
			</header>

			<div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 relative">
				<AnimatePresence mode="wait">
					{/* SYNC TAB */}
					{activeTab === "sync" && (
						<div
							key="sync"
							className="h-full flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto text-center"
						>
							<div className="relative">
								<div className="absolute inset-0 bg-accent-cyan/20 blur-[60px] rounded-full pointer-events-none" />
								<div className="relative z-10 w-24 h-24 bg-bg-raised border border-glass-stroke rounded-2xl flex items-center justify-center shadow-2xl">
									<div className="w-12 h-12 bg-[#F24E1E] rounded-xl flex items-center justify-center">
										{/* Figma generic icon shape */}
										<span className="font-brand text-white text-2xl">
											Fi
										</span>
									</div>
								</div>
								{/* Connector Line */}
								<div className="absolute top-1/2 left-24 w-16 h-px border-t border-dashed border-gray-600 -translate-y-1/2" />
							</div>

							<div className="space-y-4">
								<h2 className="text-2xl font-brand text-white">
									Sync to Figma
								</h2>
								<p className="text-gray-400">
									Push your <b>Global Design System</b> and{" "}
									<b>Collections</b> to the active Figma file.
									This will create or update variables for
									colors, spacing, and typography.
								</p>
							</div>

							<button
								onClick={handleSync}
								disabled={syncStatus === "syncing"}
								className={`flex items-center gap-3 px-8 py-4 rounded-full font-mono text-sm transition-all shadow-lg ${
									syncStatus === "success"
										? "bg-green-500 text-white"
										: "bg-white text-black hover:scale-105 hover:bg-accent-cyan hover:text-black"
								}`}
							>
								{syncStatus === "syncing" ? (
									<RefreshCw
										className="animate-spin"
										size={18}
									/>
								) : syncStatus === "success" ? (
									<Check size={18} />
								) : (
									<Zap size={18} />
								)}
								<span>
									{syncStatus === "syncing"
										? "SYNCING..."
										: syncStatus === "success"
										? "SYNC COMPLETE"
										: "PUSH TO FIGMA"}
								</span>
							</button>

							<div className="p-4 rounded-lg bg-bg-raised/50 border border-white/5 text-left w-full">
								<h3 className="text-xs font-mono text-gray-500 uppercase mb-2">
									Starter Kit (Seed tokens & styles)
								</h3>
								<p className="text-xs text-gray-400 leading-relaxed">
									One click to preload the Soloist Variable
									collections used by the design system
									(Color/Spacing/Radius/Typography) plus
									shadow effect styles. This is the “roadsign”
									layer: no guessing, no searching.
								</p>
								<details className="mt-3 p-3 rounded-lg bg-bg-void/30 border border-white/5">
									<summary className="cursor-pointer select-none text-[11px] font-mono text-gray-400 uppercase tracking-wide">
										What will change
									</summary>
									<div className="mt-2 text-xs text-gray-400 leading-relaxed space-y-2">
										<ul className="list-disc pl-5 space-y-1">
											<li>
												Creates missing collections and
												variables for the starter kit
												(non-destructive).
											</li>
											<li>
												Sets values in the collection’s
												default mode.
											</li>
											<li>
												May rename the collection’s
												default mode to{" "}
												<span className="text-gray-200">
													Default
												</span>
												, but does not delete other
												modes.
											</li>
											<li>
												Shadow effect styles (
												<span className="text-gray-200">
													shadow/*
												</span>
												) are treated as a contract and
												are overwritten to match the
												kit.
											</li>
											<li>
												Does not delete your custom
												variables or collections.
											</li>
										</ul>
										<div className="text-[11px] font-mono">
											{seedOverwrite ? (
												<span className="text-yellow-300">
													Overwrite is ON: existing
													starter-kit variable values
													in their expected
													collections will be
													replaced.
												</span>
											) : (
												<span className="text-gray-400">
													Overwrite is OFF: only
													missing default-mode values
													will be filled.
												</span>
											)}
										</div>
									</div>
								</details>
								<div className="mt-3 flex items-center justify-between gap-3">
									<label className="flex items-center gap-2 text-xs text-gray-300 select-none">
										<input
											type="checkbox"
											checked={seedOverwrite}
											onChange={(e) =>
												setSeedOverwrite(
													e.target.checked
												)
											}
											className="accent-accent-cyan"
										/>
										<span>
											Overwrite existing starter-kit
											values
										</span>
									</label>
									<button
										onClick={handleSeedStarterKit}
										disabled={seedStatus === "seeding"}
										className={`px-4 py-2 rounded-lg border transition-all text-[11px] uppercase tracking-wider font-semibold ${seedButtonClass}`}
									>
										{seedButtonLabel}
									</button>
								</div>
								<div className="mt-2 flex items-center justify-between gap-3">
									<div className="text-[11px] font-mono text-gray-500">
										Reassurance layer: verifies the exact
										starter-kit items exist.
									</div>
									<button
										onClick={handleValidateStarterKit}
										disabled={
											checklistStatus === "checking"
										}
										className={`px-3 py-2 rounded-lg border transition-all text-[11px] uppercase tracking-wider font-semibold ${checklistButtonClass}`}
									>
										{checklistButtonLabel}
									</button>
								</div>
								{seedResult && seedStatus !== "error" && (
									<div className="mt-2 text-[11px] font-mono text-gray-400">
										Collections: +
										{seedResult.collections.created},
										Variables: +
										{seedResult.variables.created}, Shadow
										styles: +
										{seedResult.effectStyles.created}, Text
										styles: +{seedResult.textStyles.created}
									</div>
								)}
								{seedError && (
									<div className="mt-2 text-[11px] font-mono text-red-400">
										{seedError}
									</div>
								)}
								{checklistResult &&
									checklistStatus !== "error" && (
										<div className="mt-2 text-[11px] font-mono text-gray-400">
											{checklistResult.ok ? (
												<span className="text-green-400">
													All starter kit boxes
													checked.
												</span>
											) : (
												<span className="text-yellow-300">
													Missing:{" "}
													{
														checklistResult.missing
															.collections.length
													}{" "}
													collection(s),{" "}
													{
														checklistResult.missing
															.variables.length
													}{" "}
													variable(s),{" "}
													{
														checklistResult.missing
															.effectStyles.length
													}{" "}
													shadow style(s),{" "}
													{
														checklistResult.missing
															.textStyles.length
													}{" "}
													text style(s).
												</span>
											)}
										</div>
									)}
								{checklistResult && !checklistResult.ok && (
									<div className="mt-2 p-3 rounded-lg bg-bg-void/20 border border-white/5">
										<div className="text-[11px] font-mono text-gray-500 uppercase tracking-wide mb-2">
											Missing items (details)
										</div>
										<div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
											<div>
												<div className="text-[11px] font-mono text-gray-400 mb-1">
													Collections
												</div>
												{missingCollections.length ===
												0 ? (
													<div className="text-gray-500">
														None
													</div>
												) : (
													<ul className="max-h-32 overflow-auto pr-1 space-y-1 text-gray-300">
														{missingCollections.map(
															(c) => (
																<li
																	key={c}
																	className="font-mono"
																>
																	{c}
																</li>
															)
														)}
													</ul>
												)}
											</div>
											<div>
												<div className="text-[11px] font-mono text-gray-400 mb-1">
													Variables
												</div>
												{missingVariables.length ===
												0 ? (
													<div className="text-gray-500">
														None
													</div>
												) : (
													<ul className="max-h-32 overflow-auto pr-1 space-y-1 text-gray-300">
														{missingVariables.map(
															(v) => (
																<li
																	key={`${v.collectionName}::${v.name}`}
																	className="font-mono"
																>
																	{
																		v.collectionName
																	}{" "}
																	/ {v.name}
																</li>
															)
														)}
													</ul>
												)}
											</div>
											<div>
												<div className="text-[11px] font-mono text-gray-400 mb-1">
													Shadow styles
												</div>
												{missingEffectStyles.length ===
												0 ? (
													<div className="text-gray-500">
														None
													</div>
												) : (
													<ul className="max-h-32 overflow-auto pr-1 space-y-1 text-gray-300">
														{missingEffectStyles.map(
															(s) => (
																<li
																	key={s}
																	className="font-mono"
																>
																	{s}
																</li>
															)
														)}
													</ul>
												)}
												<div>
													<div className="text-[11px] font-mono text-gray-400 mb-1">
														Text styles
													</div>
													{missingTextStyles.length ===
													0 ? (
														<div className="text-gray-500">
															None
														</div>
													) : (
														<ul className="max-h-32 overflow-auto pr-1 space-y-1 text-gray-300">
															{missingTextStyles.map(
																(s) => (
																	<li
																		key={s}
																		className="font-mono"
																	>
																		{s}
																	</li>
																)
															)}
														</ul>
													)}
												</div>
											</div>
										</div>
										<div className="mt-2 text-[11px] font-mono text-gray-500">
											Tip: run{" "}
											<span className="text-gray-300">
												SEED STARTER KIT
											</span>{" "}
											to create what’s missing, then run
											the checklist again.
										</div>
									</div>
								)}
								{checklistError && (
									<div className="mt-2 text-[11px] font-mono text-red-400">
										{checklistError}
									</div>
								)}
							</div>

							<div className="p-4 rounded-lg bg-bg-raised/50 border border-white/5 text-left w-full">
								<h3 className="text-xs font-mono text-gray-500 uppercase mb-2">
									Payload Summary
								</h3>
								<ul className="text-xs text-gray-400 space-y-1">
									<li className="flex items-center gap-2">
										<div className="w-1.5 h-1.5 bg-accent-cyan rounded-full" />{" "}
										Global Color Ramps (Primary,
										Secondary...)
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1.5 h-1.5 bg-accent-cyan rounded-full" />{" "}
										Typography Scale (
										{ctx.scale?.name || "Scale"})
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1.5 h-1.5 bg-accent-cyan rounded-full" />{" "}
										Spacing System (Base: {ctx.baseSpacing}
										px)
									</li>
									{/* Placeholder for future collection support */}
									<li className="flex items-center gap-2">
										<div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />{" "}
										{ctx.settings?.library?.collections
											?.length || 0}{" "}
										Custom Collections
									</li>
								</ul>
							</div>
						</div>
					)}

					{/* EXPORT TAB (Reused ExportTerminal UI) */}
					{activeTab === "export" && (
						<div
							key="export"
							className="h-full flex flex-col gap-6"
						>
							<div className="flex items-center justify-between">
								<div className="flex bg-bg-surface p-1 rounded-lg border border-glass-stroke shadow-inner">
									<FormatTab
										active={format === "css"}
										onClick={() => setFormat("css")}
										label="CSS"
										icon={FileCode}
									/>
									<FormatTab
										active={format === "json"}
										onClick={() => setFormat("json")}
										label="JSON"
										icon={FileJson}
									/>
									<FormatTab
										active={format === "tailwind"}
										onClick={() => setFormat("tailwind")}
										label="Tailwind"
										icon={Wind}
									/>
									<FormatTab
										active={format === "swift"}
										onClick={() => setFormat("swift")}
										label="Swift"
										icon={FileCode}
									/>
								</div>
								<div className="flex items-center gap-3">
									<button
										onClick={handleExportVariablesSnapshot}
										disabled={
											snapshotStatus === "exporting"
										}
										className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all text-xs uppercase tracking-wider font-semibold ${
											snapshotStatus === "success"
												? "bg-green-500/10 text-green-400 border-green-500/30"
												: snapshotStatus === "error"
												? "bg-red-500/10 text-red-400 border-red-500/30"
												: "bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30"
										}`}
									>
										<Download size={14} />
										<span>
											{snapshotStatus === "exporting"
												? "EXPORTING..."
												: snapshotStatus === "success"
												? "SNAPSHOT SAVED"
												: "EXPORT SNAPSHOT"}
										</span>
									</button>
									<button
										onClick={handleCopy}
										className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-all text-xs uppercase tracking-wider font-semibold"
									>
										{isCopied ? (
											<Check size={14} />
										) : (
											<Copy size={14} />
										)}
										<span>
											{isCopied ? "COPIED" : "COPY CODE"}
										</span>
									</button>
								</div>
							</div>
							{(snapshotSummary || snapshotError) && (
								<div className="text-xs font-mono text-gray-500">
									{snapshotSummary &&
										snapshotStatus !== "error" && (
											<span>
												Exported{" "}
												{snapshotSummary.collections}{" "}
												collections,{" "}
												{snapshotSummary.variables}{" "}
												variables
												{snapshotSummary.fileName
													? ` from ${snapshotSummary.fileName}`
													: ""}
												{typeof snapshotSummary.issueCount ===
													"number" &&
												snapshotSummary.issueCount > 0
													? ` — ${
															snapshotSummary.issueCount
													  } issue(s) (${
															snapshotSummary.errorCount ??
															0
													  } error).`
													: "."}
											</span>
										)}
									{snapshotError && (
										<span className="text-red-400">
											Snapshot export error:{" "}
											{snapshotError}
										</span>
									)}
								</div>
							)}
							{snapshotIssues && snapshotIssues.length > 0 && (
								<div className="mt-2 p-3 rounded-lg bg-bg-raised/30 border border-white/5">
									<div className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-2">
										Detected issues (preview)
									</div>
									<ul className="text-xs text-gray-300 space-y-1">
										{snapshotIssues.map((i) => (
											<li
												key={`${i.severity}|${i.code}|${
													i.nodeName ?? ""
												}|${i.message}`}
												className="flex gap-2"
											>
												<span
													className={
														i.severity === "error"
															? "text-red-400"
															: i.severity ===
															  "warning"
															? "text-yellow-400"
															: "text-gray-400"
													}
												>
													[{i.severity}]
												</span>
												<span>
													{i.nodeName
														? `${i.nodeName}: `
														: ""}
													{i.message}
												</span>
											</li>
										))}
									</ul>
								</div>
							)}
							<div className="mt-4 p-4 rounded-xl bg-bg-raised/30 border border-white/5">
								<div className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-3">
									Contract annotations snapshot (TEXT in
									__annotations)
								</div>
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3 flex-wrap">
										<button
											onClick={
												handleExportAnnotationsSnapshot
											}
											disabled={
												annotationsStatus ===
												"exporting"
											}
											className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all text-[11px] uppercase tracking-wider font-semibold ${annotationsExportButtonClass}`}
										>
											<Download size={14} />
											<span>
												{annotationsExportButtonLabel}
											</span>
										</button>

										<div className="flex items-center gap-2 flex-wrap">
											<input
												type="file"
												accept="application/json,.json"
												onChange={
													handleLoadAnnotationsSnapshot
												}
												aria-label="Annotations snapshot JSON"
												className="text-xs text-gray-300"
											/>
											<button
												onClick={
													postApplyAnnotationsSnapshot
												}
												disabled={
													!annotationsSnapshot ||
													annotationsStatus ===
														"applying"
												}
												className="flex items-center gap-2 px-3 py-2 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 hover:bg-accent-cyan/20 transition-all text-[11px] uppercase tracking-wider font-semibold text-accent-cyan disabled:opacity-40 disabled:cursor-default"
											>
												<Upload size={14} />
												<span>
													{
														annotationsApplyButtonLabel
													}
												</span>
											</button>
										</div>
									</div>

									{annotationsSnapshot && (
										<div className="text-xs font-mono text-gray-500">
											Loaded snapshot:{" "}
											{
												annotationsSnapshot.annotations
													.length
											}{" "}
											annotation container(s)
										</div>
									)}
									{annotationsApplyResult?.summary && (
										<div className="text-xs font-mono text-gray-300">
											Applied to page{" "}
											{
												annotationsApplyResult.meta
													.pageName
											}
											:{" "}
											{
												annotationsApplyResult.summary
													.created
											}{" "}
											created,{" "}
											{
												annotationsApplyResult.summary
													.deleted
											}{" "}
											removed
											{typeof annotationsApplyResult
												.summary.targetsApplied ===
											"number"
												? `, ${annotationsApplyResult.summary.targetsApplied} target(s)`
												: ""}
											{typeof annotationsApplyResult
												.summary.framesCreated ===
												"number" &&
											annotationsApplyResult.summary
												.framesCreated > 0
												? `, ${annotationsApplyResult.summary.framesCreated} __annotations frame(s) created`
												: ""}
											{typeof annotationsApplyResult
												.summary.skipped === "number" &&
											annotationsApplyResult.summary
												.skipped > 0
												? `, ${annotationsApplyResult.summary.skipped} skipped`
												: ""}
											.
										</div>
									)}
									{annotationsApplyResult?.issues &&
										annotationsApplyResult.issues.length >
											0 && (
											<div className="text-xs font-mono text-yellow-300">
												{
													annotationsApplyResult
														.issues[0].message
												}
											</div>
										)}
									{annotationsError && (
										<div className="text-xs font-mono text-red-400">
											Annotations error:{" "}
											{annotationsError}
										</div>
									)}
								</div>
							</div>
							<div className="mt-4 p-4 rounded-xl bg-bg-raised/30 border border-white/5">
								<div className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-3">
									Primitive contract: Icon
								</div>
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3 flex-wrap">
										<button
											onClick={handleExportIconContract}
											disabled={
												iconContractStatus ===
												"exporting"
											}
											className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all text-[11px] uppercase tracking-wider font-semibold ${
												iconContractStatus === "success"
													? "bg-green-500/10 text-green-400 border-green-500/30"
													: iconContractStatus ===
													  "error"
													? "bg-red-500/10 text-red-400 border-red-500/30"
													: "bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30"
											}`}
										>
											<Download size={14} />
											<span>
												{iconContractStatus ===
												"exporting"
													? "EXPORTING..."
													: iconContractStatus ===
													  "success"
													? "CONTRACT SAVED"
													: "EXPORT ICON CONTRACT"}
											</span>
										</button>
										<div className="text-xs font-mono text-gray-500">
											Select the Icon component (or
											component set) before exporting.
										</div>
									</div>

									{iconContractIssuePreview.length > 0 && (
										<div className="mt-1 p-3 rounded-lg bg-bg-raised/20 border border-white/5">
											<div className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-2">
												Detected issues (preview)
											</div>
											<ul className="text-xs text-gray-300 space-y-1">
												{iconContractIssuePreview.map(
													(i) => (
														<li
															key={`${
																i.severity
															}|${i.code}|${
																i.nodeName ?? ""
															}|${i.message}`}
															className="flex gap-2"
														>
															<span
																className={
																	i.severity ===
																	"error"
																		? "text-red-400"
																		: i.severity ===
																		  "warning"
																		? "text-yellow-400"
																		: "text-gray-400"
																}
															>
																[{i.severity}]
															</span>
															<span>
																{i.nodeName
																	? `${i.nodeName}: `
																	: ""}
																{i.message}
															</span>
														</li>
													)
												)}
											</ul>
										</div>
									)}
									{iconContractError && (
										<div className="text-xs font-mono text-red-400">
											Icon contract export error:{" "}
											{iconContractError}
										</div>
									)}
								</div>
							</div>
							<div className="mt-4 p-4 rounded-xl bg-bg-raised/30 border border-white/5">
								<div className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-3">
									Icon glyph inventory
								</div>
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3 flex-wrap">
										<button
											onClick={handleExportIconGlyphs}
											disabled={
												iconGlyphsStatus === "exporting"
											}
											className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all text-[11px] uppercase tracking-wider font-semibold ${
												iconGlyphsStatus === "success"
													? "bg-green-500/10 text-green-400 border-green-500/30"
													: iconGlyphsStatus ===
													  "error"
													? "bg-red-500/10 text-red-400 border-red-500/30"
													: "bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30"
											}`}
										>
											<Download size={14} />
											<span>
												{iconGlyphsStatus ===
												"exporting"
													? "EXPORTING..."
													: iconGlyphsStatus ===
													  "success"
													? "GLYPHS EXPORTED"
													: "EXPORT ICON GLYPHS"}
											</span>
										</button>
										<div className="text-xs font-mono text-gray-500">
											Select the Icon component set before
											exporting.
										</div>
									</div>

									{iconGlyphsData && (
										<div className="mt-1 p-3 rounded-lg bg-bg-raised/20 border border-white/5">
											<div className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-2">
												{iconGlyphsData.glyphs
													?.length ?? 0}{" "}
												glyphs detected
											</div>
											<div className="text-xs text-gray-300 max-h-32 overflow-y-auto space-y-1">
												{iconGlyphsData.glyphs?.map(
													(g: any) => (
														<div
															key={g.componentKey}
															className="font-mono"
														>
															{g.componentName}
														</div>
													)
												)}
											</div>
										</div>
									)}
									{iconGlyphsError && (
										<div className="text-xs font-mono text-red-400">
											Icon glyph export error:{" "}
											{iconGlyphsError}
										</div>
									)}
								</div>
							</div>
							<div className="mt-4 p-4 rounded-xl bg-bg-raised/30 border border-white/5">
								<div className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-3">
									Primitive contract: Button
								</div>
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3 flex-wrap">
										<button
											onClick={handleExportButtonContract}
											disabled={
												buttonContractStatus ===
												"exporting"
											}
											className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all text-[11px] uppercase tracking-wider font-semibold ${
												buttonContractStatus ===
												"success"
													? "bg-green-500/10 text-green-400 border-green-500/30"
													: buttonContractStatus ===
													  "error"
													? "bg-red-500/10 text-red-400 border-red-500/30"
													: "bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30"
											}`}
										>
											<Download size={14} />
											<span>
												{buttonContractStatus ===
												"exporting"
													? "EXPORTING..."
													: buttonContractStatus ===
													  "success"
													? "CONTRACT SAVED"
													: "EXPORT BUTTON CONTRACT"}
											</span>
										</button>
										<div className="text-xs font-mono text-gray-500">
											Select the Button component set
											before exporting.
										</div>
									</div>

									{buttonContractIssuePreview.length > 0 && (
										<div className="mt-1 p-3 rounded-lg bg-bg-raised/20 border border-white/5">
											<div className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-2">
												Detected issues (preview)
											</div>
											<ul className="text-xs text-gray-300 space-y-1">
												{buttonContractIssuePreview.map(
													(i) => (
														<li
															key={`${
																i.severity
															}|${i.code}|${
																i.nodeName ?? ""
															}|${i.message}`}
															className="flex gap-2"
														>
															<span
																className={
																	i.severity ===
																	"error"
																		? "text-red-400"
																		: i.severity ===
																		  "warning"
																		? "text-yellow-400"
																		: "text-gray-400"
																}
															>
																[{i.severity}]
															</span>
															<span>
																{i.nodeName
																	? `${i.nodeName}: `
																	: ""}
																{i.message}
															</span>
														</li>
													)
												)}
											</ul>
										</div>
									)}
									{buttonContractError && (
										<div className="text-xs font-mono text-red-400">
											Button contract export error:{" "}
											{buttonContractError}
										</div>
									)}
								</div>
							</div>
							<div className="mt-4 p-4 rounded-xl bg-bg-raised/30 border border-white/5">
								<div className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-3">
									Attach notes: Button
								</div>
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3 flex-wrap">
										<button
											onClick={
												handleApplyButtonBuildNotes
											}
											disabled={
												buttonNotesStatus === "applying"
											}
											className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all text-[11px] uppercase tracking-wider font-semibold ${buttonNotesStatusClass}`}
										>
											<Download size={14} />
											<span>
												{attachButtonNotesLabel}
											</span>
										</button>
										<div className="text-xs font-mono text-gray-500">
											Select the target layer (e.g.
											02_COMPONENTS → Button) then click.
										</div>
									</div>
									{buttonNotesAppliedTo?.nodeName && (
										<div className="text-xs font-mono text-gray-300">
											Applied to:{" "}
											{buttonNotesAppliedTo.nodeName}
											{buttonNotesAppliedTo.nodeType
												? ` (${buttonNotesAppliedTo.nodeType})`
												: ""}
										</div>
									)}
									{buttonNotesError && (
										<div className="text-xs font-mono text-red-400">
											Button notes error:{" "}
											{buttonNotesError}
										</div>
									)}
								</div>
							</div>
							<div className="mt-4 p-4 rounded-xl bg-bg-raised/30 border border-white/5">
								<div className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-3">
									Write instructions: designAssistant
								</div>
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3 flex-wrap">
										<button
											onClick={
												handleWriteButtonBuildNotesToDesignAssistant
											}
											disabled={
												buttonNotesStatus === "applying"
											}
											className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all text-[11px] uppercase tracking-wider font-semibold ${buttonNotesStatusClass}`}
										>
											<Download size={14} />
											<span>Button Instructions</span>
										</button>
										<button
											onClick={
												handleWriteTextFieldBuildNotesToDesignAssistant
											}
											disabled={
												buttonNotesStatus === "applying"
											}
											className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all text-[11px] uppercase tracking-wider font-semibold ${buttonNotesStatusClass}`}
										>
											<Download size={14} />
											<span>TextField Instructions</span>
										</button>
										<div className="text-xs font-mono text-gray-500">
											Writes into node 2002:712
											(designAssistant) text.
										</div>
									</div>
									<div className="text-xs font-mono text-gray-500">
										Note: this replaces the text content
										block so the instructions are always
										current.
									</div>
								</div>
							</div>
							<div className="mt-4 p-4 rounded-xl bg-bg-raised/30 border border-white/5">
								<div className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-3">
									Apply proposals: mode rename (Mode 1 →
									Default)
								</div>
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3">
										<input
											type="file"
											accept="application/json,.json"
											onChange={
												handleLoadModeRenameProposal
											}
											aria-label="Mode rename proposal JSON"
											className="text-xs text-gray-300"
										/>
										<div className="flex items-center gap-2">
											<button
												onClick={() =>
													postApplyModeRenames({
														dryRun: true,
													})
												}
												disabled={
													!modeRenameProposal ||
													modeRenameStatus ===
														"previewing" ||
													modeRenameStatus ===
														"applying" ||
													modeRenameStatus ===
														"loading"
												}
												className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-[11px] uppercase tracking-wider font-semibold text-gray-200 disabled:opacity-40 disabled:cursor-default"
											>
												{modeRenameStatus ===
												"previewing"
													? "PREVIEWING..."
													: "DRY RUN"}
											</button>
											<button
												onClick={() =>
													postApplyModeRenames({
														dryRun: false,
													})
												}
												disabled={
													!modeRenameProposal ||
													modeRenameStatus ===
														"previewing" ||
													modeRenameStatus ===
														"applying" ||
													modeRenameStatus ===
														"loading"
												}
												className="px-3 py-2 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 hover:bg-accent-cyan/20 transition-all text-[11px] uppercase tracking-wider font-semibold text-accent-cyan disabled:opacity-40 disabled:cursor-default"
											>
												{modeRenameStatus === "applying"
													? "APPLYING..."
													: "APPLY"}
											</button>
										</div>
									</div>

									{modeRenameProposal && (
										<div className="text-xs font-mono text-gray-500">
											Loaded proposal:{" "}
											{modeRenameProposal.changes.length}{" "}
											change(s)
											{modeRenameProposal.schemaVersion
												? ` — ${modeRenameProposal.schemaVersion}`
												: ""}
										</div>
									)}

									{modeRenameError && (
										<div className="text-xs font-mono text-red-400">
											Mode rename error: {modeRenameError}
										</div>
									)}

									{modeRenameResult?.summary && (
										<div className="text-xs font-mono text-gray-300">
											{modeRenameResult?.meta?.dryRun
												? "Dry run"
												: "Applied"}{" "}
											for
											{modeRenameResult?.meta
												?.currentFileName
												? ` ${modeRenameResult.meta.currentFileName}`
												: " current file"}
											: {modeRenameResult.summary.applied}{" "}
											{modeRenameResult?.meta?.dryRun
												? "planned"
												: "renamed"}
											, {modeRenameResult.summary.skipped}{" "}
											skipped,{" "}
											{modeRenameResult.summary.errors}{" "}
											error(s).
										</div>
									)}

									{modeRenameItems.length > 0 && (
										<div className="mt-2 p-3 rounded-lg bg-bg-raised/20 border border-white/5">
											<div className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-2">
												Mode rename details (preview)
											</div>
											<ul className="text-xs text-gray-300 space-y-1">
												{modeRenameItems
													.slice(0, 8)
													.map((it) => (
														<li
															key={`${it.collectionId}|${it.modeId}|${it.status}|${it.toName}`}
															className="flex gap-2"
														>
															<span
																className={
																	it.status ===
																	"error"
																		? "text-red-400"
																		: it.status ===
																		  "skipped"
																		? "text-yellow-400"
																		: "text-green-400"
																}
															>
																[{it.status}]
															</span>
															<span>
																{it.message}
															</span>
														</li>
													))}
											</ul>
											{modeRenameItems.length > 8 && (
												<div className="mt-2 text-[11px] text-gray-500">
													Showing first 8 of{" "}
													{modeRenameItems.length}{" "}
													item(s).
												</div>
											)}
										</div>
									)}
								</div>
							</div>
							<div className="flex-1 rounded-xl bg-[#0d0f14] border border-glass-stroke overflow-hidden flex flex-col shadow-monolith relative group">
								<div className="bg-[#151820] px-4 py-3 flex items-center gap-2 border-b border-white/5">
									<div className="flex gap-2">
										<div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
										<div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
										<div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
									</div>
									<div className="ml-4 flex items-center gap-2 text-xs text-gray-500 font-mono">
										<TerminalIcon size={12} />
										<span>
											soloist-export.
											{format === "tailwind"
												? "js"
												: format}
										</span>
									</div>
								</div>
								<div className="p-6 font-mono text-sm overflow-auto custom-scrollbar flex-1 relative">
									<pre className="text-gray-300">
										{getCode()}
									</pre>
								</div>
							</div>
						</div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
	<button
		onClick={onClick}
		className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-brand ${
			active
				? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 shadow-glow"
				: "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
		}`}
	>
		<Icon size={16} />
		<span>{label}</span>
	</button>
);

const FormatTab = ({ active, onClick, icon: Icon, label }: any) => (
	<button
		onClick={onClick}
		className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm font-mono ${
			active
				? "bg-bg-raised text-white shadow-md border border-white/5"
				: "text-gray-500 hover:text-gray-300"
		}`}
	>
		<Icon size={14} />
		<span>{label}</span>
	</button>
);
