import React, { useRef } from "react";
import {
	motion,
	useMotionValue,
	useSpring,
	useTransform,
	MotionValue,
	AnimatePresence,
} from "framer-motion";
import { colord } from "colord";

// Generate rings for the "flower bloom" layout
const generateFlowerColors = (baseUnit: number) => {
	const rings = [];

	// 1. Center: Pure White/Bright (The core)
	rings.push({
		color: "#FFFFFF",
		ring: 0,
		index: 0,
		totalInRing: 1,
		r: 0,
		zIndex: 50,
	});

	// 2. Inner Ring: Pastels (Light, desaturated)
	const innerCount = baseUnit * 1;
	for (let i = 0; i < innerCount; i++) {
		const hue = (i / innerCount) * 360;
		rings.push({
			color: colord({ h: hue, s: 50, l: 85 }).toHex(),
			ring: 1,
			index: i,
			totalInRing: innerCount,
			r: 49, // Radius
			zIndex: 40,
		});
	}

	// 3. Middle Ring: Vibrant but balanced
	const midCount = baseUnit * 2;
	for (let i = 0; i < midCount; i++) {
		const hue = (i / midCount) * 360; // Offset significantly
		rings.push({
			color: colord({ h: hue, s: 75, l: 60 }).toHex(),
			ring: 2,
			index: i,
			totalInRing: midCount,
			r: 92,
			zIndex: 30,
		});
	}

	// 4. Outer Ring: Deep/Saturated
	const outerCount = baseUnit * 3;
	for (let i = 0; i < outerCount; i++) {
		const hue = (i / outerCount) * 360;
		rings.push({
			color: colord({ h: hue, s: 95, l: 50 }).toHex(),
			ring: 3,
			index: i,
			totalInRing: outerCount,
			r: 136,
			zIndex: 20,
		});
	}

	return rings;
};

export const MotionColorPicker = ({
	onChange,
	onHoverColor,
	density = 50,
	size = 50,
}: {
	onChange: (color: string) => void;
	onHoverColor?: (color: string | null) => void;
	density?: number;
	size?: number;
}) => {
	// Dynamic Item Size: 20px (0) to 60px (100). Default 40.
	const ITEM_SIZE = 20 + (size / 100) * 40;

	// Calculate base unit (3-9) from density (0-100)
	// Memoize this calculation to prevent thrashing
	const safeDensity = Number.isNaN(Number(density)) ? 50 : Number(density);
	const baseUnit = 3 + Math.floor((safeDensity / 100) * 6);

	// Only re-generate swatches when baseUnit actually changes
	const swatches = React.useMemo(
		() => generateFlowerColors(baseUnit),
		[baseUnit]
	);

	const ref = useRef<HTMLDivElement>(null);
	const mouseX = useMotionValue(Infinity);
	const mouseY = useMotionValue(Infinity);

	const smoothMouseX = useSpring(mouseX, { stiffness: 150, damping: 20 });
	const smoothMouseY = useSpring(mouseY, { stiffness: 150, damping: 20 });

	// Local hover state for custom cursor
	const [localHoverColor, setLocalHoverColor] = React.useState<string | null>(
		null
	);
	const [isHovering, setIsHovering] = React.useState(false);

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!ref.current) return;
		setIsHovering(true);
		const rect = ref.current.getBoundingClientRect();
		mouseX.set(e.clientX - (rect.left + rect.width / 2));
		mouseY.set(e.clientY - (rect.top + rect.height / 2));
	};

	const handleMouseLeave = () => {
		mouseX.set(Infinity);
		mouseY.set(Infinity);
		setIsHovering(false);
		setLocalHoverColor(null);
		onHoverColor?.(null);
	};

	return (
		<div
			ref={ref}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			className={`relative flex w-full h-full items-center justify-center aspect-square ${
				isHovering ? "cursor-none" : ""
			}`}
		>
			{/* Custom Cursor */}
			{isHovering && (
				<motion.div
					className="absolute pointer-events-none rounded-full z-[100] bg-transparent flex items-center justify-center"
					style={{
						x: mouseX,
						y: mouseY,
						left: "50%",
						top: "50%",
						width: 40,
						height: 40,
						marginLeft: -20,
						marginTop: -20,
						border: "2px solid rgba(255,255,255,0.8)",
						boxShadow:
							"0 0 10px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.2)",
					}}
					transition={{ duration: 0 }} // Instant follow
				>
					{localHoverColor && (
						<div
							className="w-2 h-2 rounded-full shadow-sm"
							style={{
								backgroundColor: localHoverColor,
								border: "1px solid rgba(255,255,255,0.8)",
							}}
						/>
					)}
				</motion.div>
			)}

			{/* Outer Gradient Ring */}
			<div
				className="absolute inset-0 rounded-full border-[1.5px] border-transparent opacity-80 pointer-events-none"
				style={{
					background:
						"linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet) border-box",
					WebkitMask:
						"linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
					WebkitMaskComposite: "destination-out",
					maskComposite: "exclude",
				}}
			/>

			<AnimatePresence>
				{swatches.map((swatch) => {
					// Calculate position based on ring properties
					const angle =
						(swatch.index / swatch.totalInRing) * Math.PI * 2;
					const x = swatch.r === 0 ? 0 : Math.cos(angle) * swatch.r;
					const y = swatch.r === 0 ? 0 : Math.sin(angle) * swatch.r;

					return (
						<Swatch
							key={`${swatch.ring}-${swatch.index}`} // Stable identity per ring
							color={swatch.color}
							x={x}
							y={y}
							mouseX={smoothMouseX}
							mouseY={smoothMouseY}
							onClick={() => onChange(swatch.color)}
							onHover={() => {
								setLocalHoverColor(swatch.color);
								onHoverColor?.(swatch.color);
							}}
							onHoverEnd={() => {
								setLocalHoverColor(null);
								onHoverColor?.(null);
							}}
							size={ITEM_SIZE}
							baseZIndex={swatch.zIndex}
						/>
					);
				})}
			</AnimatePresence>
		</div>
	);
};

