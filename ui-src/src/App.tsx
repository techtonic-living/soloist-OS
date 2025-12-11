import { useState, useEffect, useCallback } from "react";
import { colord } from "colord";
import { motion, AnimatePresence } from "framer-motion";
import {
	Layers,
	Settings,
	Terminal,
	Sparkles,
	Palette,
	Maximize2,
	Minimize2,
	Layout,
} from "lucide-react";
import { SettingsView } from "./components/SettingsView";
import { ExploreView } from "./components/ExploreView";
import { OrganizeView } from "./components/OrganizeView";
import { ConnectView } from "./components/ConnectView";
import { AssistantPanel } from "./components/AssistantPanel";
import { BottomNav } from "./components/BottomNav";
import { AiLevelSlider } from "./components/AiLevelSlider";
import { useSoloistSystem } from "./hooks/useSoloistSystem";
import {
	generateRamp,
	generateNeutrals,
	generateSignals,
	generateAlphas,
} from "./utils/colorUtils";

type View =
	| "explore"
	| "organize"
	| "connect"
	// Legacy/Background views (kept for state compatibility for now)
	| "tokens"
	| "knowledge"
	| "settings"
	| "export"
	| "atelier"
	| "typography";

import { OnboardingWizard } from "./components/OnboardingWizard";
import { DEFAULT_SEMANTICS, SemanticToken } from "./components/SemanticMapper";
import { PresetColor } from "./data/colorPresets";

