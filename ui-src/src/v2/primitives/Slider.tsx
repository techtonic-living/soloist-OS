import React, { useRef, useState } from "react";

/**
 * Slider primitive — 9 variants (3 states × 3 sizes)
 *
 * CONTRACT: design/contracts/primitives/Slider.contract.json
 * SCHEMA: soloist-os.primitives.slider.contract.v1
 *
 * SIZES (Track Height / Thumb):
 *   - sm: 4px track / 12px thumb
 *   - md: 6px track / 16px thumb
 *   - lg: 8px track / 20px thumb
 *
 * STATES:
 *   - default: track=color/glass/subtle, progress=color/primary, thumb=color/primary
 *   - focused: adds color/accent/cyan focus ring
 *   - disabled: opacity 50%, pointer-events-none
 *
 * RADIUS: radius/pill (full)
 */

type SliderState = "default" | "focused" | "disabled";
type SliderSize = "sm" | "md" | "lg";

export interface SliderProps {
	value?: number;
	min?: number;
	max?: number;
	step?: number;
	onChange?: (value: number) => void;
	state?: SliderState;
	size?: SliderSize;
	disabled?: boolean;
	className?: string;
	ariaLabel?: string;
}

const DIMENSIONS: Record<
	SliderSize,
	{ trackHeight: string; thumbSize: string; thumbSizePx: number }
> = {
	sm: { trackHeight: "h-1", thumbSize: "size-3", thumbSizePx: 12 },
	md: { trackHeight: "h-[6px]", thumbSize: "size-4", thumbSizePx: 16 },
	lg: { trackHeight: "h-2", thumbSize: "size-5", thumbSizePx: 20 },
};

export function Slider({
	value = 0,
	min = 0,
	max = 100,
	step = 1,
	onChange,
	state = "default",
	size = "md",
	disabled = false,
	className = "",
	ariaLabel,
}: Readonly<SliderProps>) {
	const [active, setActive] = useState(false);
	const trackRef = useRef<HTMLDivElement>(null);
	const isEnabled = !disabled && state !== "disabled";
	const dims = DIMENSIONS[size];

	// Sync local value for drag calculations if needed, but for now we'll use controlled pattern
	const percentage = Math.min(
		Math.max(((value - min) / (max - min)) * 100, 0),
		100
	);

	const handleUpdate = (clientX: number) => {
		if (!isEnabled || !trackRef.current) return;
		const rect = trackRef.current.getBoundingClientRect();
		const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
		const rawValue = (x / rect.width) * (max - min) + min;
		const steppedValue = Math.round(rawValue / step) * step;
		onChange?.(Math.min(Math.max(steppedValue, min), max));
	};

	const onMouseDown = (e: React.MouseEvent) => {
		if (!isEnabled) return;
		setActive(true);
		handleUpdate(e.clientX);

		const onMouseMove = (moveEvent: MouseEvent) => {
			handleUpdate(moveEvent.clientX);
		};

		const onMouseUp = () => {
			setActive(false);
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
	};

	// Track styling
	const trackBase = `relative w-full rounded-full bg-glass-subtle border border-glass-stroke transition-all duration-300 ${dims.trackHeight}`;
	const trackClass = `${trackBase} ${
		isEnabled
			? "cursor-pointer group"
			: "cursor-default opacity-50 pointer-events-none"
	}`;

	// Focus ring logic
	const isFocused = state === "focused";
	const focusClass = isFocused
		? "ring-2 ring-accent-cyan/50 ring-offset-2 ring-offset-black"
		: "";

	return (
		<div className={`flex items-center py-2 ${className}`}>
			<div
				ref={trackRef}
				className={trackClass}
				onMouseDown={onMouseDown}
				aria-label={ariaLabel}
			>
				{/* Progress bar */}
				<div
					className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-75"
					style={{ width: `${percentage}%` }}
				/>

				{/* Thumb */}
				<div
					className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-primary border-2 border-primary shadow-monolith transition-all duration-75 ${
						dims.thumbSize
					} ${focusClass} ${
						active ? "scale-110" : "group-hover:scale-105"
					}`}
					style={{ left: `${percentage}%` }}
				>
					{/* Cinematic glow dot */}
					<div className="absolute inset-0 m-auto size-1 rounded-full bg-white opacity-40" />
				</div>
			</div>
		</div>
	);
}
