import { useState, useEffect } from "react";
import { LeftRail } from "./components/layout/LeftRail";
import { TopNavBar } from "./components/layout/TopNavBar";
import { MainWorkbench } from "./components/layout/MainWorkbench";
import { StatusBar } from "./components/layout/StatusBar";
import { WelcomeView } from "./components/layout/WelcomeView";
import { ExploreView } from "./components/ExploreView";
import { ConnectView } from "./components/ConnectView";
import { TokensView } from "./components/TokensView";
import { OrganizeView } from "./components/OrganizeView";
import { KnowledgeBase } from "./components/KnowledgeBase";
import { SettingsView } from "./components/SettingsView";
import { TypographyAtelier } from "./components/TypographyAtelier";
import { useSoloist } from "./context/SoloistContext";
import { PresetColor } from "./data/colorPresets";

const App = () => {
	// --- Global Navigation & UI State ---
	const [activeTool, setActiveTool] = useState<string>("welcome");
	const [activeSubTool, setActiveSubTool] = useState<string>("browse");
	const [uiDensity, setUiDensity] = useState<"compact" | "cozy" | "spacious">(
		"compact"
	);
	const [uiSize, setUiSize] = useState<"small" | "medium" | "big">("small");
	const [assistantMode, setAssistantMode] = useState<
		"standby" | "wingman" | "guru"
	>("standby");
	const [isRailExpanded, setIsRailExpanded] = useState<boolean>(true);

	// --- Tool Content State ---
	const [inspectedColor, setInspectedColor] = useState<PresetColor | null>(
		null
	);
	const [inspectedPalette, setInspectedPalette] =
		useState<PresetColor | null>(null);
	const [inspectedRemixIndex, setInspectedRemixIndex] = useState<
		number | null
	>(null);
	const [generatorColors, setGeneratorColors] = useState<string[]>([
		"#FFBE0B",
	]);
	const [activeColorSlot, setActiveColorSlot] = useState<
		"primary" | "secondary" | "tertiary"
	>("primary");

	// --- Tool-local state (kept in master layout so tool switches feel instant) ---
	const [tokensActiveModule, setTokensActiveModule] = useState<
		"colors" | "typography" | "spacing" | "semantics"
	>("colors");
	const [tokensActiveColorStep, setTokensActiveColorStep] = useState<
		"primary" | "secondary" | "tertiary" | "neutrals" | "signals" | "alphas"
	>("primary");
	const [typeAtelierTab, setTypeAtelierTab] = useState<
		"scale" | "pairing" | "library"
	>("scale");

	const handleGoHome = () => {
		setActiveTool("welcome");
		setActiveSubTool("");
	};

	// --- Handlers ---
	const handleSelectTool = (toolId: string) => {
		setActiveTool(toolId);
		// Reset subtool defaults when switching tools
		if (toolId === "explore-colors") {
			setActiveSubTool("browse");
		} else {
			setActiveSubTool("");
		}
	};

	// Determine Top Nav Bar Section/Title & Subtools
	const getToolInfo = () => {
		if (activeTool === "welcome") {
			return { sectionLabel: "Home", label: "Welcome", subTools: [] };
		}
		if (activeTool === "explore-colors") {
			return {
				sectionLabel: "Explore",
				label: "Colors",
				subTools: [
					{ id: "browse", label: "Browse" },
					{ id: "create", label: "Create" },
					{ id: "shuffle", label: "Shuffle" },
					{ id: "archive", label: "Archive" },
				],
			};
		}
		if (activeTool === "explore-typography") {
			return {
				sectionLabel: "Explore",
				label: "Typography",
				subTools: [],
			};
		}
		if (activeTool === "connect") {
			return { sectionLabel: "System", label: "Connect", subTools: [] };
		}
		if (activeTool === "organize") {
			return { sectionLabel: "System", label: "Organize", subTools: [] };
		}
		if (activeTool === "knowledge") {
			return { sectionLabel: "System", label: "Knowledge", subTools: [] };
		}
		if (activeTool === "export") {
			return { sectionLabel: "System", label: "Export", subTools: [] };
		}
		if (activeTool === "settings") {
			return { sectionLabel: "System", label: "Settings", subTools: [] };
		}

		// Fallback for other nav entries (e.g. structure-*, document-*)
		const parts = activeTool.split("-");
		const group = parts[0]
			? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
			: "System";
		const tool = parts[1]
			? parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
			: "";
		return { sectionLabel: group, label: tool || group, subTools: [] };
	};

	const toolInfo = getToolInfo();

	// App integrates with the global Soloist system state
	const soloist = useSoloist();
	const { setIsSamplerActive } = soloist;
	useEffect(() => {
		if (!(activeTool === "explore-colors" && activeSubTool === "create")) {
			setIsSamplerActive(false);
		}
	}, [activeTool, activeSubTool, setIsSamplerActive]);

	return (
		<div
			className={`soloist-app-grid h-screen w-screen bg-bg-void overflow-hidden text-sm relative transition-all duration-500 ui-size-${uiSize} ui-density-${uiDensity} ${
				isRailExpanded
					? "soloist-app-grid--railExpanded"
					: "soloist-app-grid--railCollapsed"
			}`}
		>
			{/* --- ROW 1: HEADER (Slots 1,1 | 1,2 | 1,3) --- */}
			<TopNavBar
				activeSectionLabel={toolInfo.sectionLabel}
				activeToolLabel={toolInfo.label}
				activeSubTool={activeSubTool}
				onSetSubTool={setActiveSubTool}
				subTools={toolInfo.subTools}
				uiDensity={uiDensity}
				setUiDensity={setUiDensity}
				uiSize={uiSize}
				setUiSize={setUiSize}
				onGoHome={handleGoHome}
				isRailExpanded={isRailExpanded}
			/>

			{/* --- ROW 2: CENTER (Left Rail: 2,1 | Workbench: 2,2 | Assistant: 2,3) --- */}
			<LeftRail
				activeTool={activeTool}
				onSelectTool={handleSelectTool}
				isExpanded={isRailExpanded}
				onToggleExpand={() => setIsRailExpanded(!isRailExpanded)}
				uiDensity={uiDensity}
			/>

			<MainWorkbench
				assistantMode={assistantMode}
				setAssistantMode={setAssistantMode}
				assistantContent={
					inspectedColor ||
					inspectedPalette ||
					inspectedRemixIndex !== null
						? null
						: undefined
				}
			>
				{activeTool === "welcome" && <WelcomeView />}
				{activeTool === "explore-colors" && (
					<ExploreView
						activeTab={
							activeSubTool === "browse" ? "colors" : "studio"
						}
						setActiveTab={(tab) => {
							if (tab === "colors" || tab === "palettes")
								setActiveSubTool("browse");
							if (tab === "studio") setActiveSubTool("create");
							if (tab === "remix") setActiveSubTool("shuffle");
						}}
						onInspectColor={setInspectedColor}
						onInspectPalette={setInspectedPalette}
						inspectedRemixIndex={inspectedRemixIndex}
						onInspectRemixColor={setInspectedRemixIndex}
						generatorColors={generatorColors}
						setGeneratorColors={setGeneratorColors}
						activeColorSlot={activeColorSlot}
						setActiveColorSlot={setActiveColorSlot}
					/>
				)}
				{activeTool === "explore-typography" && (
					<TypographyAtelier
						baseSize={soloist.baseSize}
						setBaseSize={soloist.setBaseSize}
						scale={soloist.scale}
						setScale={soloist.setScale}
						onComplete={handleGoHome}
						settings={soloist.settings}
						updateSettings={soloist.updateSettings}
						activeTab={typeAtelierTab}
						setActiveTab={setTypeAtelierTab}
					/>
				)}
				{activeTool === "define-tokens" && (
					<TokensView
						ramp={soloist.ramp}
						setRamp={soloist.setRamp}
						setSeedColor={soloist.setSeedColor}
						baseSize={soloist.baseSize}
						setBaseSize={soloist.setBaseSize}
						scale={soloist.scale}
						setScale={soloist.setScale}
						semanticTokens={soloist.semanticTokens}
						setSemanticTokens={soloist.setSemanticTokens}
						baseSpacing={soloist.baseSpacing}
						setBaseSpacing={soloist.setBaseSpacing}
						baseRadius={soloist.baseRadius}
						setBaseRadius={soloist.setBaseRadius}
						neutralRamp={soloist.neutralRamp}
						setNeutralRamp={soloist.setNeutralRamp}
						secondaryRamp={soloist.secondaryRamp}
						setSecondaryRamp={soloist.setSecondaryRamp}
						tertiaryRamp={soloist.tertiaryRamp}
						setTertiaryRamp={soloist.setTertiaryRamp}
						signalRamp={soloist.signalRamp}
						setSignalRamp={soloist.setSignalRamp}
						alphaRamp={soloist.alphaRamp}
						setAlphaRamp={soloist.setAlphaRamp}
						aiLevel={soloist.settings.aiLevel}
						activeColorStep={tokensActiveColorStep}
						setActiveColorStep={setTokensActiveColorStep}
						onNavigateToAtelier={() => {
							setActiveTool("explore-colors");
							setActiveSubTool("create");
						}}
						onNavigateToTypeAtelier={() => {
							setActiveTool("explore-typography");
							setActiveSubTool("");
						}}
						activeModule={tokensActiveModule}
						setActiveModule={setTokensActiveModule}
					/>
				)}
				{activeTool === "connect" && <ConnectView initialTab="sync" />}
				{activeTool === "export" && <ConnectView initialTab="export" />}
				{activeTool === "organize" && <OrganizeView />}
				{activeTool === "knowledge" && <KnowledgeBase />}
				{activeTool === "settings" && <SettingsView />}
				{activeTool !== "welcome" &&
					activeTool !== "explore-colors" &&
					activeTool !== "explore-typography" &&
					activeTool !== "define-tokens" &&
					activeTool !== "connect" &&
					activeTool !== "export" &&
					activeTool !== "organize" &&
					activeTool !== "knowledge" &&
					activeTool !== "settings" && (
						<div className="h-full w-full flex items-center justify-center text-white/20 font-mono tracking-widest uppercase">
							Tool Implementation Pending
						</div>
					)}
			</MainWorkbench>

			{/* --- ROW 3: FOOTER (Slots 3,1 | 3,2 | 3,3) --- */}
			<StatusBar
				isRailExpanded={isRailExpanded}
				activeView={activeTool}
			/>
		</div>
	);
};

export default App;
