import { useState, useMemo } from "react";
import { Moon, Sun, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { generateColorAdvice } from "../utils/aiLogic";

import { SemanticToken, DEFAULT_SEMANTICS } from "../data/semanticTokens";

interface SemanticMapperProps {
	ramp: { name: string; hex: string }[];
	secondaryRamp?: { name: string; hex: string }[];
	tertiaryRamp?: { name: string; hex: string }[];
	neutralRamp?: { name: string; hex: string }[];
	signalRamp?: { name: string; hex: string }[];
	alphaRamp?: { name: string; hex: string }[];
	tokens: SemanticToken[];
	setTokens: (tokens: SemanticToken[]) => void;
}

export const SemanticMapper = ({
	ramp,
	secondaryRamp = [],
	tertiaryRamp = [],
	neutralRamp = [],
	signalRamp = [],
	alphaRamp = [],
	tokens = DEFAULT_SEMANTICS,
	setTokens,
}: SemanticMapperProps) => {
	const [mode, setMode] = useState<"light" | "dark">("light");
	const [showAudit, setShowAudit] = useState(false);
	const [activeCategory, setActiveCategory] = useState<
		"primary" | "secondary" | "tertiary" | "neutrals" | "signals"
	>("primary");

	// Unified Lookup
	const allPrimitives = useMemo(() => {
		return [
			...ramp,
			...secondaryRamp,
			...tertiaryRamp,
			...neutralRamp,
			...signalRamp,
			...alphaRamp,
		];
	}, [ramp, secondaryRamp, tertiaryRamp, neutralRamp, signalRamp, alphaRamp]);

	const categorizedPrimitives = {
		primary: ramp,
		secondary: secondaryRamp,
		tertiary: tertiaryRamp,
		neutrals: neutralRamp,
		signals: signalRamp,
	};

	const handleAssign = (tokenName: string, primitiveName: string) => {
		const newTokens = tokens.map((t) => {
			if (t.name === tokenName) {
				return {
					...t,
					values: { ...t.values, [mode]: primitiveName },
				};
			}
			return t;
		});
		setTokens(newTokens);
	};

	// Helper to find hex for a primitive name
	const getHex = (name: string) =>
		allPrimitives.find((r) => r.name === name)?.hex || "transparent";

	// Audit Logic
	const getAuditResult = (token: SemanticToken) => {
		if (!showAudit) return null;

		// 1. Get the Hex of this token
		const currentVal = token.values[mode];
		const currentHex = getHex(currentVal);

		// 2. Identify Context (Background)
		// For Text/Icons, we compare against "bg-surface" or "bg-surface-raised"
		// This is a naive heuristic: Assuming mostly on "bg-surface"
		const bgTokenName = "bg-surface";
		const bgVal = tokens.find((t) => t.name === bgTokenName)?.values[mode];
		const bgHex = getHex(bgVal || "");

		// Only audit text/border elements, skip backgrounds themselves (comparing bg vs bg is weird unless borders)
		if (token.name.includes("bg-")) return null;

		return generateColorAdvice(currentHex, bgHex, "guide");
	};

	return (
		<div className="h-full grid grid-cols-12 gap-8">
			{/* Controls / Mapping List */}
			<div className="col-span-5 flex flex-col gap-6 border-r border-glass-stroke pr-6 overflow-y-auto custom-scrollbar">
				<div className="flex items-center justify-between">
					<h3 className="font-display text-xs text-gray-400 uppercase tracking-widest">
						Semantic Mapping
					</h3>
					<div className="flex gap-2">
						<button
							onClick={() => setShowAudit(!showAudit)}
							className={`p-1.5 rounded-md transition-all ${
								showAudit
									? "bg-accent-success/20 text-accent-success border border-accent-success/50"
									: "text-gray-500 hover:text-white"
							}`}
							title="Toggle Contextual Audit"
						>
							<ShieldCheck size={14} />
						</button>
						{/* Mode Toggle */}
						<div className="flex bg-bg-void p-1 rounded-lg border border-glass-stroke">
							<button
								onClick={() => setMode("light")}
								className={`p-1.5 rounded-md transition-all ${
									mode === "light"
										? "bg-bg-raised text-white shadow-sm"
										: "text-gray-600 hover:text-gray-400"
								}`}
							>
								<Sun size={14} />
							</button>
							<button
								onClick={() => setMode("dark")}
								className={`p-1.5 rounded-md transition-all ${
									mode === "dark"
										? "bg-bg-raised text-white shadow-sm"
										: "text-gray-600 hover:text-gray-400"
								}`}
							>
								<Moon size={14} />
							</button>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					{tokens.map((token) => {
						const currentVal = token.values[mode];
						const currentHex = getHex(currentVal);
						const audit = getAuditResult(token);

						return (
							<div
								key={token.name}
								className="p-4 rounded-xl bg-bg-void/50 border border-glass-stroke group hover:border-primary/30 transition-all"
							>
								<div className="flex justify-between items-start mb-3">
									<div>
										<h4 className="flex items-center gap-2 text-sm text-white font-medium font-mono">
											{token.name}
											{audit && (
												<span
													className={`text-[10px] px-1.5 py-0.5 rounded-full ${
														audit.status ===
														"success"
															? "bg-green-500/20 text-green-400"
															: audit.status ===
															  "warning"
															? "bg-yellow-500/20 text-yellow-400"
															: "bg-red-500/20 text-red-400"
													}`}
												>
													{audit.rating}
												</span>
											)}
										</h4>
										<p className="text-[10px] text-gray-500">
											{token.description}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-[10px] font-mono text-gray-400">
											{currentVal}
										</span>
										<div
											className="w-6 h-6 rounded-md border border-white/10 shadow-inner"
											style={{
												backgroundColor: currentHex,
											}}
										/>
									</div>
								</div>

								{/* Category Tabs for Primitive Picker */}
								<div className="flex gap-2 mb-2 overflow-x-auto pb-1 opacity-40 group-hover:opacity-100 transition-opacity">
									{[
										"primary",
										"secondary",
										"tertiary",
										"neutrals",
										"signals",
									].map((cat) => (
										<button
											key={cat}
											onClick={() =>
												setActiveCategory(cat as any)
											}
											className={`text-[9px] uppercase px-2 py-0.5 rounded border ${
												activeCategory === cat
													? "bg-white/10 border-white/30 text-white"
													: "border-transparent text-gray-500 hover:text-gray-300"
											}`}
										>
											{cat}
										</button>
									))}
								</div>

								{/* Primitive Picker Grid */}
								<div className="grid grid-cols-8 gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
									{categorizedPrimitives[activeCategory].map(
										(color: any) => (
											<button
												key={color.name}
												onClick={() =>
													handleAssign(
														token.name,
														color.name
													)
												}
												className={`aspect-square rounded-sm border transition-all ${
													currentVal === color.name
														? "border-white scale-110 shadow-lg z-10"
														: "border-transparent hover:border-white/50"
												}`}
												style={{
													backgroundColor: color.hex,
												}}
												title={color.name}
											/>
										)
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Live Preview */}
			<div className="col-span-7 flex flex-col">
				<h3 className="font-display text-xs text-gray-400 uppercase tracking-widest mb-6">
					Theme Preview: {mode}
				</h3>
				<div className="flex-1 bg-black/20 rounded-2xl border border-glass-stroke overflow-hidden flex items-center justify-center p-8">
					{/* Mock App Interface using Semantic Tokens */}
					<motion.div
						animate={{
							backgroundColor: getHex(
								tokens.find((t) => t.name === "bg-surface")
									?.values[mode] || ""
							),
						}}
						className="w-[320px] aspect-[9/16] rounded-3xl shadow-2xl border overflow-hidden relative flex flex-col"
						style={{
							borderColor: getHex(
								tokens.find((t) => t.name === "border-subtle")
									?.values[mode] || ""
							),
						}}
					>
						{/* Header */}
						<div
							className="h-14 flex items-center px-4 border-b"
							style={{
								borderColor: getHex(
									tokens.find(
										(t) => t.name === "border-subtle"
									)?.values[mode] || ""
								),
							}}
						>
							<div
								className="w-8 h-8 rounded-full"
								style={{
									backgroundColor: getHex(
										tokens.find(
											(t) => t.name === "action-primary"
										)?.values[mode] || ""
									),
								}}
							/>
						</div>

						{/* Body */}
						<div className="p-4 space-y-4">
							<div
								className="h-8 w-2/3 rounded-lg"
								style={{
									backgroundColor: getHex(
										tokens.find(
											(t) => t.name === "text-primary"
										)?.values[mode] || ""
									),
									opacity: 0.1, // Mock text block
								}}
							/>
							<div
								className="h-4 w-full rounded-lg"
								style={{
									backgroundColor: getHex(
										tokens.find(
											(t) => t.name === "text-secondary"
										)?.values[mode] || ""
									),
									opacity: 0.1,
								}}
							/>
							<div
								className="h-4 w-5/6 rounded-lg"
								style={{
									backgroundColor: getHex(
										tokens.find(
											(t) => t.name === "text-secondary"
										)?.values[mode] || ""
									),
									opacity: 0.1,
								}}
							/>

							{/* Card */}
							<div
								className="mt-6 p-4 rounded-xl border shadow-sm"
								style={{
									backgroundColor: getHex(
										tokens.find(
											(t) =>
												t.name === "bg-surface-raised"
										)?.values[mode] || ""
									),
									borderColor: getHex(
										tokens.find(
											(t) => t.name === "border-subtle"
										)?.values[mode] || ""
									),
								}}
							>
								<div className="flex justify-between items-center">
									<div
										className="h-8 w-24 rounded-md"
										style={{
											backgroundColor: getHex(
												tokens.find(
													(t) =>
														t.name ===
														"action-primary"
												)?.values[mode] || ""
											),
										}}
									/>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
};
