import { useState, useEffect, useRef, useMemo } from "react";
import { colord } from "colord";
import { motion } from "framer-motion";
import {
	Sun,
	Moon,
	Zap,
	Cloud,
	ThermometerSnowflake,
	ThermometerSun,
	RotateCcw,
	RotateCw,
	X,
	Disc,
	Orbit,
	ImagePlus,
	Gauge,
	Search,
	MousePointer2,
	Droplets,
	Dices,
	Waves,
	Grid,
	MoveDiagonal,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useSoloist } from "../../context/SoloistContext";

import { ImageCanvasPicker } from "./ImageCanvasPicker";
import { MotionColorPicker } from "../MotionColorPicker";
import { SharedSampler } from "../common/SharedSampler";

import "./ColorCreator.css";

interface ColorCreatorProps {
	seedColor: string;
	setSeedColor: (color: string) => void;
	secondaryColor: string;
	setSecondaryColor: (color: string) => void;
	tertiaryColor: string;
	setTertiaryColor: (color: string) => void;
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

export const ColorCreator = ({
	seedColor,
	setSeedColor,
	secondaryColor,
	tertiaryColor,
	setSecondaryColor,
	setTertiaryColor,
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

	const [wheelMode, setWheelMode] = useState<WheelMode>("default");
	// pickerMode now comes from canvasState for session persistence
	const { pickerMode } = canvasState;
	const setPickerMode = (val: "wheel" | "image" | "motion") =>
		setCanvasState((prev) => ({ ...prev, pickerMode: val }));
	const [lastUserImage, setLastUserImage] = useState<string | null>(null);
	const [hoverHex, setHoverHex] = useState<string | null>(null);

	// Dynamic Control Bar State
	// Kaleidoscope: speed + sensitivity | Image: zoom + rotate
	const [speedVal, setSpeedVal] = useState(50);
	const [senseVal, setSenseVal] = useState(50);
	// NOTE: motionDensity and motionSize now come from canvasState (global context) for persistence parity

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

	// 0. Listen for Backend Messages (Color Picking & Live Sampling)
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
					// Note: Don't override pickerMode here - it's now persisted in context
				} else if (key === "soloist-sampled-colors") {
					if (data) setSampledColors(data);
				} else if (key === "soloist-sampler-active") {
					if (data !== undefined) setIsSamplerActive(data);
				}
			} else if (msg.type === "selection-colors" && isSamplerActive) {
				const newColors: string[] = msg.payload.colors || [];
				if (newColors.length === 0) return;

				// Filter out duplicates that are already in the sample set (optional polish)
				// We want unique hexes in the orbit.
				const uniqueIncoming = newColors.filter(
					(hex) =>
						!sampledColors.includes(hex) &&
						// Also protect against duplicates within the incoming batch itself
						newColors.indexOf(hex) === newColors.lastIndexOf(hex)
				);

				setSampledColors((prev: string[]) => {
					// Re-filter against fresh state just in case
					const distinct = uniqueIncoming.filter(
						(c: string) => !prev.includes(c)
					);

					if (distinct.length === 0) return prev; // All duplicates

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

		// Initial request if active
		if (isSamplerActive) {
			parent.postMessage(
				{ pluginMessage: { type: "request-selection-colors" } },
				"*"
			);
		}

		return () => window.removeEventListener("message", handleMessage);
	}, [isSamplerActive, toast, sampledColors]);

	// 5. Manage Color Slot Focus (Logic Refinement)
	// Focus state should always be primary unless active mode is MANUAL
	useEffect(() => {
		if (harmonyMode !== "manual" && activeColorSlot !== "primary") {
			setActiveColorSlot?.("primary");
		}
	}, [harmonyMode, activeColorSlot, setActiveColorSlot]);

	// 1. Calculate Harmonies Instantly (Visual Feedack)
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

	// 2. Sync Global State (Side Effect)
	useEffect(() => {
		if (harmonyMode === "manual") return;

		// Only update if value is different to prevent infinite loops
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

	// 3. Determine Display Colors
	let activeColor = seedColor;
	// Determine Colors for UI Display (Stable slots for the toolbar)
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

	// Parse Colors
	const color = colord(activeColor);
	const hsla = color.toHsl();

	// Handle State Commits (Slot-Aware)
	// Handle State Commits (Slot-Aware)
	const commitHex = (hex: string, options?: { skipRecording?: boolean }) => {
		// Auto-add to Sampler if tool is active
		if (isSamplerActive && !options?.skipRecording) {
			setSampledColors((prev) => {
				if (prev.includes(hex)) return prev;
				if (prev.length >= 10) {
					toast.standard(
						<span>
							<span className="text-accent-cyan">Orbit full</span>{" "}
							(10/10)
						</span>
					);
					return prev;
				}
				return [...prev, hex];
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

	const applyWheelType = (type: WheelMode) => {
		setWheelMode(type);
		setPickerMode("wheel"); // Reset picker when mode changes or reset is clicked

		// Always start from a neutral baseline to prevent stacking effects
		let h = hsla.h;
		let s = 50;
		let l = 50;

		switch (type) {
			case "bright":
				l = 80;
				s = 100;
				break;
			case "dark":
				l = 20;
				s = 60;
				break;
			case "saturated":
				s = 100;
				break;
			case "desaturated":
				s = 25;
				break;
			case "cool":
				h = 210;
				break;
			case "warm":
				h = 30;
				break;
		}
		handleColorChange({ h, s, l }, { skipRecording: true });
	};

	const shuffleColor = () => {
		const randomHex = colord({
			h: Math.floor(Math.random() * 360),
			s: 40 + Math.floor(Math.random() * 50),
			l: 40 + Math.floor(Math.random() * 40),
		}).toHex();
		commitHex(randomHex, { skipRecording: true });
		setPickerMode("wheel");
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
				setPickerMode("image");
			}
		};
		reader.readAsDataURL(file);
	};

	const activateCrayons = () => {
		// Use the hosted/local asset for crayons
		setActiveImage("generated:crayons");
		setPickerMode("image");
	};

	return (
		<div className="h-full flex flex-col items-center gap-6 p-6 overflow-y-auto overflow-x-hidden custom-scrollbar bg-bg-surface/30 backdrop-blur-sm relative">
			{/* Hidden File Input */}
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept="image/*"
				className="hidden"
			/>

			{/* Background Ambience */}
			<div className="absolute inset-0 pointer-events-none">
				<div
					className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] opacity-10"
					style={{ backgroundColor: activeColor }}
				/>
			</div>

			{/* Harmony Selection Toolbar (Top) */}
			<div
				className="flex-shrink-0 flex items-center p-1 gap-1.5 rounded-full bg-bg-raised/95 backdrop-blur-xl border border-glass-stroke shadow-monolith z-30"
				onClick={(e) => e.stopPropagation()}
			>
				{["manual", "complementary", "analogous", "triadic"].map(
					(m) => {
						const isActive = harmonyMode === m;
						return (
							<button
								key={m}
								onClick={() => setHarmonyMode(m as any)}
								className={`group relative flex items-center px-4 py-1.5 rounded-full transition-all duration-300 ${
									isActive
										? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
										: "text-gray-400 hover:text-white hover:bg-white/5"
								}`}
								title={m.toUpperCase()}
							>
								{isActive && (
									<motion.div
										layoutId="harmony-active-pill"
										className="absolute inset-0 bg-bg-surface rounded-full shadow-sm border border-glass-stroke -z-10"
										transition={{
											type: "spring",
											stiffness: 500,
											damping: 30,
										}}
									/>
								)}
								<span className="text-[10px] font-bold tracking-tight uppercase">
									{m === "complementary"
										? "Complementary"
										: m === "analogous"
										? "Analogous"
										: m === "triadic"
										? "Triadic"
										: "Manual"}
								</span>
							</button>
						);
					}
				)}
			</div>

			{/* Main Workbench Area */}
			<div className="flex-1 flex flex-row items-center justify-center gap-10 w-full max-w-4xl relative z-10 px-8 animate-in fade-in duration-300">
				{/* Left Column: Mode Selection */}
				{/* Vertical Toolkit (Modes) - Repositioned beneath sampler */}
				<div
					className="flex flex-col items-center w-[52px]"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex flex-col items-center gap-2 p-1.5 rounded-full bg-bg-raised/95 backdrop-blur-xl border border-glass-stroke shadow-monolith w-[44px]">
						{[
							{
								id: "wheel",
								icon: Disc,
								color: "text-accent-cyan",
								title: "Color Wheel",
								action: () => setPickerMode("wheel"),
							},
							{
								id: "motion",
								icon: Waves,
								color: "text-accent-cyan",
								title: "Fluid",
								action: () => setPickerMode("motion"),
							},
							{
								id: "atmosphere",
								icon: Orbit,
								color: "text-accent-violet",
								title: "Kaleidoscope",
								action: activateCrayons,
							},
							{
								id: "image",
								icon: ImagePlus,
								color: "text-primary",
								title: "Image Drop",
								action: () => {
									if (
										lastUserImage &&
										lastUserImage !== "generated:crayons"
									) {
										setActiveImage(lastUserImage);
										setPickerMode("image");
									} else {
										fileInputRef.current?.click();
									}
								},
							},
						].map((mode) => {
							const isActive =
								mode.id === "wheel"
									? pickerMode === "wheel"
									: mode.id === "motion"
									? pickerMode === "motion"
									: mode.id === "atmosphere"
									? pickerMode === "image" &&
									  activeImage === "generated:crayons"
									: pickerMode === "image" &&
									  activeImage !== "generated:crayons";

							return (
								<div
									key={mode.id}
									className="relative group/modebtn"
								>
									<button
										onClick={mode.action}
										className={`relative p-2 rounded-full transition-all hover:scale-105 active:scale-95 z-10 ${
											isActive
												? "text-white"
												: "text-gray-400 hover:text-white"
										}`}
										title={mode.title}
									>
										{isActive && (
											<motion.div
												layoutId="mode-picker-active"
												className="absolute inset-0 bg-bg-surface rounded-full shadow-sm border border-glass-stroke -z-10"
												transition={{
													type: "spring",
													stiffness: 500,
													damping: 30,
												}}
											/>
										)}
										<mode.icon
											size={16}
											className={mode.color}
										/>
									</button>
									{mode.id === "image" &&
										activeImage &&
										activeImage !== "generated:crayons" && (
											<button
												onClick={(e) => {
													e.stopPropagation();
													setActiveImage(null);
													setLastUserImage(null);
													setPickerMode("wheel");
													parent.postMessage(
														{
															pluginMessage: {
																type: "save-storage",
																payload: {
																	key: "soloist-last-image",
																	data: null,
																},
															},
														},
														"*"
													);
												}}
												className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover/modebtn:opacity-100 transition-all duration-200 scale-75 group-hover/modebtn:scale-100 shadow-sm hover:bg-red-600 z-20"
											>
												<X size={7} strokeWidth={3} />
											</button>
										)}
								</div>
							);
						})}
					</div>
				</div>

				{/* Center: The Core Interaction (Swappable Instrument) */}
				<div className="relative w-[400px] h-[400px] flex-none flex items-center justify-center group scale-95 transition-all duration-300 overflow-visible">
					{pickerMode === "motion" ? (
						<div className="absolute inset-0 w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-300 z-40">
							<MotionColorPicker
								onChange={(hex) => commitHex(hex)}
								onHoverColor={setHoverHex}
								density={motionDensity}
								size={motionSize}
							/>
						</div>
					) : pickerMode === "image" && activeImage ? (
						<div className="absolute inset-0 w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-300 z-40 pointer-events-none">
							<div className="pointer-events-auto w-full h-full flex items-center justify-center">
								<ImageCanvasPicker
									onSelectColor={(hex) => commitHex(hex)}
									imageUrl={activeImage}
									speedVal={speedVal}
									senseVal={senseVal}
									zoomVal={zoomVal}
									rotateVal={rotateVal}
									onHoverColor={setHoverHex}
								/>
							</div>
						</div>
					) : (
						<div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in duration-300 z-40 pointer-events-none">
							<div className="pointer-events-auto">
								<ColorWheel
									size={380}
									hue={hsla.h}
									saturation={hsla.s}
									onChange={(h, s) =>
										handleColorChange({ h, s })
									}
									onHoverColor={setHoverHex}
									secondaryColor={markerSecondary}
									tertiaryColor={markerTertiary}
									harmonyMode={harmonyMode}
									lightness={hsla.l}
									wheelMode={wheelMode}
									showMarkers={true}
								/>
							</div>
						</div>
					)}

					{/* Persistent Docked Control Bar */}
					<div
						className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center h-[42px] px-3 gap-2 rounded-full bg-bg-raised/95 backdrop-blur-xl border border-glass-stroke shadow-monolith z-30"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Left Slider: Saturation (Wheel) / Speed (Atmosphere) / Zoom (Image) */}
						<div
							className="flex items-center gap-1.5 px-2"
							title={
								pickerMode === "wheel"
									? "Saturation"
									: pickerMode === "motion"
									? "Density"
									: activeImage === "generated:crayons"
									? "Speed"
									: "Zoom"
							}
						>
							{pickerMode === "wheel" ? (
								<Droplets size={16} className="text-white/40" />
							) : pickerMode === "motion" ? (
								<Grid size={16} className="text-white/40" />
							) : activeImage === "generated:crayons" ? (
								<Gauge size={16} className="text-white/40" />
							) : (
								<Search size={16} className="text-white/40" />
							)}
							<input
								type="range"
								min="0"
								max="100"
								value={
									pickerMode === "wheel"
										? hsla.s
										: pickerMode === "motion"
										? motionDensity
										: activeImage === "generated:crayons"
										? speedVal
										: zoomVal
								}
								onChange={(e) => {
									const val = Number(e.target.value);
									if (pickerMode === "wheel")
										handleColorChange(
											{ s: val },
											{ skipRecording: true }
										);
									else if (pickerMode === "motion")
										setMotionDensity(val);
									else if (
										activeImage === "generated:crayons"
									)
										setSpeedVal(val);
									else setZoomVal(val);
								}}
								className="w-12 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-cyan [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(63,227,242,0.5)]"
							/>
						</div>

						{/* Hex Display (Reactive Background) */}
						<div
							className="px-3 h-[21px] flex items-center justify-center rounded-full border border-white/20 shadow-lg transition-colors duration-200"
							style={{ backgroundColor: hoverHex || activeColor }}
						>
							<span
								className="font-mono text-[11px] font-bold tracking-wider"
								style={{
									color: colord(
										hoverHex || activeColor
									).isDark()
										? "rgba(255,255,255,0.95)"
										: "rgba(0,0,0,0.9)",
								}}
							>
								{(hoverHex || activeColor).toUpperCase()}
							</span>
						</div>

						{/* Right Slider: Lightness (Wheel) / Sensitivity (Atmosphere) / Rotate (Image) */}
						<div
							className="flex items-center gap-1.5 px-2"
							title={
								pickerMode === "wheel"
									? "Luminance"
									: pickerMode === "motion"
									? "Size"
									: activeImage === "generated:crayons"
									? "Sensitivity"
									: "Rotate"
							}
						>
							<input
								type="range"
								min="0"
								max={
									pickerMode === "wheel"
										? "100"
										: pickerMode === "motion"
										? "100"
										: activeImage === "generated:crayons"
										? "100"
										: "360"
								}
								value={
									pickerMode === "wheel"
										? hsla.l
										: pickerMode === "motion"
										? motionSize
										: activeImage === "generated:crayons"
										? senseVal
										: rotateVal
								}
								onChange={(e) => {
									const val = Number(e.target.value);
									if (pickerMode === "wheel")
										handleColorChange(
											{ l: val },
											{ skipRecording: true }
										);
									else if (pickerMode === "motion")
										setMotionSize(val);
									else if (
										activeImage === "generated:crayons"
									)
										setSenseVal(val);
									else setRotateVal(val);
								}}
								className="w-12 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-cyan [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(63,227,242,0.5)]"
							/>
							{pickerMode === "wheel" ? (
								<Sun size={16} className="text-white/40" />
							) : pickerMode === "motion" ? (
								<MoveDiagonal
									size={16}
									className="text-white/40"
								/>
							) : activeImage === "generated:crayons" ? (
								<MousePointer2
									size={16}
									className="text-white/40"
								/>
							) : (
								<RotateCw size={16} className="text-white/40" />
							)}
						</div>
					</div>
				</div>

				{/* Right Column: Orbital Sampler & Color Slots */}
				<div className="flex flex-col items-center gap-8 w-[52px]">
					{/* Orbital Selection Sampler Container */}
					<SharedSampler onSelectColor={commitHex} />

					{/* Color Slot Selection */}
					<div className="flex flex-col items-center gap-2 p-1.5 rounded-full bg-bg-raised/95 backdrop-blur-xl border border-glass-stroke shadow-monolith w-[44px]">
						{[
							{ id: "primary", num: "1", color: seedColor },
							{
								id: "secondary",
								num: "2",
								color: displaySecondary,
							},
							{
								id: "tertiary",
								num: "3",
								color: displayTertiary,
							},
						].map((slot) => {
							const isActive = activeColorSlot === slot.id;
							const isManual = harmonyMode === "manual";

							return (
								<button
									key={slot.id}
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
											: isManual
											? "hover:bg-white/5"
											: ""
									}`}
									title={
										isManual
											? `Switch to ${
													slot.id
														.charAt(0)
														.toUpperCase() +
													slot.id.slice(1)
											  } Slot`
											: `${
													slot.id
														.charAt(0)
														.toUpperCase() +
													slot.id.slice(1)
											  } Channel`
									}
								>
									<div
										className={`w-6 h-6 rounded-full border border-white/20 shadow-sm transition-transform duration-300 flex items-center justify-center ${
											isActive
												? "scale-110 shadow-neon-glow"
												: isManual
												? "group-hover:scale-110"
												: ""
										}`}
										style={{ backgroundColor: slot.color }}
									>
										<span className="text-[10px] font-black text-white mix-blend-difference opacity-60">
											{slot.num}
										</span>
									</div>
									{isActive && (
										<motion.div
											layoutId="active-slot-glow-vertical"
											className="absolute -inset-0.5 rounded-full border border-accent-cyan/40 pointer-events-none"
											initial={false}
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
			</div>

			{/* Wheel Type Selector (Bottom Toolbar) */}
			<div
				className="flex items-center h-[42px] px-1 gap-1 bg-bg-raised/95 backdrop-blur-xl rounded-full border border-glass-stroke shadow-monolith z-20"
				onClick={(e) => e.stopPropagation()}
			>
				{[
					{
						id: "default",
						icon: RotateCcw,
						label: "Reset Color Wheel",
					},
					{ id: "bright", icon: Sun, label: "Bright" },
					{ id: "dark", icon: Moon, label: "Dark" },
					{ id: "saturated", icon: Zap, label: "Vivid" },
					{ id: "desaturated", icon: Cloud, label: "Muted" },
					{ id: "cool", icon: ThermometerSnowflake, label: "Cool" },
					{ id: "warm", icon: ThermometerSun, label: "Warm" },
					{ id: "shuffle", icon: Dices, label: "Shuffle" },
				].map((mode) => (
					<button
						key={mode.id}
						onClick={() =>
							mode.id === "shuffle"
								? shuffleColor()
								: applyWheelType(mode.id as WheelMode)
						}
						className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
							wheelMode === mode.id
								? "bg-white/10 text-white shadow-sm ring-1 ring-white/20 scale-110"
								: "text-white/40 hover:text-white hover:bg-white/5"
						}`}
						title={mode.label}
					>
						<mode.icon size={16} />
					</button>
				))}
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
	harmonyMode: string;
	showMarkers?: boolean;
	wheelMode?: WheelMode;
	onHoverColor?: (hex: string | null) => void;
}

const ColorWheel = ({
	size,
	hue,
	saturation,
	onChange,
	secondaryColor,
	tertiaryColor,
	harmonyMode,
	lightness = 50,
	showMarkers = false,
	wheelMode = "default",
	onHoverColor,
}: ColorWheelProps & { lightness?: number }) => {
	const wheelRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
	const [isHovering, setIsHovering] = useState(false);
	const radius = size / 2;

	// Mapping Logic: Angle (0-360) <-> Hue (0-360)
	const getHueFromAngle = (angle: number) => {
		if (wheelMode === "cool") {
			// Cool range: 160 (Green-Blue) to 280 (Purple)
			return 160 + (angle / 360) * 120;
		}
		if (wheelMode === "warm") {
			// Warm range: -20 (Deep Red) to 80 (Yellow-Orange)
			let h = -20 + (angle / 360) * 100;
			if (h < 0) h += 360;
			return h;
		}
		return angle;
	};

	const getAngleFromHue = (h: number) => {
		if (wheelMode === "cool") {
			// Inverse of 160 + (d/360)*120
			return ((h - 160) / 120) * 360;
		}
		if (wheelMode === "warm") {
			// Inverse of -20 + (d/360)*100
			let normalizedH = h > 180 ? h - 360 : h;
			return ((normalizedH + 20) / 100) * 360;
		}
		return h;
	};

	// Helper to get XY from H and S
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
		if (isHovering) {
			onHoverColor?.(hoverColor);
		} else {
			onHoverColor?.(null);
		}
	}, [isHovering, hoverColor, onHoverColor]);

	const getHarmonyPos = (cStr?: string) => {
		if (!cStr) return null;
		const c = colord(cStr);
		return getPosition(c.hue(), c.toHsl().s);
	};

	const secPos = getHarmonyPos(secondaryColor);
	const tertPos = getHarmonyPos(tertiaryColor);

	// Composition Logic
	const stops = useMemo(() => {
		const steps = 12;
		const arr = [];
		for (let i = 0; i <= steps; i++) {
			const d = (i / steps) * 360;
			const h = getHueFromAngle(d);
			let s = 100;
			let l = lightness;

			// Mode specific L/S shifts
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

	return (
		<div
			ref={wheelRef}
			className={`rounded-full relative shadow-2xl shadow-black/80 transition-all duration-500 ${
				isHovering || isDragging ? "cursor-none" : "cursor-crosshair"
			}`}
			style={{
				width: size,
				height: size,
				background: `
          radial-gradient(circle at center, ${centerColor} 0%, transparent 80%),
          conic-gradient(from 0deg, ${stops})
        `,
			}}
			onMouseDown={(e) => {
				setIsDragging(true);
				handleMove(e.clientX, e.clientY);
			}}
			onMouseMove={(e) => {
				if (!wheelRef.current) return;
				const rect = wheelRef.current.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				setHoverPos({ x, y });
				setIsHovering(true);
			}}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
		>
			<div className="absolute inset-0 rounded-full bg-black/5 pointer-events-none" />

			{/* Harmony Markers */}
			{(harmonyMode !== "manual" || showMarkers) && secPos && (
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
			{(harmonyMode !== "manual" || showMarkers) && tertPos && (
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

			{/* Selection Handle */}
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

			{/* Custom Magnifier Cursor */}
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
