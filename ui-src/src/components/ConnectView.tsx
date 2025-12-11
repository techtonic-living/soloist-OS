import { useState } from "react";
import { AnimatePresence } from "framer-motion";
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

export const ConnectView = (props: any) => {
	const [activeTab, setActiveTab] = useState<"sync" | "export">("sync");
	const [format, setFormat] = useState<"css" | "json" | "swift" | "tailwind">(
		"css"
	);
	const [copied, setCopied] = useState(false);
	const [syncStatus, setSyncStatus] = useState<
		"idle" | "syncing" | "success"
	>("idle");

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

	const handleSync = () => {
		setSyncStatus("syncing");
		// Mock sync
		setTimeout(() => {
			setSyncStatus("success");
			setTimeout(() => setSyncStatus("idle"), 2000);
		}, 1500);
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

			<div className="flex-1 overflow-hidden p-6 relative">
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
										{props.scale?.name || "Scale"})
									</li>
									<li className="flex items-center gap-2">
										<div className="w-1.5 h-1.5 bg-accent-cyan rounded-full" />{" "}
										Spacing System (Base:{" "}
										{props.baseSpacing}px)
									</li>
									{/* Placeholder for future collection support */}
									<li className="flex items-center gap-2">
										<div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />{" "}
										{props.settings?.library?.collections
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
								<button
									onClick={handleCopy}
									className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-all text-xs uppercase tracking-wider font-semibold"
								>
									{copied ? (
										<Check size={14} />
									) : (
										<Copy size={14} />
									)}
									<span>
										{copied ? "COPIED" : "COPY CODE"}
									</span>
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