const App = () => {
	// Navigation State
	const [exploreTab, setExploreTab] = useState<
		"colors" | "palettes" | "create" | "generator"
	>("create");
	const [selectedInsightColor, setSelectedInsightColor] =
		useState<PresetColor | null>(null);

	// Global Design System State
	const { settings, updateSettings } = useSoloistSystem();
	// Global Color State
	const [seedColor, setSeedColor] = useState("#3D8BFF");
	const [ramp, setRamp] = useState(() => generateRamp(seedColor));
	const [neutralRamp, setNeutralRamp] = useState(() =>
		generateNeutrals(seedColor)
	);
	const [signalRamp] = useState(() => generateSignals());
	const [alphaRamp] = useState(() => generateAlphas("#000000"));

	// Global State
	const [activeView, setActiveView] = useState<View>("explore");
	const [windowSize, setWindowSize] = useState<
		"compact" | "standard" | "studio"
	>("standard");
	// Assistant Panel State (Pinned by default for better UX)
	const [isAssistantPinned, setIsAssistantPinned] = useState(true);

	// Onboarding Wizard State
	const [showWizard, setShowWizard] = useState(false);

	// Resize Handler
	const handleResize = (size: "compact" | "standard" | "studio") => {
		setWindowSize(size);

		let width = 1000;
		let height = 700;

		if (size === "compact") {
			width = 400;
			height = 600;
			setIsAssistantPinned(false); // Forced unpin for mobile
		} else if (size === "standard") {
			width = 1000;
			height = 700;
			setIsAssistantPinned(true); // Default to pinned
		} else if (size === "studio") {
			width = 1400;
			height = 900;
			setIsAssistantPinned(true); // Default to pinned
		}

		parent.postMessage(
			{ pluginMessage: { type: "resize-ui", width, height } },
			"*"
		);
	};

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

	const [harmonyMode, setHarmonyMode] = useState<
		"complementary" | "analogous" | "triadic" | "manual"
	>("complementary");

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
		<div className="flex flex-col h-screen w-full bg-bg-void overflow-hidden text-sm">
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

			{/* MAIN CONTAINER (Flex Row) */}
			<div className="flex-1 flex overflow-hidden">
				{/* 1. SIDEBAR NAVIGATION (Hidden in Compact) */}
				{windowSize !== "compact" && (
					<nav className="w-16 flex-shrink-0 flex flex-col items-center py-6 border-r border-glass-stroke bg-bg-void/50 backdrop-blur-md z-50">
						<div className="mb-8 font-brand text-2xl text-primary tracking-widest text-shadow-glow">
							OS
						</div>

						<div className="space-y-6 flex flex-col w-full items-center">
							<NavIcon
								icon={Palette}
								active={activeView === "explore"}
								onClick={() => setActiveView("explore")}
							/>
							<NavIcon
								icon={Layers}
								active={activeView === "organize"}
								onClick={() => setActiveView("organize")}
							/>
							<NavIcon
								icon={Terminal}
								active={activeView === "connect"}
								onClick={() => setActiveView("connect")}
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

							{/* AI Slider (Vertical) */}
							<AiLevelSlider
								value={settings.aiLevel}
								onChange={(level) =>
									updateSettings({ aiLevel: level })
								}
								orientation="vertical"
							/>

							{/* Settings */}
							<NavIcon
								icon={Settings}
								active={activeView === "settings"}
								onClick={() => setActiveView("settings")}
							/>
						</div>
					</nav>
				)}

				{/* 2. CENTER CONTENT (Flex 1) */}
				<main className="flex-1 relative overflow-hidden flex flex-column">
					<div className="flex-1 flex flex-col h-full overflow-hidden">
						{/* HEADER */}
						<header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-glass-stroke bg-bg-void/30 backdrop-blur-sm z-20">
							<div className="flex items-center gap-3">
								<h1 className="font-brand text-3xl text-white tracking-wide">
									Soloist
								</h1>
								<span className="text-gray-600 font-light text-xl">
									/
								</span>
								<h2 className="text-gray-400 font-display tracking-wide uppercase text-xs">
									{activeView === "explore"
										? "Explore"
										: activeView === "organize"
										? "Organize"
										: activeView === "connect"
										? "Connect"
										: "Settings"}
								</h2>
							</div>

							<div className="flex items-center gap-4">
								{/* Resize Controls */}
								<div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
									{[
										{
											id: "compact",
											icon: Minimize2,
											label: "Mobile",
										},
										{
											id: "standard",
											icon: Layout,
											label: "Desktop",
										},
										{
											id: "studio",
											icon: Maximize2,
											label: "Studio",
										},
									].map((mode) => (
										<button
											key={mode.id}
											onClick={() =>
												handleResize(mode.id as any)
											}
											className={`p-1.5 rounded-md transition-all ${
												windowSize === mode.id
													? "bg-white/10 text-white shadow-sm"
													: "text-gray-500 hover:text-white"
											}`}
											title={mode.label}
										>
											<mode.icon size={14} />
										</button>
									))}
								</div>
							</div>
						</header>

						{/* VIEWPORT */}
						<div className="flex-1 p-2 overflow-y-auto custom-scrollbar relative">
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
									{activeView === "explore" && (
										<ExploreView
											seedColor={seedColor}
											setSeedColor={setSeedColor}
											secondaryColor={
												secondaryRamp[5]?.hex ||
												"#000000"
											}
											setSecondaryColor={useCallback(
												(hex: string) => {
													setSecondaryRamp((prev) =>
														generateRamp(
															hex,
															prev,
															"secondary"
														)
													);
												},
												[]
											)}
											tertiaryColor={
												tertiaryRamp[5]?.hex ||
												"#000000"
											}
											setTertiaryColor={useCallback(
												(hex: string) => {
													setTertiaryRamp((prev) =>
														generateRamp(
															hex,
															prev,
															"tertiary"
														)
													);
												},
												[]
											)}
											harmonyMode={harmonyMode}
											setHarmonyMode={setHarmonyMode}
											settings={settings}
											updateSettings={updateSettings}
											activeTab={exploreTab}
											setActiveTab={setExploreTab}
											onInspectColor={
												setSelectedInsightColor
											}
										/>
									)}
									{activeView === "organize" && (
										<OrganizeView
											settings={settings}
											updateSettings={updateSettings}
										/>
									)}
									{activeView === "connect" && (
										<ConnectView
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
											settings={settings}
										/>
									)}

									{/* Keeping Settings accessible */}
									{activeView === "settings" && (
										<SettingsView
											settings={settings}
											updateSettings={updateSettings}
										/>
									)}
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
				</main>

				{/* 3. ASSISTANT PANEL (Persistent) */}
				{windowSize !== "compact" && (
					<AssistantPanel
						aiLevel={settings.aiLevel}
						pinned={isAssistantPinned}
						setPinned={setIsAssistantPinned}
						activeView={activeView}
						activeColorStep={
							activeView === "tokens"
								? "primary"
								: undefined /* TODO: Fix this map */
						}
						activeExploreTab={exploreTab}
						selectedInsightColor={selectedInsightColor}
						// Color Creator Props
						seedColor={seedColor}
						setSeedColor={setSeedColor}
						secondaryColor={secondaryRamp[5]?.hex}
						tertiaryColor={tertiaryRamp[5]?.hex}
						harmonyMode={harmonyMode}
						settings={settings}
						updateSettings={updateSettings}
					/>
				)}
			</div>

			{/* Bottom Nav (Only in Compact) */}
			{windowSize === "compact" && (
				<BottomNav
					activeView={activeView}
					setActiveView={setActiveView}
					onWizardClick={() => setShowWizard(true)}
				/>
			)}
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
