import {
	ChevronRight,
	Palette,
	Type,
	Grid,
	Layers,
	Edit,
	RefreshCw,
} from "lucide-react";
import { ColorMatrix } from "./ColorMatrix";
import { TypographyMatrix } from "./TypographyMatrix";
import { SizingMatrix } from "./SizingMatrix";
import { SemanticMapper } from "./SemanticMapper";
import { SemanticToken } from "../data/semanticTokens";
import { AnimatePresence, motion } from "framer-motion";

export const TokensView = ({
	ramp,
	setRamp,
	setSeedColor,
	baseSize,
	setBaseSize,
	scale,
	setScale,
	semanticTokens,
	setSemanticTokens,
	baseSpacing,
	setBaseSpacing,
	baseRadius,
	setBaseRadius,
	// ... props
	neutralRamp,
	setNeutralRamp,
	secondaryRamp,
	setSecondaryRamp,
	tertiaryRamp,
	setTertiaryRamp,
	signalRamp,
	setSignalRamp,
	alphaRamp,
	setAlphaRamp,
	aiLevel,
	activeColorStep,
	setActiveColorStep,
	onNavigateToAtelier,
	onNavigateToTypeAtelier,
	activeModule,
	setActiveModule,
}: {
	ramp: any[];
	setRamp: any;
	setSeedColor: any;
	baseSize: number;
	setBaseSize: any;
	scale: { name: string; ratio: number };
	setScale: any;
	semanticTokens: SemanticToken[];
	setSemanticTokens: any;
	baseSpacing: number;
	setBaseSpacing: any;
	baseRadius: number;
	setBaseRadius: any;
	neutralRamp: any[];
	setNeutralRamp: any;
	secondaryRamp: any[];
	setSecondaryRamp: any;
	tertiaryRamp: any[];
	setTertiaryRamp: any;
	signalRamp: any[];
	setSignalRamp: any;
	alphaRamp: any[];
	setAlphaRamp: any;
	aiLevel: "silent" | "guide" | "teacher";
	activeColorStep:
		| "primary"
		| "secondary"
		| "tertiary"
		| "neutrals"
		| "signals"
		| "alphas";
	setActiveColorStep: (
		step:
			| "primary"
			| "secondary"
			| "tertiary"
			| "neutrals"
			| "signals"
			| "alphas"
	) => void;

	onNavigateToAtelier: () => void;
	onNavigateToTypeAtelier: () => void;
	activeModule: "colors" | "typography" | "spacing" | "semantics";
	setActiveModule: (
		module: "colors" | "typography" | "spacing" | "semantics"
	) => void;
}) => {
	const handleSync = () => {
		if (activeModule === "colors") {
			// Sync ALL color collections
			// We can batch this or send multiple messages
			const allColors = [
				...ramp,
				...secondaryRamp,
				...tertiaryRamp,
				...neutralRamp,
				...signalRamp,
				...alphaRamp,
			];
			const msg = {
				pluginMessage: {
					type: "create-variables",
					payload: { colors: allColors },
				},
			};
			parent.postMessage(msg, "*");
		} else if (activeModule === "typography") {
			// ... existing typography sync
			const levels = [
				{ name: "Display 2XL", step: 5 },
				{ name: "Display XL", step: 4 },
				{ name: "Heading L", step: 3 },
				{ name: "Heading M", step: 2 },
				{ name: "Heading S", step: 1 },
				{ name: "Body Base", step: 0 },
				{ name: "Caption", step: -1 },
			];
			const styles = levels.map((l) => ({
				name: l.name,
				fontSize: Number(
					(baseSize * Math.pow(scale.ratio, l.step)).toFixed(2)
				),
				lineHeight: 1.2,
			}));

			parent.postMessage(
				{
					pluginMessage: {
						type: "create-text-styles",
						payload: { styles },
					},
				},
				"*"
			);
		} else if (activeModule === "spacing") {
			// Generate spacing variables based on baseSpacing
			const multipliers = [
				{ name: "xs", val: 1 },
				{ name: "sm", val: 2 },
				{ name: "md", val: 4 },
				{ name: "lg", val: 6 },
				{ name: "xl", val: 8 },
				{ name: "2xl", val: 12 },
				{ name: "3xl", val: 16 },
				{ name: "4xl", val: 24 },
				{ name: "5xl", val: 32 },
			];

			const variables = multipliers.map((m) => ({
				name: `space/${m.name}`,
				value: m.val * baseSpacing,
			}));

			// Generate radius variables based on baseRadius
			const radiusMultipliers = [
				{ name: "xs", val: 0.5 },
				{ name: "sm", val: 1 },
				{ name: "md", val: 2 },
				{ name: "lg", val: 3 },
				{ name: "xl", val: 4 },
			];
			const radiusVars = radiusMultipliers.map((m) => ({
				name: `radius/${m.name}`,
				value: m.val * baseRadius,
			}));
			// Full radius
			radiusVars.push({ name: "radius/full", value: 9999 });

			parent.postMessage(
				{
					pluginMessage: {
						type: "create-spacing-variables",
						payload: { variables: [...variables, ...radiusVars] },
					},
				},
				"*"
			);
		} else if (activeModule === "semantics") {
			// ... existing semantic sync
			parent.postMessage(
				{
					pluginMessage: {
						type: "create-semantic-variables",
						payload: { tokens: semanticTokens },
					},
				},
				"*"
			);
		}
	};

	return (
		<div className="grid grid-cols-12 gap-8 h-full">
			<div className="col-span-12 lg:col-span-8 flex flex-col">
				<div className="flex items-center gap-4 mb-6">
					<h2 className="font-brand text-2xl text-white">
						Design Tokens
					</h2>

					{/* Module Tabs */}
					<div className="flex bg-bg-surface p-1 rounded-lg border border-glass-stroke">
						<ModuleTab
							active={activeModule === "colors"}
							onClick={() => setActiveModule("colors")}
							icon={Palette}
						/>
						<ModuleTab
							active={activeModule === "typography"}
							onClick={() => setActiveModule("typography")}
							icon={Type}
						/>
						<ModuleTab
							active={activeModule === "spacing"}
							onClick={() => setActiveModule("spacing")}
							icon={Grid}
						/>
						<ModuleTab
							active={activeModule === "semantics"}
							onClick={() => setActiveModule("semantics")}
							icon={Layers}
						/>
					</div>

					<span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono border border-primary/20 uppercase">
						{activeModule}
					</span>
				</div>

				<div className="flex-1 bg-bg-surface/30 rounded-2xl border border-glass-stroke p-8 relative overflow-hidden backdrop-blur-sm flex flex-col">
					<AnimatePresence mode="wait">
						<motion.div
							key={activeModule}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="h-full flex flex-col"
						>
							{activeModule === "colors" && (
								<>
									<div className="flex items-center justify-between mb-6">
										<h3 className="font-brand text-lg text-white">
											Colors
										</h3>
										<div className="flex gap-2">
											{/* View Toggle */}
											<button
												onClick={onNavigateToAtelier}
												title="Edit Palette in Atelier"
												className="p-2 rounded-lg bg-bg-raised border border-glass-stroke text-gray-400 hover:text-white hover:border-accent-cyan transition-all"
											>
												<Edit size={14} />
											</button>
											<button
												onClick={handleSync}
												className="p-2 rounded-lg bg-bg-raised border border-glass-stroke text-gray-400 hover:text-white hover:border-primary transition-all"
											>
												<RefreshCw size={14} />
											</button>
										</div>
									</div>

									{/* Color Modules */}
									<div className="space-y-4">
										<div className="flex gap-2 border-b border-glass-stroke pb-0 mb-4 overflow-x-auto">
											{[
												"primary",
												"secondary",
												"tertiary",
												"neutrals",
												"signals",
												"alphas",
											].map((step) => (
												<button
													key={step}
													onClick={() =>
														setActiveColorStep(
															step as any
														)
													}
													className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
														activeColorStep === step
															? "border-accent-cyan text-white"
															: "border-transparent text-gray-500 hover:text-gray-300"
													}`}
												>
													{step}
												</button>
											))}
										</div>

										<div className="min-h-[400px]">
											{activeColorStep === "primary" && (
												<ColorMatrix
													ramp={ramp}
													setRamp={setRamp}
													setSeedColor={setSeedColor}
													aiLevel={aiLevel}
													onSync={handleSync}
												/>
											)}
											{activeColorStep ===
												"secondary" && (
												<ColorMatrix
													ramp={secondaryRamp}
													setRamp={setSecondaryRamp}
													setSeedColor={() => {}}
													aiLevel={aiLevel}
													onSync={handleSync}
												/>
											)}
											{activeColorStep === "tertiary" && (
												<ColorMatrix
													ramp={tertiaryRamp}
													setRamp={setTertiaryRamp}
													setSeedColor={() => {}}
													aiLevel={aiLevel}
													onSync={handleSync}
												/>
											)}
											{activeColorStep === "neutrals" && (
												<ColorMatrix
													ramp={neutralRamp}
													setRamp={setNeutralRamp}
													setSeedColor={() => {}}
													aiLevel={aiLevel}
													onSync={handleSync}
												/>
											)}
											{activeColorStep === "signals" && (
												<ColorMatrix
													ramp={signalRamp}
													setRamp={setSignalRamp}
													setSeedColor={() => {}}
													aiLevel={aiLevel}
													onSync={handleSync}
												/>
											)}
											{activeColorStep === "alphas" && (
												<ColorMatrix
													ramp={alphaRamp}
													setRamp={setAlphaRamp}
													setSeedColor={() => {}}
													aiLevel={aiLevel}
													onSync={handleSync}
												/>
											)}
										</div>
									</div>
								</>
							)}
							{activeModule === "typography" && (
								<>
									<div className="flex items-center justify-between mb-6">
										<h3 className="font-brand text-lg text-white">
											Typography
										</h3>
										<div className="flex gap-2">
											<button
												onClick={
													onNavigateToTypeAtelier
												}
												title="Edit Type in Atelier"
												className="p-2 rounded-lg bg-bg-raised border border-glass-stroke text-gray-400 hover:text-white hover:border-accent-cyan transition-all"
											>
												<Edit size={14} />
											</button>
										</div>
									</div>
									<TypographyMatrix
										baseSize={baseSize}
										setBaseSize={setBaseSize}
										scale={scale}
										setScale={setScale}
									/>
								</>
							)}
							{activeModule === "spacing" && (
								<SizingMatrix
									baseSpacing={baseSpacing}
									setBaseSpacing={setBaseSpacing}
									baseRadius={baseRadius}
									setBaseRadius={setBaseRadius}
								/>
							)}
							{activeModule === "semantics" && (
								<SemanticMapper
									ramp={ramp}
									secondaryRamp={secondaryRamp}
									tertiaryRamp={tertiaryRamp}
									neutralRamp={neutralRamp}
									signalRamp={signalRamp}
									alphaRamp={alphaRamp}
									tokens={semanticTokens}
									setTokens={setSemanticTokens}
								/>
							)}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>

			<div className="col-span-12 lg:col-span-4 space-y-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					whileHover={{
						y: -5,
						transition: { type: "spring", stiffness: 300 },
					}}
					className="depth-card p-6 border border-glass-stroke/50 hover:border-glass-stroke transition-colors relative overflow-hidden group/card"
				>
					{/* Glow Effect */}
					<div className="absolute -inset-1 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity blur-xl" />

					<div className="relative z-10">
						<div className="flex justify-between items-center mb-4">
							<h4 className="font-display text-xs text-gray-400 uppercase tracking-widest group-hover/card:text-white transition-colors">
								Figma Variables
							</h4>
							<span className="w-2 h-2 rounded-full bg-accent-success shadow-[0_0_10px_#32D74B] animate-pulse"></span>
						</div>
						<p className="text-sm text-gray-500 mb-6 min-h-[40px]">
							{activeModule === "colors" &&
								`${ramp.length} primitives ready to sync.`}
							{activeModule === "typography" &&
								`7 text styles ready to sync.`}
							{activeModule === "spacing" &&
								`9 spacing tokens ready to sync.`}
							{activeModule === "semantics" &&
								`${semanticTokens.length} semantic tokens (modes enabled).`}
						</p>
						<button
							onClick={handleSync}
							className="w-full py-3 rounded-lg bg-bg-void border border-glass-stroke text-white font-mono text-xs hover:border-primary hover:text-primary transition-all flex justify-center items-center gap-2 group relative overflow-hidden"
						>
							<div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
							<span className="relative">SYNC TO COLLECTION</span>
							<ChevronRight
								size={12}
								className="group-hover:translate-x-1 transition-transform relative"
							/>
						</button>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

const ModuleTab = ({ active, onClick, icon: Icon }: any) => (
	<button
		onClick={onClick}
		className={`p-2 rounded-md transition-all ${
			active
				? "bg-bg-raised text-white shadow-md"
				: "text-gray-500 hover:text-gray-300"
		}`}
	>
		<Icon size={16} />
	</button>
);