const Swatch = ({
	color,
	x,
	y,
	mouseX,
	mouseY,
	onClick,
	onHover,
	onHoverEnd,
	size,
	baseZIndex,
}: {
	color: string;
	x: number;
	y: number;
	mouseX: MotionValue;
	mouseY: MotionValue;
	onClick: () => void;
	onHover: () => void;
	onHoverEnd: () => void;
	size: number;
	baseZIndex: number;
}) => {
	// Fix: Use MotionValues for x/y to prevent stale closures in useTransform
	// when the component is reused but moved (due to key={index})
	const xMv = useMotionValue(x);
	const yMv = useMotionValue(y);

	React.useEffect(() => {
		xMv.set(x);
		yMv.set(y);
	}, [x, y, xMv, yMv]);

	const distance = useTransform(
		[mouseX, mouseY, xMv, yMv],
		([mx, my, cx, cy]) => {
			if (mx === Infinity || my === Infinity) return Infinity;
			return Math.hypot(
				(mx as number) - (cx as number),
				(my as number) - (cy as number)
			);
		}
	);

	// Tighter proximity effect for denser grid
	// Scale up more when VERY close, drop off quickly
	const scale = useTransform(distance, [0, 80], [1.8, 1]);

	return (
		<motion.div
			style={{
				backgroundColor: color,
				position: "absolute",
				left: "50%",
				top: "50%",
				x,
				y,
				scale, // Motion value for physics
				zIndex: baseZIndex || 1, // Fallback if undefined
				width: size,
				height: size,
				borderRadius: "50%",
				marginLeft: -size / 2,
				marginTop: -size / 2,
				cursor: "crosshair",
				boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
			}}
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }} // Clean exit
			whileHover={{
				scale: 1.5, // Explicit scale override on hover
				zIndex: 50, // Pop to top
				transition: { duration: 0.1 },
			}}
			onHoverStart={onHover}
			onHoverEnd={onHoverEnd}
			whileTap={{ scale: 0.9 }}
			onClick={onClick}
		/>
	);
};
