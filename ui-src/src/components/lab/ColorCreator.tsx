import { useState, useEffect, useRef, useMemo } from "react";
import { colord } from "colord";

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
}

export const ColorCreator = ({
	seedColor,
	setSeedColor,
	secondaryColor,
	tertiaryColor,
	setSecondaryColor,
	setTertiaryColor,
	harmonyMode = "complementary",
	setHarmonyMode = () => {},
}: ColorCreatorProps) => {
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

	// 3. Determine Display Colors (Use calculated if harmony is active, otherwise props)
	// Actually, for the Wheel, if we are in a harmony mode, we MUST show the harmony positions.
	// If we are in manual, we show the prop positions.
	const activeSecondary =
		harmonyMode !== "manual"
			? harmonies.sec || secondaryColor
			: secondaryColor;
	const activeTertiary =
		harmonyMode !== "manual"
			? harmonies.tert || tertiaryColor
			: tertiaryColor;

	// Parse Colors
	const color = colord(seedColor);
	const hsla = color.toHsl();

	return (
		<div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-bg-surface/30 backdrop-blur-sm">
			{/* Background Ambience */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
			</div>

			{/* Top Controls: Harmony Mode */}
			<div className="absolute top-8 z-20">
				<div className="flex p-1 gap-1 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl opacity-50 hover:opacity-100 transition-opacity duration-300">
					{["manual", "complementary", "analogous", "triadic"].map(
						(m) => (
							<button
								key={m}
								onClick={() => setHarmonyMode(m as any)}
								className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all uppercase ${
									harmonyMode === m
										? "bg-white text-black shadow-sm"
										: "text-gray-400 hover:text-white hover:bg-white/5"
								}`}
							>
								{m}
							</button>
						)
					)}
				</div>
			</div>

			{/* Main Canvas Area */}
			<div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl relative z-10 origin-center">
				{/* The Wheel */}
				<div className="relative group mb-12">
					<ColorWheel
						size={420}
						hue={hsla.h}
						saturation={hsla.s}
						onChange={(h, s) => {
							setSeedColor(colord({ h, s, l: hsla.l }).toHex());
						}}
						secondaryColor={activeSecondary}
						tertiaryColor={activeTertiary}
						harmonyMode={harmonyMode}
						lightness={hsla.l}
					/>
				</div>

				{/* Brightness Control - Floating below */}
				{/* Brightness Control - Floating Pill */}
				<div className="absolute bottom-20 flex items-center gap-3 p-1 pr-4 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl w-80 opacity-50 hover:opacity-100 transition-opacity duration-300">
					<div className="px-3 py-1.5 rounded-full bg-white/5 text-[10px] uppercase font-bold tracking-wider text-gray-400 pointer-events-none select-none">
						Lightness
					</div>

					<div className="relative flex-1 h-3 rounded-full overflow-hidden shadow-inner border border-white/10 group cursor-pointer">
						<div
							className="absolute inset-0 z-0 opacity-80"
							style={{
								background: `linear-gradient(to right, #000 0%, ${colord(
									{ h: hsla.h, s: hsla.s, l: 50 }
								).toHex()} 50%, #fff 100%)`,
							}}
						/>
						<input
							type="range"
							min="0"
							max="100"
							value={hsla.l}
							onChange={(e) =>
								setSeedColor(
									colord({
										...hsla,
										l: parseInt(e.target.value),
									}).toHex()
								)
							}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
						/>
						{/* Thumb Indicator */}
						<div
							className="absolute top-0 bottom-0 w-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none transition-transform duration-75"
							style={{
								left: `${hsla.l}%`,
								transform: "translateX(-50%)",
							}}
						/>
					</div>

					<div className="w-8 text-right text-[10px] uppercase font-bold tracking-wider text-white select-none">
						{Math.round(hsla.l)}%
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
	harmonyMode: string;
}

const ColorWheel = ({
	size,
	hue,
	saturation,
	onChange,
	secondaryColor,
	tertiaryColor,
	harmonyMode,
	lightness = 50, // Default to 50 if not provided
}: ColorWheelProps & { lightness?: number }) => {
	const wheelRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const radius = size / 2;

	// Helper to get XY from HS
	const getPosition = (h: number, s: number) => {
		const angleRad = (h - 90) * (Math.PI / 180); // -90 because 0deg is top in CSS conic, but right in math
		// Map saturation 0-100 to distance 0-radius
		const dist = (s / 100) * radius;
		const x = radius + Math.cos(angleRad) * dist;
		const y = radius + Math.sin(angleRad) * dist;
		return { x, y };
	};

	// Calculate main handle position
	const mainPos = getPosition(hue, saturation);

	// Interaction handler
	const handleMove = (clientX: number, clientY: number) => {
		if (!wheelRef.current) return;
		const rect = wheelRef.current.getBoundingClientRect();
		const cx = rect.left + radius;
		const cy = rect.top + radius;

		const dx = clientX - cx;
		const dy = clientY - cy;

		// Calculate Angle (Hue)
		let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
		if (angle < 0) angle += 360;

		// Calculate Distance (Saturation)
		const dist = Math.sqrt(dx * dx + dy * dy);
		const s = Math.min(100, (dist / radius) * 100);

		onChange(angle, s);
	};

	const onMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		handleMove(e.clientX, e.clientY);
	};

	useEffect(() => {
		const onMouseMove = (e: MouseEvent) => {
			if (isDragging) handleMove(e.clientX, e.clientY);
		};
		const onMouseUp = () => setIsDragging(false);

		if (isDragging) {
			window.addEventListener("mousemove", onMouseMove);
			window.addEventListener("mouseup", onMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};
	}, [isDragging]);

	// Calculate Harmony Positions
	const getHarmonyPos = (cStr?: string) => {
		if (!cStr) return null;
		const c = colord(cStr);
		const h = c.hue();
		const s = c.toHsl().s;
		return getPosition(h, s);
	};

	const secPos = getHarmonyPos(secondaryColor);
	const tertPos = getHarmonyPos(tertiaryColor);

	// Dynamic Gradient Stops
	const stops = [
		{ d: 0, h: 0 },
		{ d: 60, h: 60 },
		{ d: 120, h: 120 },
		{ d: 180, h: 180 },
		{ d: 240, h: 240 },
		{ d: 300, h: 300 },
		{ d: 360, h: 360 }, // Loop back to 0 (Red)
		// Note: Hue 0 and 360 are Red.
		// We need specific hues: Red, Yellow, Lime, Cyan, Blue, Magenta, Red
	];

	// Construct conic gradient string
	// We use colord to generate the hex for each hue at 100% Saturation and CURRENT Lightness
	// Center is White/Grey/Black based on lightness (Sat 0)
	// Actually, center is Saturation 0.

	const centerColor = colord({ h: 0, s: 0, l: lightness }).toHex();

	const conicStops = stops
		.map((s) => {
			const hex = colord({ h: s.h, s: 100, l: lightness }).toHex();
			return `${hex} ${s.d}deg`;
		})
		.join(", ");

	return (
		<div
			ref={wheelRef}
			className="rounded-full relative shadow-2xl shadow-black/50"
			style={{
				width: size,
				height: size,
				background: `
                    radial-gradient(circle, ${centerColor} 0%, transparent 70%),
                    conic-gradient(from 0deg, ${conicStops})
                `,
			}}
			onMouseDown={onMouseDown}
		>
			{/* Overlay for Saturation/Lightness nuance */}
			<div
				className="absolute inset-0 rounded-full"
				style={{
					background:
						"radial-gradient(circle, rgba(128,128,128,0) 0%, rgba(128,128,128,0.1) 100%)",
					pointerEvents: "none",
				}}
			/>

			{/* Harmony Handles (Non-interactive for now, just visual indicators) */}
			{harmonyMode !== "manual" && secPos && (
				<div
					className="absolute w-4 h-4 rounded-full border border-white/30 shadow-sm pointer-events-none"
					style={{
						left: secPos.x,
						top: secPos.y,
						backgroundColor: secondaryColor,
						transform: "translate(-50%, -50%)",
						opacity: 0.6,
					}}
				/>
			)}
			{harmonyMode !== "manual" && tertPos && (
				<div
					className="absolute w-4 h-4 rounded-full border border-white/30 shadow-sm pointer-events-none"
					style={{
						left: tertPos.x,
						top: tertPos.y,
						backgroundColor: tertiaryColor,
						transform: "translate(-50%, -50%)",
						opacity: 0.6,
					}}
				/>
			)}

			{/* Main Handle */}
			<div
				className="absolute w-6 h-6 rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
				style={{
					left: mainPos.x,
					top: mainPos.y,
					backgroundColor: colord({
						h: hue,
						s: saturation,
						l: 50,
					}).toHex(), // Show pure hue/sat on wheel
					transform: "translate(-50%, -50%)",
					zIndex: 10,
				}}
			/>
		</div>
	);
};
