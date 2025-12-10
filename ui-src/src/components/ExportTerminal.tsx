import { useState } from "react";
import {
	Copy,
	Check,
	Terminal as TerminalIcon,
	FileJson,
	FileCode,
	Wind,
} from "lucide-react";
import { SemanticToken } from "./SemanticMapper";

// Helper to flatten all color ramps into a single object
const flattenColors = (props: ExportTerminalProps) => {
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

// --- Generators ---

const generateCSS = (props: ExportTerminalProps) => {
	let css = `:root {\n  /* Colors */\n`;

	// Colors
	const colors = flattenColors(props);
	Object.entries(colors).forEach(([_, tokens]) => {
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

const generateTailwind = (props: ExportTerminalProps) => {
	const colors = flattenColors(props);
	const colorConfig: any = {};

	// Process colors
	Object.entries(colors).forEach(([group, tokens]) => {
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

const generateJSON = (props: ExportTerminalProps) => {
	const colors = flattenColors(props);
	const tokens: any = {
		color: {},
		size: {
			font: {},
			spacing: {},
			radius: {},
		},
	};

	// Colors
	Object.entries(colors).forEach(([group, list]) => {
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

const generateSwift = (props: ExportTerminalProps) => {
	const colors = flattenColors(props);
	let swift = `import SwiftUI\n\nextension Color {\n`;

	Object.entries(colors).forEach(([group, list]) => {
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

interface ExportTerminalProps {
	ramp: any[];
	secondaryRamp: any[];
	tertiaryRamp: any[];
	neutralRamp: any[];
	signalRamp: any[];
	alphaRamp: any[];
	baseSize: number;
	scale: { name: string; ratio: number };
	baseSpacing: number;
	baseRadius: number;
	semanticTokens: SemanticToken[];
}

export const ExportTerminal = (props: ExportTerminalProps) => {
	const [format, setFormat] = useState<"css" | "json" | "swift" | "tailwind">(
		"css"
	);
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		let code = "";
		if (format === "css") code = generateCSS(props);
		if (format === "json") code = generateJSON(props);
		if (format === "tailwind") code = generateTailwind(props);
		if (format === "swift") code = generateSwift(props);

		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const getCode = () => {
		if (format === "css") return generateCSS(props);
		if (format === "json") return generateJSON(props);
		if (format === "tailwind") return generateTailwind(props);
		if (format === "swift") return generateSwift(props);
		return "";
	};

	return (
		<div className="h-full flex flex-col gap-6">
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
				<button
					onClick={handleCopy}
					className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-all text-xs uppercase tracking-wider font-semibold"
				>
					{copied ? <Check size={14} /> : <Copy size={14} />}
					<span>{copied ? "COPIED" : "COPY CODE"}</span>
				</button>
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
							{format === "tailwind" ? "js" : format}
						</span>
					</div>
				</div>
				<div className="p-6 font-mono text-sm overflow-auto custom-scrollbar flex-1 relative">
					<pre className="text-gray-300">{getCode()}</pre>
				</div>
			</div>
		</div>
	);
};

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
