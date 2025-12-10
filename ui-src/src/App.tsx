import { useState } from "react";
import { colord } from "colord";
import { motion, AnimatePresence } from "framer-motion";
import {
	Layers,
	BookOpen,
	Settings,
	Terminal,
	Activity,
	Sparkles,
	Palette,
	Type,
} from "lucide-react";
import { ColorAtelier } from "./components/ColorAtelier";
import { TypographyAtelier } from "./components/TypographyAtelier";
import { KnowledgeBase } from "./components/KnowledgeBase";

import { SettingsView } from "./components/SettingsView";
import { ExportTerminal } from "./components/ExportTerminal";
import { TokensView } from "./components/TokensView";
import { TeacherPanel } from "./components/TeacherPanel";
import { useSoloistSystem } from "./hooks/useSoloistSystem";
import {
	generateRamp,
	generateNeutrals,
	generateSignals,
	generateAlphas,
} from "./utils/colorUtils";
import { useEffect } from "react";

type View =
	| "tokens"
	| "knowledge"
	| "settings"
	| "export"
	| "atelier"
	| "typography";

import { OnboardingWizard } from "./components/OnboardingWizard";
import { DEFAULT_SEMANTICS, SemanticToken } from "./components/SemanticMapper";

const App = () => {
	// Navigation State
	const [activeView, setActiveView] = useState<View>("tokens");
	const [activeColorStep, setActiveColorStep] = useState<
		"primary" | "secondary" | "tertiary" | "neutrals" | "signals" | "alphas"
	>("primary");
	const [activeColorTab, setActiveColorTab] = useState<
		"atelier" | "generator" | "contrast" | "mixer" | "library"
	>("atelier");
	const [activeTokensModule, setActiveTokensModule] = useState<
		"colors" | "typography" | "spacing" | "semantics"
	>("colors");
	const [activeTypeTab, setActiveTypeTab] = useState<
		"scale" | "pairing" | "library"
	>("scale");

	const [showWizard, setShowWizard] = useState(false); // Demo: could be true by default for new users

	// Global Design System State
	const { settings, updateSettings } = useSoloistSystem();
	// Global Color State
	const [seedColor, setSeedColor] = useState("#3D8BFF");
	const [ramp, setRamp] = useState(() => generateRamp(seedColor));
	const [neutralRamp, setNeutralRamp] = useState(() =>
		generateNeutrals(seedColor)
	);
	const [signalRamp, setSignalRamp] = useState(() => generateSignals());
	const [alphaRamp, setAlphaRamp] = useState(() => generateAlphas("#000000"));

	// Secondary & Tertiary (Harmonies)
	// Default Secondary: Complementary (180deg)
	const [secondaryRamp, setSecondaryRamp] = useState(() =>
		generateRamp(colord(seedColor).rotate(180).toHex())
	);
	// Default Tertiary: Triadic/Analogous (-30deg for Analogous is safer than Triadic for UI usually, let's try Split Comp -150)
	// Let's go with a safe Analogous (-30) for Tertiary
	const [tertiaryRamp, setTertiaryRamp] = useState(() =>
		generateRamp(colord(seedColor).rotate(-30).toHex())
	);

	// Lifted State for Wizard/Dashboard consistency
	const [baseSize, setBaseSize] = useState(16);
	const [baseSpacing, setBaseSpacing] = useState(4);
	const [baseRadius, setBaseRadius] = useState(4);
	const [scale, setScale] = useState({ name: "Major Third", ratio: 1.25 });
	const [semanticTokens, setSemanticTokens] =
		useState<SemanticToken[]>(DEFAULT_SEMANTICS);

	// Update ramps when seed changes
	useEffect(() => {
		setRamp((prevRamp) => generateRamp(seedColor, prevRamp));
		setNeutralRamp((_) => generateNeutrals(seedColor)); // Neutrals always track seed hue
	}, [seedColor]);

	return (
		<div className="flex h-screen w-full bg-bg-void overflow-hidden text-sm">
			{/* WIZARD OVERLAY */}
			<AnimatePresence>
				{showWizard && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="fixed inset-0 z-[100] p-12 bg-black/80 backdrop-blur-sm"
					>
						<OnboardingWizard
							ramp={ramp}
							setRamp={setRamp}
							setSeedColor={setSeedColor}
							baseSize={baseSize}
							setBaseSize={setBaseSize}
							scale={scale}
							setScale={setScale}
							baseSpacing={baseSpacing}
							setBaseSpacing={setBaseSpacing}
							baseRadius={baseRadius}
							setBaseRadius={setBaseRadius}
							semanticTokens={semanticTokens}
							setSemanticTokens={setSemanticTokens}
							onComplete={() => setShowWizard(false)}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{/* SIDEBAR */}
			<nav className="w-16 flex-shrink-0 flex flex-col items-center py-6 border-r border-glass-stroke bg-bg-void/50 backdrop-blur-md z-50">
				<div className="mb-8 font-brand text-2xl text-primary tracking-widest text-shadow-glow">
					OS
				</div>

				<div className="space-y-6 flex flex-col w-full items-center">
					<NavIcon
						icon={Palette}
						active={activeView === "atelier"}
						onClick={() => setActiveView("atelier")}
					/>
					<NavIcon
						icon={Type}
						active={activeView === "typography"}
						onClick={() => setActiveView("typography")}
					/>
					<NavIcon
						icon={Layers}
						active={activeView === "tokens"}
						onClick={() => setActiveView("tokens")}
					/>
					<NavIcon
						icon={BookOpen}
						active={activeView === "knowledge"}
						onClick={() => setActiveView("knowledge")}
					/>

					<NavIcon
						icon={Terminal}
						active={activeView === "export"}
						onClick={() => setActiveView("export")}
					/>
				</div>

				<div className="mt-auto space-y-6 flex flex-col w-full items-center">
					{/* Wizard Launcher */}
					<button
						onClick={() => setShowWizard(true)}
						className="p-3 rounded-xl text-accent-cyan hover:bg-accent-cyan/10 transition-all relative group"
						title="Start Guided Setup"
					>
						<Sparkles size={20} strokeWidth={1.5} />
					</button>

					{/* AI Toggle Indicator */}
					<div className="h-24 w-1 bg-glass-stroke rounded-full relative group">
						<motion.div
							className="w-full bg-accent-cyan rounded-full absolute bottom-0 shadow-neon-glow"
							animate={{
								height:
									settings.aiLevel === "silent"
										? "10%"
										: settings.aiLevel === "guide"
										? "50%"
										: "100%",
							}}
						/>
						<div className="absolute left-4 bottom-0 hidden group-hover:block w-32 bg-bg-surface border border-glass-stroke p-3 z-50 rounded-lg shadow-monolith">
							<p className="text-xs text-accent-cyan mb-2 font-brand uppercase tracking-widest">
								AI Assistance
							</p>
							<div className="space-y-2">
								<button
									onClick={() =>
										updateSettings({ aiLevel: "teacher" })
									}
									className={`w-full text-left text-xs ${
										settings.aiLevel === "teacher"
											? "text-white"
											: "text-gray-500"
									}`}
								>
									Teacher Mode
								</button>
								<button
									onClick={() =>
										updateSettings({ aiLevel: "guide" })
									}
									className={`w-full text-left text-xs ${
										settings.aiLevel === "guide"
											? "text-white"
											: "text-gray-500"
									}`}
								>
									Co-Pilot
								</button>
								<button
									onClick={() =>
										updateSettings({ aiLevel: "silent" })
									}
									className={`w-full text-left text-xs ${
										settings.aiLevel === "silent"
											? "text-white"
											: "text-gray-500"
									}`}
								>
									Silent
								</button>
							</div>
						</div>
					</div>
					<NavIcon
						icon={Settings}
						active={activeView === "settings"}
						onClick={() => setActiveView("settings")}
					/>
				</div>
			</nav>

			{/* MAIN CONTENT AREA */}
			<main className="flex-1 relative overflow-hidden flex flex-row">
				<div className="flex-1 flex flex-col h-full overflow-hidden">
					<header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-glass-stroke bg-bg-void/30 backdrop-blur-sm z-20">
						<div className="flex items-center gap-3">
							<h1 className="font-brand text-3xl text-white tracking-wide">
								Soloist
							</h1>
							<span className="text-gray-600 font-light text-xl">
								/
							</span>
							<h2 className="text-gray-400 font-display tracking-wide uppercase text-xs">
								Workbench
							</h2>
						</div>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-glass-subtle border border-glass-stroke">
								<Activity
									size={14}
									className="text-accent-cyan animate-pulse"
								/>
								<span className="text-xs text-gray-400 font-mono">
									SYSTEM: ONLINE
								</span>
							</div>
						</div>
					</header>

					<div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
						{/* Ambient Background */}
						{settings.visualFidelity === "high" && (
							<div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
						)}

						<AnimatePresence mode="wait">
							<motion.div
								key={activeView}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.4 }}
								className="w-full h-full max-w-6xl mx-auto"
							>
								{activeView === "tokens" && (
									<TokensView
										ramp={ramp}
										setRamp={setRamp}
										neutralRamp={neutralRamp}
										setNeutralRamp={setNeutralRamp}
										secondaryRamp={secondaryRamp}
										setSecondaryRamp={setSecondaryRamp}
										tertiaryRamp={tertiaryRamp}
										setTertiaryRamp={setTertiaryRamp}
										signalRamp={signalRamp}
										setSignalRamp={setSignalRamp}
										alphaRamp={alphaRamp}
										setAlphaRamp={setAlphaRamp}
										setSeedColor={setSeedColor}
										baseSize={baseSize}
										setBaseSize={setBaseSize}
										scale={scale}
										setScale={setScale}
										baseSpacing={baseSpacing}
										setBaseSpacing={setBaseSpacing}
										baseRadius={baseRadius}
										setBaseRadius={setBaseRadius}
										semanticTokens={semanticTokens}
										setSemanticTokens={setSemanticTokens}
										aiLevel={settings.aiLevel}
										activeColorStep={activeColorStep}
										setActiveColorStep={setActiveColorStep}
										onNavigateToAtelier={() =>
											setActiveView("atelier")
										}
										onNavigateToTypeAtelier={() =>
											setActiveView("typography")
										}
										activeModule={activeTokensModule}
										setActiveModule={setActiveTokensModule}
									/>
								)}
								{activeView === "atelier" && (
									<ColorAtelier
										seedColor={seedColor}
										setSeedColor={setSeedColor}
										secondaryColor={
											secondaryRamp[5]?.hex || "#000000"
										}
										setSecondaryColor={(hex: string) =>
											setSecondaryRamp(
												generateRamp(
													hex,
													secondaryRamp,
													"secondary"
												)
											)
										}
										tertiaryColor={
											tertiaryRamp[5]?.hex || "#000000"
										}
										setTertiaryColor={(hex: string) =>
											setTertiaryRamp(
												generateRamp(
													hex,
													tertiaryRamp,
													"tertiary"
												)
											)
										}
										onComplete={() =>
											setActiveView("tokens")
										}
										settings={settings}
										updateSettings={updateSettings}
										activeTab={activeColorTab}
										setActiveTab={setActiveColorTab}
									/>
								)}
								{activeView === "typography" && (
									<TypographyAtelier
										baseSize={baseSize}
										setBaseSize={setBaseSize}
										scale={scale}
										setScale={setScale}
										onComplete={() =>
											setActiveView("tokens")
										}
										settings={settings}
										updateSettings={updateSettings}
										activeTab={activeTypeTab}
										setActiveTab={setActiveTypeTab}
									/>
								)}
								{activeView === "knowledge" && (
									<KnowledgeBase />
								)}

								{activeView === "settings" && (
									<SettingsView
										settings={settings}
										updateSettings={updateSettings}
									/>
								)}
								{activeView === "export" && (
									<ExportTerminal
										ramp={ramp}
										secondaryRamp={secondaryRamp}
										tertiaryRamp={tertiaryRamp}
										neutralRamp={neutralRamp}
										signalRamp={signalRamp}
										alphaRamp={alphaRamp}
										baseSize={baseSize}
										scale={scale}
										baseSpacing={baseSpacing}
										baseRadius={baseRadius}
										semanticTokens={semanticTokens}
									/>
								)}
							</motion.div>
						</AnimatePresence>
					</div>
				</div>

				{/* Teacher Panel */}
				<AnimatePresence>
					{settings.aiLevel === "teacher" && (
						<TeacherPanel
							activeView={activeView}
							activeColorStep={activeColorStep}
							activeColorTab={activeColorTab}
							activeTypeTab={activeTypeTab}
							activeTokensModule={activeTokensModule}
						/>
					)}
				</AnimatePresence>
			</main>
		</div>
	);
};

const NavIcon = ({ icon: Icon, active, onClick }: any) => (
	<button
		onClick={onClick}
		className={`p-3 rounded-xl transition-all duration-300 relative group ${
			active
				? "bg-bg-raised text-accent-cyan shadow-neon-glow"
				: "text-gray-500 hover:text-white"
		}`}
	>
		<Icon size={20} strokeWidth={1.5} />
	</button>
);

export default App;
