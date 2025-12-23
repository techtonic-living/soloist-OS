import React, { useRef, useEffect, useState, useCallback } from "react";
import { colord } from "colord";

interface Swatch {
	color: string;
	x: number;
	y: number;
	baseRadius: number;
	currentRadius: number;
	ring: number;
}

// Generate swatches for the flower layout
// At low density: rings are closer together for a compact, uniform look
// At high density: rings spread out to accommodate more swatches
const generateSwatches = (
	baseUnit: number,
	itemSize: number,
	centerX: number,
	centerY: number
): Swatch[] => {
	const swatches: Swatch[] = [];
	const baseRadius = itemSize / 2;

	// Adaptive ring spacing based on density
	// Lower baseUnit (3-4) = tighter rings, Higher baseUnit (7-9) = wider rings
	const densityFactor = (baseUnit - 3) / 6; // 0 to 1 as density increases

	// Ring distances that adapt to density
	// At low density (baseUnit=3): 35, 70, 110 - more compact
	// At high density (baseUnit=9): 49, 92, 136 - spread out
	const r1Dist = 35 + densityFactor * 14; // 35 to 49
	const r2Dist = 70 + densityFactor * 22; // 70 to 92
	const r3Dist = 110 + densityFactor * 26; // 110 to 136

	// Center: White
	swatches.push({
		color: "#FFFFFF",
		x: centerX,
		y: centerY,
		baseRadius,
		currentRadius: baseRadius,
		ring: 0,
	});

	// Ring counts use consecutive odd numbers at minimum, scaling with density
	// At baseUnit=3: 3, 5, 7 → 1+3+5+7 = 16 swatches
	// At baseUnit=9: 9, 15, 21 → 1+9+15+21 = 46 swatches
	const r1Count = baseUnit;
	const r2Count = baseUnit + Math.floor(baseUnit * 0.67); // ~1.67x
	const r3Count = baseUnit * 2 + 1; // ~2x + 1 for odd number

	// Ring 1: Pastels - offset by half a swatch angle for visual balance
	const r1Offset = Math.PI / r1Count; // Half-step rotation
	for (let i = 0; i < r1Count; i++) {
		const angle = (i / r1Count) * Math.PI * 2 + r1Offset;
		const hue = (i / r1Count) * 360;
		swatches.push({
			color: colord({ h: hue, s: 50, l: 85 }).toHex(),
			x: centerX + Math.cos(angle) * r1Dist,
			y: centerY + Math.sin(angle) * r1Dist,
			baseRadius,
			currentRadius: baseRadius,
			ring: 1,
		});
	}

	// Ring 2: Vibrant - no offset, creates alternating pattern
	for (let i = 0; i < r2Count; i++) {
		const angle = (i / r2Count) * Math.PI * 2;
		const hue = (i / r2Count) * 360;
		swatches.push({
			color: colord({ h: hue, s: 75, l: 60 }).toHex(),
			x: centerX + Math.cos(angle) * r2Dist,
			y: centerY + Math.sin(angle) * r2Dist,
			baseRadius,
			currentRadius: baseRadius,
			ring: 2,
		});
	}

	// Ring 3: Deep/Saturated - slight offset for visual interest
	const r3Offset = Math.PI / r3Count / 2; // Quarter-step rotation
	for (let i = 0; i < r3Count; i++) {
		const angle = (i / r3Count) * Math.PI * 2 + r3Offset;
		const hue = (i / r3Count) * 360;
		swatches.push({
			color: colord({ h: hue, s: 95, l: 50 }).toHex(),
			x: centerX + Math.cos(angle) * r3Dist,
			y: centerY + Math.sin(angle) * r3Dist,
			baseRadius,
			currentRadius: baseRadius,
			ring: 3,
		});
	}

	return swatches;
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
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const animationRef = useRef<number>(0);
	const mouseRef = useRef({ x: -1000, y: -1000, isInside: false });
	const swatchesRef = useRef<Swatch[]>([]);
	const hoveredSwatchRef = useRef<Swatch | null>(null);

	const [canvasSize] = useState(400); // Extra room for max density + max size edge case
	const center = canvasSize / 2;

	// Calculate item size from slider (20-60px)
	const itemSize = 20 + (size / 100) * 40;

	// Calculate base unit from density (3-9)
	const safeDensity = Number.isNaN(Number(density)) ? 50 : Number(density);
	const baseUnit = 3 + Math.floor((safeDensity / 100) * 6);

	// Regenerate swatches when density or size changes
	useEffect(() => {
		swatchesRef.current = generateSwatches(
			baseUnit,
			itemSize,
			center,
			center
		);
	}, [baseUnit, itemSize, center]);

	// Find swatch under cursor
	const findSwatchAtPoint = useCallback(
		(x: number, y: number): Swatch | null => {
			// Check in reverse order (outer rings on top visually, but we want inner rings to have priority for clicks where overlapping)
			// Actually, let's prioritize by proximity to center of swatch
			let closest: Swatch | null = null;
			let closestDist = Infinity;

			for (const swatch of swatchesRef.current) {
				const dist = Math.hypot(x - swatch.x, y - swatch.y);
				if (dist <= swatch.currentRadius && dist < closestDist) {
					closest = swatch;
					closestDist = dist;
				}
			}
			return closest;
		},
		[]
	);

	// Animation loop
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const render = () => {
			ctx.clearRect(0, 0, canvasSize, canvasSize);

			const mx = mouseRef.current.x;
			const my = mouseRef.current.y;
			const isInside = mouseRef.current.isInside;

			// Draw swatches in reverse order (outer rings first, center last)
			// This makes center circles appear on top of outer circles
			const swatchesToDraw = [...swatchesRef.current].reverse();
			for (const swatch of swatchesToDraw) {
				// Calculate proximity-based scale
				let targetRadius = swatch.baseRadius;

				if (isInside) {
					const dist = Math.hypot(mx - swatch.x, my - swatch.y);
					// Scale up when close (max 1.8x at dist=0, down to 1x at dist>=80)
					const proximityScale = Math.max(1, 1.8 - (dist / 80) * 0.8);
					targetRadius = swatch.baseRadius * proximityScale;
				}

				// Smooth interpolation for radius changes
				swatch.currentRadius +=
					(targetRadius - swatch.currentRadius) * 0.15;

				// Draw shadow
				ctx.beginPath();
				ctx.arc(
					swatch.x + 2,
					swatch.y + 2,
					swatch.currentRadius,
					0,
					Math.PI * 2
				);
				ctx.fillStyle = "rgba(0,0,0,0.15)";
				ctx.fill();

				// Draw swatch
				ctx.beginPath();
				ctx.arc(
					swatch.x,
					swatch.y,
					swatch.currentRadius,
					0,
					Math.PI * 2
				);
				ctx.fillStyle = swatch.color;
				ctx.fill();

				// Subtle border
				ctx.strokeStyle = "rgba(255,255,255,0.3)";
				ctx.lineWidth = 1;
				ctx.stroke();
			}

			// Draw custom cursor if hovering (matches ColorWheel's magnifier cursor)
			if (isInside && hoveredSwatchRef.current) {
				// Outer circle
				ctx.beginPath();
				ctx.arc(mx, my, 20, 0, Math.PI * 2);
				ctx.strokeStyle = "rgba(255,255,255,0.8)";
				ctx.lineWidth = 2;
				ctx.stroke();

				// Add shadow effect
				ctx.shadowColor = "rgba(0,0,0,0.5)";
				ctx.shadowBlur = 10;
				ctx.stroke();
				ctx.shadowBlur = 0;

				// Inner dot with hovered color
				ctx.beginPath();
				ctx.arc(mx, my, 4, 0, Math.PI * 2);
				ctx.fillStyle = hoveredSwatchRef.current.color;
				ctx.fill();
				ctx.strokeStyle = "rgba(255,255,255,0.8)";
				ctx.lineWidth = 1;
				ctx.stroke();
			}

			animationRef.current = requestAnimationFrame(render);
		};

		render();

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [canvasSize]);

	// Mouse handlers
	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const rect = canvas.getBoundingClientRect();
			const x = (e.clientX - rect.left) * (canvas.width / rect.width);
			const y = (e.clientY - rect.top) * (canvas.height / rect.height);

			mouseRef.current = { x, y, isInside: true };

			const hovered = findSwatchAtPoint(x, y);
			if (hovered !== hoveredSwatchRef.current) {
				hoveredSwatchRef.current = hovered;
				onHoverColor?.(hovered?.color ?? null);
			}
		},
		[findSwatchAtPoint, onHoverColor]
	);

	const handleMouseLeave = useCallback(() => {
		mouseRef.current = { x: -1000, y: -1000, isInside: false };
		hoveredSwatchRef.current = null;
		onHoverColor?.(null);
	}, [onHoverColor]);

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const rect = canvas.getBoundingClientRect();
			const x = (e.clientX - rect.left) * (canvas.width / rect.width);
			const y = (e.clientY - rect.top) * (canvas.height / rect.height);

			const clicked = findSwatchAtPoint(x, y);
			if (clicked) {
				onChange(clicked.color);
			}
		},
		[findSwatchAtPoint, onChange]
	);

	return (
		<div
			ref={containerRef}
			className="relative flex items-center justify-center"
			style={{ width: canvasSize, height: canvasSize }}
		>
			{/* Outer gradient ring decoration */}
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

			<canvas
				ref={canvasRef}
				width={canvasSize}
				height={canvasSize}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				onClick={handleClick}
				className="cursor-none"
				style={{ width: canvasSize, height: canvasSize }}
			/>
		</div>
	);
};
