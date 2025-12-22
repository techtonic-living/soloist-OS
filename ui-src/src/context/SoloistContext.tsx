import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useMemo,
	ReactNode,
	useCallback,
} from "react";
import { colord } from "colord";
import {
	generateRamp,
	generateNeutrals,
	generateSignals,
	generateAlphas,
} from "../utils/colorUtils";
import { useSoloistSystem, SystemSettings } from "../hooks/useSoloistSystem";
import { SemanticToken, DEFAULT_SEMANTICS } from "../data/semanticTokens";

// --- Types ---

export type View =
	| "explore"
	| "organize"
	| "connect"
	| "settings"
	| "tokens"
	| "knowledge"
	| "export"
	| "atelier"
	| "typography";

export type WindowSize = "compact" | "standard" | "studio";

export type HarmonyMode = "complementary" | "analogous" | "triadic" | "manual";

interface SoloistContextType {
	// UI State
	activeView: View;
	setActiveView: (view: View) => void;
	windowSize: WindowSize;
	setWindowSize: (size: WindowSize) => void;
	handleResize: (size: WindowSize) => void;
	isAssistantPinned: boolean;
	setIsAssistantPinned: (pinned: boolean) => void;

	// Settings (Persisted)
	settings: SystemSettings;
	updateSettings: (
		newSettings:
			| Partial<SystemSettings>
			| ((prev: SystemSettings) => SystemSettings)
	) => void;

	// Color State
	seedColor: string;
	setSeedColor: (hex: string) => void;
	ramp: any[];
	setRamp: React.Dispatch<React.SetStateAction<any[]>>;
	neutralRamp: any[];
	setNeutralRamp: React.Dispatch<React.SetStateAction<any[]>>;
	signalRamp: any[];
	setSignalRamp: React.Dispatch<React.SetStateAction<any[]>>;
	alphaRamp: any[];
	setAlphaRamp: React.Dispatch<React.SetStateAction<any[]>>;

	// Harmony State
	secondaryRamp: any[];
	setSecondaryRamp: React.Dispatch<React.SetStateAction<any[]>>;
	tertiaryRamp: any[];
	setTertiaryRamp: React.Dispatch<React.SetStateAction<any[]>>;
	harmonyMode: HarmonyMode;
	setHarmonyMode: (mode: HarmonyMode) => void;
	setSecondaryColor: (hex: string) => void; // Regenerates ramp
	setTertiaryColor: (hex: string) => void; // Regenerates ramp

	// Tokens State (Typography, Spacing, Semantics)
	baseSize: number;
	setBaseSize: (size: number) => void;
	scale: { name: string; ratio: number };
	setScale: (scale: { name: string; ratio: number }) => void;
	baseSpacing: number;
	setBaseSpacing: (val: number) => void;
	baseRadius: number;
	setBaseRadius: (val: number) => void;
	semanticTokens: SemanticToken[];
	setSemanticTokens: (tokens: SemanticToken[]) => void;

	// Sampler State (Global Persistence)
	sampledColors: string[];
	setSampledColors: React.Dispatch<React.SetStateAction<string[]>>;
	isSamplerActive: boolean;
	setIsSamplerActive: (active: boolean) => void;

	// Remix Staging State
	stagedRemixColors: string[];
	setStagedRemixColors: React.Dispatch<React.SetStateAction<string[]>>;
	stagedRemixPalettes: any[];
	setStagedRemixPalettes: React.Dispatch<React.SetStateAction<any[]>>;

	// Canvas State (Zoom/Rotation Persistence)
	canvasState: {
		zoom: number;
		rotate: number;
		activeImage: string | null;
	};
	setCanvasState: React.Dispatch<
		React.SetStateAction<{
			zoom: number;
			rotate: number;
			activeImage: string | null;
		}>
	>;

	// Manual Mode Persistence
	visibleColorsCount: 1 | 2 | 3;
	setVisibleColorsCount: React.Dispatch<React.SetStateAction<1 | 2 | 3>>;
}

// --- Context ---

const SoloistContext = createContext<SoloistContextType | undefined>(undefined);

// --- Provider ---

