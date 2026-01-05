import { useState, useEffect, useRef, useMemo } from "react";
import { colord } from "colord";
import { motion, AnimatePresence } from "framer-motion";
import {
	Sun,
	Moon,
	Zap,
	RotateCcw,
	RotateCw,
	Disc,
	Orbit,
	Heart,
	ImagePlus,
	Search,
	Droplets,
	Dices,
	Waves,
	Grid,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useSoloist } from "../../context/SoloistContext";

import { ImageCanvasPicker } from "./ImageCanvasPicker";
import { MotionColorPicker } from "../MotionColorPicker";
import { DiscreteBlendedPicker } from "./DiscreteBlendedPicker";
import { ColoredPencilsPicker } from "./ColoredPencilsPicker";
import { GenerativeGlobePicker } from "./GenerativeGlobePicker";
import { SharedSampler } from "../common/SharedSampler";

import "./ColorCreator.css";

interface ColorCreatorProps {
	seedColor: string;
	setSeedColor: (color: string) => void;
	secondaryColor: string;
	setSecondaryColor: (color: string) => void;
	tertiaryColor: string;
	setTertiaryColor: (color: string) => void;
	favoriteColors?: string[];
	onToggleFavoriteColor?: (hex: string) => Promise<unknown> | void;
	harmonyMode?: "complementary" | "analogous" | "triadic" | "manual";
	setHarmonyMode?: (
		mode: "complementary" | "analogous" | "triadic" | "manual"
	) => void;
	activeColorSlot?: "primary" | "secondary" | "tertiary";
	setActiveColorSlot?: (slot: "primary" | "secondary" | "tertiary") => void;
}

type WheelMode =
	| "default"
	| "bright"
	| "dark"
	| "saturated"
	| "desaturated"
	| "cool"
	| "warm";

type StudioTab = "CONTINUOUS" | "DISCRETE" | "GENERATIVE" | "SAMPLED";

