import { motion } from "framer-motion";

/**
 * Switch primitive — 18 variants (checked × state × size)
 *
 * CONTRACT: design/contracts/primitives/Switch.contract.json
 * SCHEMA: soloist-os.primitives.switch.contract.v1
 *
 * SIZES (Track): 30×18 (sm), 38×22 (md), 46×26 (lg)
 * STATES:
 *   - default: checked=color/primary (Cyan), unchecked=color/glass/subtle + color/glass/stroke
 *   - focused: adds color/accent/cyan ring
 *   - disabled: opacity 50%, pointer-events-none
 * RADIUS: radius/pill (999)
 */

type SwitchState = "default" | "focused" | "disabled" | "error";
type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps {
	checked?: boolean;
	onChange?: (checked: boolean) => void;
	state?: SwitchState;
	size?: SwitchSize;
	disabled?: boolean;
	className?: string;
	ariaLabel?: string;
}

const TRACK_DIMENSIONS: Record<
	SwitchSize,
	{
		width: string;
		height: string;
		thumbSize: string;
		xMax: number;
		padding: number;
	}
> = {
	sm: {
		width: "w-[30px]",
		height: "h-[18px]",
		thumbSize: "size-[14px]",
		xMax: 12,
		padding: 2,
	},
	md: {
		width: "w-[38px]",
		height: "h-[22px]",
		thumbSize: "size-[18px]",
		xMax: 16,
		padding: 2,
	},
	lg: {
		width: "w-[46px]",
		height: "h-[26px]",
		thumbSize: "size-[22px]",
		xMax: 20,
		padding: 2,
	},
};

export function Switch({
	checked = false,
	onChange,
	state = "default",
	size = "md",
	disabled = false,
	className = "",
	ariaLabel,
}: Readonly<SwitchProps>) {
	const dims = TRACK_DIMENSIONS[size];
	const isEnabled = !disabled && state !== "disabled";

	const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
		if (isEnabled && onChange) {
			e.preventDefault();
			onChange(!checked);
		}
	};

	// Track styling
	const trackBase = `relative inline-flex flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-all duration-300 ease-in-out outline-none ${dims.width} ${dims.height}`;

	let trackColorClass = "";
	if (checked) {
		trackColorClass =
			"bg-accent-cyan border-accent-cyan/20 shadow-neon-glow";
	} else {
		trackColorClass = "bg-white/5 border-white/10 hover:border-white/20";
	}

	// Focus Ring (simulated by ring classes on the track for now)
	const focusClass =
		state === "focused"
			? "ring-2 ring-accent-cyan/50 ring-offset-2 ring-offset-black"
			: "";

	const disabledClass = !isEnabled
		? "opacity-50 cursor-default pointer-events-none"
		: "";

	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={ariaLabel}
			disabled={!isEnabled}
			onClick={handleClick}
			className={`${trackBase} ${trackColorClass} ${focusClass} ${disabledClass} ${className}`}
		>
			<motion.span
				aria-hidden="true"
				initial={false}
				animate={{
					x: checked ? dims.xMax + dims.padding : dims.padding,
					backgroundColor: checked
						? "#FFFFFF"
						: "rgba(255, 255, 255, 0.8)",
				}}
				transition={{ type: "spring", stiffness: 500, damping: 30 }}
				className={`absolute top-1/2 -translate-y-1/2 pointer-events-none inline-block rounded-full shadow-monolith ${dims.thumbSize}`}
			/>
		</button>
	);
}
