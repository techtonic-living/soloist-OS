import React, {
	createContext,
	useContext,
	useState,
	useEffect,
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
	updateSettings: (newSettings: Partial<SystemSettings>) => void;

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
			width = 1000;
			height = 700;
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

	// --- Output ---

	const value: SoloistContextType = {
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
		setSecondaryRamp: setSecondaryRampState, // Map state setter to context name
		tertiaryRamp,
		setTertiaryRamp: setTertiaryRampState, // Map state setter to context name
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
	};

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