export const ColorCreator = ({
	seedColor,
	setSeedColor,
	secondaryColor,
	tertiaryColor,
	setSecondaryColor,
	setTertiaryColor,
	favoriteColors = [],
	onToggleFavoriteColor,
	harmonyMode = "complementary",
	setHarmonyMode = () => {},
	activeColorSlot = "primary",
	setActiveColorSlot,
}: ColorCreatorProps) => {
	const {
		sampledColors,
		setSampledColors,
		isSamplerActive,
		setIsSamplerActive,
		canvasState,
		setCanvasState,
	} = useSoloist();

	const {
		zoom: zoomVal,
		rotate: rotateVal,
		activeImage,
		motionDensity,
		motionSize,
	} = canvasState;

	const setZoomVal = (val: number) =>
		setCanvasState((prev) => ({ ...prev, zoom: val }));
	const setRotateVal = (val: number) =>
		setCanvasState((prev) => ({ ...prev, rotate: val }));
	const setActiveImage = (val: string | null) =>
		setCanvasState((prev) => ({ ...prev, activeImage: val }));
	const setMotionDensity = (val: number) =>
		setCanvasState((prev) => ({ ...prev, motionDensity: val }));
	const setMotionSize = (val: number) =>
		setCanvasState((prev) => ({ ...prev, motionSize: val }));

	const [wheelMode] = useState<WheelMode>("default");
	const [activeTab, setActiveTab] = useState<StudioTab>("CONTINUOUS");

	// Subtype states for each tab
	const [discreteType, setDiscreteType] = useState<
		"motion" | "blended" | "pencils" | "swatches"
	>("motion");
	const [genType, setGenType] = useState<
		"gradient" | "globe" | "lava" | "kaleidoscope"
	>("kaleidoscope");

	const [lastUserImage, setLastUserImage] = useState<string | null>(null);
	const [hoverHex, setHoverHex] = useState<string | null>(null);
	const [isFavoritingHex, setIsFavoritingHex] = useState<string | null>(null);

	// Dynamic Control Bar State
	const [speedVal, setSpeedVal] = useState(0);
	const [senseVal, setSenseVal] = useState(0);

	// Canvas Filters
	const [brightness, setBrightness] = useState(1);
	const [isInverted, setIsInverted] = useState(false);
	const [vibrance, setVibrance] = useState(1);

	// Persist last uploaded image & sampler state across sessions via Figma clientStorage
	useEffect(() => {
		const keys = [
			"soloist-last-image",
			"soloist-sampled-colors",
			"soloist-sampler-active",
		];
		keys.forEach((key) => {
			parent.postMessage(
				{
					pluginMessage: {
						type: "load-storage",
						payload: { key },
					},
				},
				"*"
			);
		});
	}, []);

	// Persist last user-uploaded image across sessions via Figma clientStorage
	useEffect(() => {
		if (lastUserImage && lastUserImage !== "generated:crayons") {
			parent.postMessage(
				{
					pluginMessage: {
						type: "save-storage",
						payload: {
							key: "soloist-last-image",
							data: lastUserImage,
						},
					},
				},
				"*"
			);
		}
	}, [lastUserImage]);

	// Sync sampler state to storage
	useEffect(() => {
		parent.postMessage(
			{
				pluginMessage: {
					type: "save-storage",
					payload: {
						key: "soloist-sampled-colors",
						data: sampledColors,
					},
				},
			},
			"*"
		);
	}, [sampledColors]);

	useEffect(() => {
		parent.postMessage(
			{
				pluginMessage: {
					type: "save-storage",
					payload: {
						key: "soloist-sampler-active",
						data: isSamplerActive,
					},
				},
			},
			"*"
		);
	}, [isSamplerActive]);

	const toast = useToast();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const lastToastTimeRef = useRef<number>(0);

	// Listen for Backend Messages (Color Picking & Live Sampling)
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const msg = event.data.pluginMessage;
			if (!msg) return;

			if (msg.type === "color-picked") {
				commitHex(msg.payload.hex);
			} else if (msg.type === "storage-loaded") {
				const { key, data } = msg.payload;
				if (
					key === "soloist-last-image" &&
					data &&
					data !== "generated:crayons"
				) {
					setLastUserImage(data);
					setActiveImage(data);
				} else if (key === "soloist-sampled-colors") {
					if (data) setSampledColors(data);
				} else if (key === "soloist-sampler-active") {
					if (data !== undefined) setIsSamplerActive(data);
				}
			} else if (msg.type === "selection-colors" && isSamplerActive) {
				const newColors: string[] = msg.payload.colors || [];
				if (newColors.length === 0) return;

				const uniqueIncoming = newColors
					.map((c) => c.toLowerCase())
					.filter(
						(hex, idx, self) =>
							!sampledColors
								.map((c) => c.toLowerCase())
								.includes(hex) && self.indexOf(hex) === idx
					);

				setSampledColors((prev: string[]) => {
					const currentLowers = prev.map((c) => c.toLowerCase());
					const distinct = uniqueIncoming.filter(
						(c: string) => !currentLowers.includes(c)
					);

					if (distinct.length === 0) return prev;

					const availableSlots = 10 - prev.length;

					if (availableSlots <= 0) {
						const now = Date.now();
						if (now - lastToastTimeRef.current > 3000) {
							toast.transient(
								<span>
									<span className="text-accent-cyan">
										Orbit full
									</span>{" "}
									(10/10)
								</span>
							);
							lastToastTimeRef.current = now;
						}
						return prev;
					}

					if (distinct.length > availableSlots) {
						const now = Date.now();
						if (now - lastToastTimeRef.current > 3000) {
							toast.transient(
								<span>
									Orbit full. Only{" "}
									<span className="text-accent-cyan">
										{availableSlots} colors
									</span>{" "}
									added.
								</span>
							);
							lastToastTimeRef.current = now;
						}
						return [...prev, ...distinct.slice(0, availableSlots)];
					}

					return [...prev, ...distinct];
				});
			}
		};

		window.addEventListener("message", handleMessage);

		if (isSamplerActive) {
			parent.postMessage(
				{ pluginMessage: { type: "request-selection-colors" } },
				"*"
			);
		}

		return () => window.removeEventListener("message", handleMessage);
	}, [isSamplerActive, toast, sampledColors]);

	// Manage Color Slot Focus
	useEffect(() => {
		if (harmonyMode !== "manual" && activeColorSlot !== "primary") {
			setActiveColorSlot?.("primary");
		}
	}, [harmonyMode, activeColorSlot, setActiveColorSlot]);

	// Calculate Harmonies
	const harmonies = useMemo(() => {
		const c = colord(seedColor);
		if (harmonyMode === "complementary") {
			return {
				sec: c.rotate(180).toHex(),
				tert: c.rotate(-30).toHex(),
			};
		} else if (harmonyMode === "analogous") {
			return {
				sec: c.rotate(-30).toHex(),
				tert: c.rotate(30).toHex(),
			};
		} else if (harmonyMode === "triadic") {
			return {
				sec: c.rotate(120).toHex(),
				tert: c.rotate(240).toHex(),
			};
		}
		return { sec: null, tert: null };
	}, [seedColor, harmonyMode]);

	// Sync Global State
	useEffect(() => {
		if (harmonyMode === "manual") return;

		if (
			harmonies.sec &&
			setSecondaryColor &&
			harmonies.sec !== secondaryColor
		) {
			setSecondaryColor(harmonies.sec);
		}
		if (
			harmonies.tert &&
			setTertiaryColor &&
			harmonies.tert !== tertiaryColor
		) {
			setTertiaryColor(harmonies.tert);
		}
	}, [
		harmonies,
		harmonyMode,
		setSecondaryColor,
		setTertiaryColor,
		secondaryColor,
		tertiaryColor,
	]);

	// Determine Display Colors
	let activeColor = seedColor;
	const displaySecondary =
		harmonyMode === "manual"
			? secondaryColor
			: harmonies.sec ?? secondaryColor;
	const displayTertiary =
		harmonyMode === "manual"
			? tertiaryColor
			: harmonies.tert ?? tertiaryColor;

	// Determine Swapped Colors for Wheel Markers
	let markerSecondary = displaySecondary;
	let markerTertiary = displayTertiary;

	if (harmonyMode === "manual") {
		if (activeColorSlot === "secondary") {
			activeColor = secondaryColor;
			markerSecondary = seedColor;
			markerTertiary = tertiaryColor;
		} else if (activeColorSlot === "tertiary") {
			activeColor = tertiaryColor;
			markerSecondary = seedColor;
			markerTertiary = secondaryColor;
		}
	}

	const color = colord(activeColor);
	const hsla = color.toHsl();

	const favoriteHexes = useMemo(() => {
		return new Set(favoriteColors.map((c) => c.toUpperCase()));
	}, [favoriteColors]);

	const handleToggleFavorite = async (hex: string) => {
		if (!onToggleFavoriteColor) return;
		const normalized = hex.toUpperCase();
		try {
			setIsFavoritingHex(normalized);
			await onToggleFavoriteColor(normalized);
			toast.transient(
				<span>
					{favoriteHexes.has(normalized)
						? "Removed from favorites"
						: "Added to favorites"}{" "}
					<span className="text-accent-cyan">{normalized}</span>
				</span>
			);
		} catch (e) {
			console.error("Failed to toggle favorite color", e);
			toast.standard(
				<span>
					Couldn’t favorite{" "}
					<span className="text-accent-cyan">{normalized}</span>
				</span>
			);
		} finally {
			setIsFavoritingHex(null);
		}
	};

	const commitHex = (hex: string, options?: { skipRecording?: boolean }) => {
		if (isSamplerActive && !options?.skipRecording) {
			const normalizedHex = hex.toLowerCase();
			setSampledColors((prev) => {
				if (prev.some((c) => c.toLowerCase() === normalizedHex))
					return prev;
				if (prev.length >= 10) {
					toast.standard(
						<span>
							<span className="text-accent-cyan">Orbit full</span>{" "}
							(10/10)
						</span>
					);
					return prev;
				}
				return [...prev, normalizedHex];
			});
		}

		if (harmonyMode === "manual") {
			if (activeColorSlot === "secondary") setSecondaryColor(hex);
			else if (activeColorSlot === "tertiary") setTertiaryColor(hex);
			else setSeedColor(hex);
		} else {
			setSeedColor(hex);
		}
	};

	const handleColorChange = (
		updates: Partial<{ h: number; s: number; l: number }>,
		options?: { skipRecording?: boolean }
	) => {
		const newColor = colord({
			h: updates.h ?? hsla.h,
			s: updates.s ?? hsla.s,
			l: updates.l ?? hsla.l,
		}).toHex();
		commitHex(newColor, options);
	};

	const shuffleColor = () => {
		const randomHex = colord({
			h: Math.floor(Math.random() * 360),
			s: 40 + Math.floor(Math.random() * 50),
			l: 40 + Math.floor(Math.random() * 40),
		}).toHex();
		commitHex(randomHex, { skipRecording: true });
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (ev) => {
			if (ev.target?.result) {
				const result = ev.target.result as string;
				setActiveImage(result);
				setLastUserImage(result);
			}
		};
		reader.readAsDataURL(file);
	};

	const activateCrayons = () => {
		setActiveImage("generated:crayons");
	};

	// --- Responsive Canvas Size Management ---
	const canvasRef = useRef<HTMLDivElement>(null);
	const [canvasSize, setCanvasSize] = useState(400);

	useEffect(() => {
		if (!canvasRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				// Maintain square aspect ratio based on the smaller dimension
				const size = Math.min(width, height);
				if (size > 0) setCanvasSize(size);
			}
		});

		observer.observe(canvasRef.current);
		return () => observer.disconnect();
	}, []);

	// ---------------------------
	// Render Helpers
	// ---------------------------

	const renderTabs = () => (
		<div className="flex-shrink-0 flex items-center justify-between w-full h-[43px] px-2 mb-6 border-b border-glass-stroke">
			<div className="flex gap-4">
				{(
					[
						"CONTINUOUS",
						"DISCRETE",
						"GENERATIVE",
						"SAMPLED",
					] as StudioTab[]
				).map((tab) => {
					const isActive = activeTab === tab;
					return (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`pb-2 text-xs font-mono tracking-wider transition-all relative ${
								isActive
									? "text-white"
									: "text-gray-500 hover:text-gray-300"
							}`}
						>
							{tab}
							{isActive && (
								<motion.div
									layoutId="studio-tab-active"
									className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan shadow-[0_0_8px_rgba(63,227,242,0.8)]"
									transition={{
										type: "spring",
										stiffness: 500,
										damping: 30,
									}}
								/>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);

	const renderTopToolbar = () => (
		<div className="h-[43px] flex items-center justify-center gap-4 p-1 px-4 rounded-full bg-bg-raised/95 backdrop-blur-xl border border-glass-stroke shadow-monolith z-30 overflow-hidden translate-y-2">
			<button
				onClick={() => {
					setBrightness(1);
					setVibrance(1);
					setIsInverted(false);
				}}
				className="p-2 text-gray-400 hover:text-white transition-colors"
				title="Reset Filters"
			>
				<RotateCcw size={16} />
			</button>

			<div className="w-px h-4 bg-white/10" />

			{/* Filter: Brightness */}
			<div className="flex items-center gap-2 group">
				<Sun
					size={14}
					className="text-white/40 group-hover:text-white transition-colors"
				/>
				<input
					type="range"
					min="0.5"
					max="1.5"
					step="0.01"
					value={brightness}
					onChange={(e) => setBrightness(Number(e.target.value))}
					className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-cyan"
				/>
			</div>

			{/* Filter: Contrast/Vibrance (Combined for space) */}
			<div className="flex items-center gap-2 group">
				<Zap
					size={14}
					className="text-white/40 group-hover:text-white transition-colors"
				/>
				<input
					type="range"
					min="0"
					max="2"
					step="0.01"
					value={vibrance}
					onChange={(e) => setVibrance(Number(e.target.value))}
					className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-violet"
				/>
			</div>

			<div className="w-px h-4 bg-white/10" />

			{/* Action: Invert */}
			<button
				onClick={() => setIsInverted(!isInverted)}
				className={`p-2 rounded-full transition-all ${
					isInverted
						? "text-accent-cyan bg-white/10"
						: "text-gray-400 hover:text-white"
				}`}
				title="Invert Colors"
			>
				<Moon size={16} />
			</button>

			{wheelMode !== "default" && (
				<>
					<div className="w-px h-4 bg-white/10" />
					<span className="text-[10px] text-accent-cyan font-mono uppercase px-2">
						{wheelMode}
					</span>
				</>
			)}
		</div>
	);

	const renderLeftToolbar = () => (
		<div className="w-[52px] flex items-center justify-center">
			<div className="flex flex-col items-center gap-2 p-1.5 rounded-full bg-bg-raised/95 backdrop-blur-xl border border-glass-stroke shadow-monolith w-[44px]">
				{activeTab === "CONTINUOUS" &&
					["manual", "complementary", "analogous", "triadic"].map(
						(m) => {
							const isActive = harmonyMode === m;
							return (
								<button
									key={m}
									onClick={() => setHarmonyMode(m as any)}
									className={`relative p-2 rounded-full transition-all ${
										isActive
											? "text-white"
											: "text-gray-400 hover:text-white"
									}`}
									title={m.toUpperCase()}
								>
									{isActive && (
										<motion.div
											layoutId="harmony-active-bg"
											className="absolute inset-0 bg-white/10 rounded-full shadow-sm border border-glass-stroke -z-10"
										/>
									)}
									<Disc size={16} />
								</button>
							);
						}
					)}
				{activeTab === "DISCRETE" &&
					["motion", "blended", "pencils"].map((type) => {
						const isActive = discreteType === type;
						return (
							<button
								key={type}
								onClick={() => setDiscreteType(type as any)}
								className={`relative p-2 rounded-full transition-all ${
									isActive
										? "text-accent-cyan bg-white/10"
										: "text-gray-500 hover:text-white"
								}`}
								title={type.toUpperCase()}
							>
								{type === "motion" && <Waves size={16} />}
								{type === "blended" && <Droplets size={16} />}
								{type === "pencils" && <Grid size={16} />}
							</button>
						);
					})}
				{activeTab === "GENERATIVE" &&
					["kaleidoscope", "globe"].map((type) => {
						const isActive = genType === type;
						return (
							<button
								key={type}
								onClick={() => setGenType(type as any)}
								className={`relative p-2 rounded-full transition-all ${
									isActive
										? "text-accent-violet bg-white/10"
										: "text-gray-500 hover:text-white"
								}`}
								title={type.toUpperCase()}
							>
								{type === "kaleidoscope" && <Orbit size={16} />}
								{type === "globe" && <Sun size={16} />}
							</button>
						);
					})}
				{activeTab === "SAMPLED" && (
					<button
						className="p-2 text-primary bg-white/10 rounded-full"
						onClick={() => fileInputRef.current?.click()}
					>
						<ImagePlus size={16} />
					</button>
				)}
			</div>
		</div>
	);

	const renderRightToolbar = () => (
		<div className="w-[52px] flex items-center justify-center relative">
			<div className="flex flex-col items-center gap-6">
				{/* Color Slot Selection */}
				<div className="flex flex-col items-center gap-2 p-1.5 rounded-full bg-bg-raised/95 backdrop-blur-xl border border-glass-stroke shadow-monolith w-[44px]">
					{[
						{ id: "primary", num: "1", color: seedColor },
						{ id: "secondary", num: "2", color: displaySecondary },
						{ id: "tertiary", num: "3", color: displayTertiary },
					].map((slot) => {
						const isActive = activeColorSlot === slot.id;
						const isManual = harmonyMode === "manual";
						const slotHex = slot.color.toUpperCase();
						const isFavorite = favoriteHexes.has(slotHex);
						return (
							<div
								key={slot.id}
								className="flex flex-col items-center gap-1"
							>
								<button
									onClick={() =>
										isManual &&
										setActiveColorSlot?.(slot.id as any)
									}
									className={`group relative p-1 rounded-full transition-all duration-300 ${
										isManual
											? "cursor-pointer"
											: "cursor-default"
									} ${
										isActive
											? "bg-white/10 shadow-sm ring-1 ring-white/20"
											: ""
									}`}
								>
									<div
										className={`w-6 h-6 rounded-full border border-white/20 shadow-sm transition-transform duration-300 flex items-center justify-center ${
											isActive
												? "scale-110 shadow-neon-glow"
												: "group-hover:scale-110"
										}`}
										style={{ backgroundColor: slot.color }}
									>
										<span className="text-[10px] font-black text-white mix-blend-difference opacity-60">
											{slot.num}
										</span>
									</div>
									{isActive && (
										<motion.div
											layoutId="active-slot-glow"
											className="absolute -inset-0.5 rounded-full border border-accent-cyan/40 pointer-events-none"
										/>
									)}
								</button>

								{onToggleFavoriteColor && (
									<button
										onClick={() =>
											handleToggleFavorite(slotHex)
										}
										disabled={isFavoritingHex === slotHex}
										className={`p-1 rounded-full transition-colors ${
											isFavorite
												? "text-accent-cyan"
												: "text-gray-500 hover:text-white"
										} ${
											isFavoritingHex === slotHex
												? "opacity-50 cursor-wait"
												: ""
										}`}
										title={
											isFavorite
												? `Unfavorite ${slotHex}`
												: `Favorite ${slotHex}`
										}
										aria-label={
											isFavorite
												? `Unfavorite ${slotHex}`
												: `Favorite ${slotHex}`
										}
									>
										<Heart
											size={12}
											fill={
												isFavorite
													? "currentColor"
													: "none"
											}
											strokeWidth={2.5}
										/>
									</button>
								)}
							</div>
						);
					})}
				</div>

				{/* Shared Sampler Orbit */}
				<div className="relative">
					<SharedSampler
						onSelectColor={(hex: string) => commitHex(hex)}
					/>
				</div>
			</div>
		</div>
	);

	const renderBottomToolbar = () => (
		<div className="h-[43px] flex items-center justify-center gap-4 p-1 px-4 rounded-full bg-bg-raised/95 backdrop-blur-xl border border-glass-stroke shadow-monolith z-30 -translate-y-2">
			{/* Left Slider */}
			<div className="flex items-center gap-2 px-2">
				{activeTab === "CONTINUOUS" ? (
					<Droplets size={14} className="text-white/40" />
				) : (
					<Search size={14} className="text-white/40" />
				)}
				<input
					type="range"
					min="0"
					max="100"
					value={
						activeTab === "CONTINUOUS"
							? hsla.s
							: activeTab === "DISCRETE"
							? motionDensity
							: activeTab === "GENERATIVE"
							? speedVal
							: zoomVal
					}
					onChange={(e) => {
						const val = Number(e.target.value);
						if (activeTab === "CONTINUOUS")
							handleColorChange(
								{ s: val },
								{ skipRecording: true }
							);
						else if (activeTab === "DISCRETE")
							setMotionDensity(val);
						else if (activeTab === "GENERATIVE") setSpeedVal(val);
						else setZoomVal(val);
					}}
					className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-cyan"
				/>
			</div>

			<div className="w-px h-4 bg-white/10" />

			{/* Hex Display */}
			<div
				className="px-3 h-[24px] flex items-center justify-center rounded-full border border-white/20 shadow-lg transition-colors duration-200 min-w-[80px]"
				style={{ backgroundColor: hoverHex || activeColor }}
			>
				<span
					className="font-mono text-[11px] font-bold tracking-wider"
					style={{
						color: colord(hoverHex || activeColor).isDark()
							? "rgba(255,255,255,0.95)"
							: "rgba(0,0,0,0.9)",
					}}
				>
					{(hoverHex || activeColor).toUpperCase()}
				</span>
			</div>

			<div className="w-px h-4 bg-white/10" />

			{/* Right Slider */}
			<div className="flex items-center gap-2 px-2">
				<input
					type="range"
					min={activeTab === "SAMPLED" ? "-180" : "0"}
					max={activeTab === "SAMPLED" ? "180" : "100"}
					value={
						activeTab === "CONTINUOUS"
							? hsla.l
							: activeTab === "DISCRETE"
							? motionSize
							: activeTab === "GENERATIVE"
							? senseVal
							: rotateVal
					}
					onChange={(e) => {
						const val = Number(e.target.value);
						if (activeTab === "CONTINUOUS")
							handleColorChange(
								{ l: val },
								{ skipRecording: true }
							);
						else if (activeTab === "DISCRETE") setMotionSize(val);
						else if (activeTab === "GENERATIVE") setSenseVal(val);
						else setRotateVal(val);
					}}
					className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-cyan"
				/>
				{activeTab === "CONTINUOUS" ? (
					<Sun size={14} className="text-white/40" />
				) : (
					<RotateCw size={14} className="text-white/40" />
				)}
			</div>

			<div className="w-px h-4 bg-white/10 mx-1" />
			{onToggleFavoriteColor && (
				<>
					<button
						onClick={() =>
							handleToggleFavorite(hoverHex || activeColor)
						}
						disabled={
							isFavoritingHex ===
							(hoverHex || activeColor).toUpperCase()
						}
						className={`p-2 transition-colors ${
							favoriteHexes.has(
								(hoverHex || activeColor).toUpperCase()
							)
								? "text-accent-cyan"
								: "text-gray-400 hover:text-white"
						} ${
							isFavoritingHex ===
							(hoverHex || activeColor).toUpperCase()
								? "opacity-50 cursor-wait"
								: ""
						}`}
						title={
							favoriteHexes.has(
								(hoverHex || activeColor).toUpperCase()
							)
								? `Unfavorite ${(
										hoverHex || activeColor
								  ).toUpperCase()}`
								: `Favorite ${(
										hoverHex || activeColor
								  ).toUpperCase()}`
						}
					>
						<Heart
							size={16}
							fill={
								favoriteHexes.has(
									(hoverHex || activeColor).toUpperCase()
								)
									? "currentColor"
									: "none"
							}
						/>
					</button>
					<div className="w-px h-4 bg-white/10 mx-1" />
				</>
			)}
			<button
				onClick={shuffleColor}
				className="p-2 text-gray-400 hover:text-white transition-colors"
				title="Shuffle"
			>
				<Dices size={16} />
			</button>
		</div>
	);

	return (
		<div
			className="h-full flex flex-col p-0 overflow-hidden custom-scrollbar relative"
			style={{ scrollbarGutter: "stable" }}
		>
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept="image/*"
				className="hidden"
			/>

			{renderTabs()}

			<div className="relative w-full flex-1 overflow-visible">
				{/* Toolbars - Anchored to edges */}
				<div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
					{renderTopToolbar()}
				</div>

				<div className="absolute left-2 top-1/2 -translate-y-1/2 z-40 pointer-events-auto">
					{renderLeftToolbar()}
				</div>

				<div className="absolute right-2 top-1/2 -translate-y-1/2 z-40 pointer-events-auto">
					{renderRightToolbar()}
				</div>

				<div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
					{renderBottomToolbar()}
				</div>

				{/* Center Scaling Canvas */}
				<div className="absolute inset-0 flex items-center justify-center p-20 pointer-events-none">
					{/* Center: Standardized Circular Canvas Rim */}
					<div
						ref={canvasRef}
						className="relative aspect-square w-full max-w-[min(450px,70vh)] flex-none flex items-center justify-center group pointer-events-auto"
					>
						<div
							className="absolute inset-0 rounded-full border-[1.5px] border-transparent opacity-80 z-50 pointer-events-none"
							style={{
								background:
									"linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet) border-box",
								WebkitMask:
									"linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
								WebkitMaskComposite: "destination-out",
								maskComposite: "exclude",
							}}
						/>

						<div className="relative w-full h-full flex items-center justify-center">
							<AnimatePresence mode="wait">
								<motion.div
									key={activeTab}
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ duration: 0.2 }}
									className="w-full h-full flex items-center justify-center"
								>
									{activeTab === "CONTINUOUS" && (
										<div className="w-full h-full relative">
											<div className="absolute inset-0 flex items-center justify-center">
												<ColorWheel
													size={canvasSize - 20} // Inset slightly for the rim
													hue={hsla.h}
													saturation={hsla.s}
													onChange={(h, s) =>
														handleColorChange({
															h,
															s,
														})
													}
													onHoverColor={setHoverHex}
													secondaryColor={
														markerSecondary
													}
													tertiaryColor={
														markerTertiary
													}
													wheelMode={wheelMode}
												/>
											</div>
										</div>
									)}
									{activeTab === "DISCRETE" && (
										<>
											{discreteType === "motion" && (
												<MotionColorPicker
													onChange={(hex) =>
														commitHex(hex)
													}
													onHoverColor={setHoverHex}
													density={motionDensity}
													size={motionSize}
												/>
											)}
											{discreteType === "blended" && (
												<DiscreteBlendedPicker
													onChange={(hex) =>
														commitHex(hex)
													}
													onHoverColor={setHoverHex}
												/>
											)}
											{discreteType === "pencils" && (
												<ColoredPencilsPicker
													onChange={(hex) =>
														commitHex(hex)
													}
													onHoverColor={setHoverHex}
												/>
											)}
										</>
									)}
									{activeTab === "GENERATIVE" &&
										genType === "globe" && (
											<GenerativeGlobePicker
												onChange={(hex) =>
													commitHex(hex)
												}
												onHoverColor={setHoverHex}
											/>
										)}
									{activeTab === "GENERATIVE" &&
										genType === "kaleidoscope" &&
										activeImage && (
											<div className="w-full h-full flex items-center justify-center">
												<ImageCanvasPicker
													onSelectColor={(hex) =>
														commitHex(hex)
													}
													imageUrl={activeImage}
													speedVal={speedVal}
													senseVal={senseVal}
													zoomVal={zoomVal}
													rotateVal={rotateVal}
													onHoverColor={setHoverHex}
													brightness={brightness}
													vibrance={vibrance}
													isInverted={isInverted}
												/>
											</div>
										)}
									{activeTab === "SAMPLED" && activeImage && (
										<div className="w-full h-full flex items-center justify-center">
											<ImageCanvasPicker
												onSelectColor={(hex) =>
													commitHex(hex)
												}
												imageUrl={activeImage}
												speedVal={0}
												senseVal={0}
												zoomVal={zoomVal}
												rotateVal={rotateVal}
												onHoverColor={setHoverHex}
												brightness={brightness}
												vibrance={vibrance}
												isInverted={isInverted}
											/>
										</div>
									)}
									{(activeTab === "GENERATIVE" ||
										activeTab === "SAMPLED") &&
										!activeImage && (
											<div className="flex flex-col items-center gap-4 text-white/40">
												<ImagePlus
													size={48}
													strokeWidth={1}
												/>
												<button
													onClick={() =>
														fileInputRef.current?.click()
													}
													className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all text-xs font-mono tracking-widest"
												>
													UPLOAD SOURCE
												</button>
												<button
													onClick={activateCrayons}
													className="text-[10px] underline hover:text-white transition-colors"
												>
													or use default source
												</button>
											</div>
										)}
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// ---------------------------
// Color Wheel Component
// ---------------------------

interface ColorWheelProps {
	size: number;
	hue: number;
	saturation: number;
	onChange: (h: number, s: number) => void;
	secondaryColor?: string;
	tertiaryColor?: string;
	wheelMode?: WheelMode;
	onHoverColor?: (hex: string | null) => void;
	lightness?: number;
}

const ColorWheel = ({
	size,
	hue,
	saturation,
	onChange,
	secondaryColor,
	tertiaryColor,
	lightness = 50,
	wheelMode = "default",
	onHoverColor,
}: ColorWheelProps) => {
	const wheelRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
	const [isHovering, setIsHovering] = useState(false);
	const radius = size / 2;

	const getHueFromAngle = (angle: number) => {
		if (wheelMode === "cool") return 160 + (angle / 360) * 120;
		if (wheelMode === "warm") {
			let h = -20 + (angle / 360) * 100;
			if (h < 0) h += 360;
			return h;
		}
		return angle;
	};

	const getAngleFromHue = (h: number) => {
		if (wheelMode === "cool") return ((h - 160) / 120) * 360;
		if (wheelMode === "warm") {
			let normalizedH = h > 180 ? h - 360 : h;
			return ((normalizedH + 20) / 100) * 360;
		}
		return h;
	};

	const getPosition = (h: number, s: number) => {
		const angle = getAngleFromHue(h);
		const angleRad = (angle - 90) * (Math.PI / 180);
		const dist = (s / 100) * radius;
		return {
			x: radius + Math.cos(angleRad) * dist,
			y: radius + Math.sin(angleRad) * dist,
		};
	};

	const mainPos = getPosition(hue, saturation);

	const handleMove = (clientX: number, clientY: number) => {
		if (!wheelRef.current) return;
		const rect = wheelRef.current.getBoundingClientRect();
		const cx = rect.left + radius;
		const cy = rect.top + radius;
		const dx = clientX - cx;
		const dy = clientY - cy;
		let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
		if (angle < 0) angle += 360;
		const dist = Math.hypot(dx, dy);
		const s = Math.min(100, (dist / radius) * 100);
		const h = getHueFromAngle(angle);
		onChange(h, s);
	};

	useEffect(() => {
		const onMouseMove = (e: MouseEvent) => {
			if (isDragging) handleMove(e.clientX, e.clientY);
		};
		const onMouseUp = () => setIsDragging(false);
		if (isDragging) {
			globalThis.addEventListener("mousemove", onMouseMove);
			globalThis.addEventListener("mouseup", onMouseUp);
		}
		return () => {
			globalThis.removeEventListener("mousemove", onMouseMove);
			globalThis.removeEventListener("mouseup", onMouseUp);
		};
	}, [isDragging]);

	const getMouseColor = (x: number, y: number) => {
		const dx = x - radius;
		const dy = y - radius;
		let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
		if (angle < 0) angle += 360;
		const dist = Math.hypot(dx, dy);
		const s = Math.min(100, (dist / radius) * 100);
		const h = getHueFromAngle(angle);
		let lVal = 50;
		if (wheelMode === "bright") lVal = 60;
		else if (wheelMode === "dark") lVal = 30;
		return colord({ h, s, l: lVal }).toHex();
	};

	const hoverColor = getMouseColor(hoverPos.x, hoverPos.y);

	useEffect(() => {
		if (isHovering) onHoverColor?.(hoverColor);
		else onHoverColor?.(null);
	}, [isHovering, hoverColor, onHoverColor]);

	const stops = useMemo(() => {
		const steps = 12;
		const arr = [];
		for (let i = 0; i <= steps; i++) {
			const d = (i / steps) * 360;
			const h = getHueFromAngle(d);
			let s = 100;
			let l = lightness;
			if (wheelMode === "bright") l = 85;
			else if (wheelMode === "dark") l = 20;
			else if (wheelMode === "desaturated") s = 25;
			arr.push(`${colord({ h, s, l }).toHex()} ${d}deg`);
		}
		return arr.join(", ");
	}, [lightness, wheelMode, getHueFromAngle]);

	const centerColor = useMemo(() => {
		let l = lightness;
		if (wheelMode === "bright") l = 95;
		else if (wheelMode === "dark") l = 10;
		return colord({ h: 0, s: 0, l }).toHex();
	}, [lightness, wheelMode]);

	const secPos = useMemo(
		() =>
			secondaryColor
				? getPosition(
						colord(secondaryColor).hue(),
						colord(secondaryColor).toHsl().s
				  )
				: null,
		[secondaryColor, wheelMode]
	);
	const tertPos = useMemo(
		() =>
			tertiaryColor
				? getPosition(
						colord(tertiaryColor).hue(),
						colord(tertiaryColor).toHsl().s
				  )
				: null,
		[tertiaryColor, wheelMode]
	);

	return (
		<div
			ref={wheelRef}
			className={`rounded-full relative shadow-2xl transition-all duration-500 ${
				isHovering || isDragging ? "cursor-none" : "cursor-crosshair"
			}`}
			style={{
				width: size,
				height: size,
				background: `radial-gradient(circle at center, ${centerColor} 0%, transparent 80%), conic-gradient(from 0deg, ${stops})`,
			}}
			onMouseDown={(e) => {
				setIsDragging(true);
				handleMove(e.clientX, e.clientY);
			}}
			onMouseMove={(e) => {
				const rect = wheelRef.current?.getBoundingClientRect();
				if (rect)
					setHoverPos({
						x: e.clientX - rect.left,
						y: e.clientY - rect.top,
					});
				setIsHovering(true);
			}}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
		>
			<div className="absolute inset-0 rounded-full bg-black/5 pointer-events-none" />
			{secPos && (
				<div
					className="absolute w-4 h-4 rounded-full border-2 border-white/50 shadow-lg pointer-events-none transition-all duration-300"
					style={{
						left: secPos.x,
						top: secPos.y,
						backgroundColor: secondaryColor,
						transform: "translate(-50%, -50%)",
						zIndex: 5,
					}}
				/>
			)}
			{tertPos && (
				<div
					className="absolute w-4 h-4 rounded-full border-2 border-white/50 shadow-lg pointer-events-none transition-all duration-300"
					style={{
						left: tertPos.x,
						top: tertPos.y,
						backgroundColor: tertiaryColor,
						transform: "translate(-50%, -50%)",
						zIndex: 5,
					}}
				/>
			)}
			<div
				className="absolute w-7 h-7 rounded-full border-[3px] border-white shadow-2xl transition-all duration-75 z-20"
				style={{
					left: mainPos.x,
					top: mainPos.y,
					backgroundColor: colord({
						h: hue,
						s: saturation,
						l: 50,
					}).toHex(),
					transform: `translate(-50%, -50%) scale(${
						isDragging ? 0.9 : 1
					})`,
					cursor: isDragging ? "grabbing" : "grab",
				}}
			/>
			{isHovering && !isDragging && (
				<div
					className="absolute pointer-events-none transition-transform duration-75 rounded-full z-50 bg-transparent flex items-center justify-center"
					style={{
						left: hoverPos.x,
						top: hoverPos.y,
						width: 40,
						height: 40,
						transform: "translate(-50%, -50%)",
						border: "2px solid rgba(255,255,255,0.8)",
						boxShadow:
							"0 0 10px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.2)",
					}}
				>
					<div
						className="w-2 h-2 rounded-full shadow-sm"
						style={{
							backgroundColor: hoverColor,
							border: "1px solid rgba(255,255,255,0.8)",
						}}
					/>
				</div>
			)}
		</div>
	);
};