export const SoloistProvider = ({ children }: { children: ReactNode }) => {
	// 1. Core Systems
	const { settings, updateSettings } = useSoloistSystem();

	// 2. UI State
	const [activeView, setActiveView] = useState<View>("explore");
	const [windowSize, setWindowSize] = useState<WindowSize>("standard");
	const [isAssistantPinned, setIsAssistantPinned] = useState(true);

	const handleResize = useCallback((size: WindowSize) => {
		setWindowSize(size);
		let width = 1000;
		let height = 700;

		if (size === "compact") {
			width = 400;
			height = 600;
			setIsAssistantPinned(false);
		} else if (size === "standard") {
			// Redundant width/height assignments already set by default
			setIsAssistantPinned(true);
		} else if (size === "studio") {
			width = 1400;
			height = 900;
			setIsAssistantPinned(true);
		}

		parent.postMessage(
			{ pluginMessage: { type: "resize-ui", width, height } },
			"*"
		);
	}, []);

	// 3. Color State
	const [seedColor, setSeedColorState] = useState("#3D8BFF");

	// Wrapper to ensure we accept valid hex only if needed, or simple pass-through
	const setSeedColor = (hex: string) => setSeedColorState(hex);

	const [ramp, setRamp] = useState(() => generateRamp(seedColor));
	const [neutralRamp, setNeutralRamp] = useState(() =>
		generateNeutrals(seedColor)
	);
	const [signalRamp, setSignalRamp] = useState(() => generateSignals());
	const [alphaRamp, setAlphaRamp] = useState(() => generateAlphas("#000000"));

	// 4. Harmony State
	const [harmonyMode, setHarmonyMode] =
		useState<HarmonyMode>("complementary");

	// Initial Ramps based on Harmony defaults
	const [secondaryRamp, setSecondaryRampState] = useState(() =>
		generateRamp(colord(seedColor).rotate(180).toHex())
	);
	const [tertiaryRamp, setTertiaryRampState] = useState(() =>
		generateRamp(colord(seedColor).rotate(-30).toHex())
	);

	const setSecondaryColor = useCallback((hex: string) => {
		setSecondaryRampState((prev) => generateRamp(hex, prev, "secondary"));
	}, []);

	const setTertiaryColor = useCallback((hex: string) => {
		setTertiaryRampState((prev) => generateRamp(hex, prev, "tertiary"));
	}, []);

	// Effect: Regenerate Ramps when Seed Changes
	useEffect(() => {
		setRamp((prevRamp) => generateRamp(seedColor, prevRamp));
		setNeutralRamp((_) => generateNeutrals(seedColor));

		// Note: We deliberately DO NOT auto-update secondary/tertiary here to allow manual divergence,
		// UNLESS we are in a specific harmony mode. For now, we follow App.tsx logic which only updated Primary/Neutral.
		// The AssistantPanel or ColorCreator handles the "Harmony Enforcement" logic.
		// We might want to move that logic HERE in the future (The "Brain" of the context).
	}, [seedColor]);

	// 5. Tokens State
	const [baseSize, setBaseSize] = useState(16);
	const [scale, setScale] = useState({ name: "Major Third", ratio: 1.25 });
	const [baseSpacing, setBaseSpacing] = useState(4);
	const [baseRadius, setBaseRadius] = useState(4);
	const [semanticTokens, setSemanticTokens] =
		useState<SemanticToken[]>(DEFAULT_SEMANTICS);

	// 6. Sampler State
	const [sampledColors, setSampledColors] = useState<string[]>([]);
	const [isSamplerActive, setIsSamplerActive] = useState(false);

	// 7. Remix Staging State
	const [stagedRemixColors, setStagedRemixColors] = useState<string[]>([]);
	const [stagedRemixPalettes, setStagedRemixPalettes] = useState<any[]>([]);

	// 8. Image/Canvas Persistence
	const [canvasState, setCanvasState] = useState<{
		zoom: number;
		rotate: number;
		activeImage: string | null;
	}>({
		zoom: 50,
		rotate: 0,
		activeImage: null,
	});

	// 9. Manual Mode Persistence
	const [visibleColorsCount, setVisibleColorsCount] = useState<1 | 2 | 3>(3);

	// --- Output ---

	const value: SoloistContextType = useMemo(
		() => ({
			activeView,
			setActiveView,
			windowSize,
			setWindowSize,
			handleResize,
			isAssistantPinned,
			setIsAssistantPinned,
			settings,
			updateSettings,
			seedColor,
			setSeedColor,
			ramp,
			setRamp,
			neutralRamp,
			setNeutralRamp,
			signalRamp,
			setSignalRamp,
			alphaRamp,
			setAlphaRamp,
			secondaryRamp,
			setSecondaryRamp: setSecondaryRampState,
			tertiaryRamp,
			setTertiaryRamp: setTertiaryRampState,
			harmonyMode,
			setHarmonyMode,
			setSecondaryColor,
			setTertiaryColor,
			baseSize,
			setBaseSize,
			scale,
			setScale,
			baseSpacing,
			setBaseSpacing,
			baseRadius,
			setBaseRadius,
			semanticTokens,
			setSemanticTokens,
			sampledColors,
			setSampledColors,
			isSamplerActive,
			setIsSamplerActive,
			stagedRemixColors,
			setStagedRemixColors,
			stagedRemixPalettes,
			setStagedRemixPalettes,
			canvasState,
			setCanvasState,
			visibleColorsCount,
			setVisibleColorsCount,
		}),
		[
			activeView,
			windowSize,
			isAssistantPinned,
			settings,
			seedColor,
			ramp,
			neutralRamp,
			signalRamp,
			alphaRamp,
			secondaryRamp,
			tertiaryRamp,
			harmonyMode,
			setSecondaryColor,
			setTertiaryColor,
			baseSize,
			scale,
			baseSpacing,
			baseRadius,
			semanticTokens,
			sampledColors,
			isSamplerActive,
			updateSettings,
			handleResize,
			stagedRemixColors,
			stagedRemixPalettes,
			canvasState,
			setCanvasState,
		]
	);

	return (
		<SoloistContext.Provider value={value}>
			{children}
		</SoloistContext.Provider>
	);
};

// --- Hook ---

export const useSoloist = () => {
	const context = useContext(SoloistContext);
	if (context === undefined) {
		throw new Error("useSoloist must be used within a SoloistProvider");
	}
	return context;
};
