import { Icon, type IconName, type IconSize } from "./Icon";

/**
 * TextField primitive — 12 variants (4 states × 3 sizes)
 *
 * CONTRACT: design/contracts/primitives/TextField.contract.json
 * SCHEMA: soloist-os.primitives.textfield.contract.v1
 *
 * SIZES: 310×32 (sm), 310×44 (md), 310×56 (lg)
 * STATES:
 *   - default: stroke=color/glass/stroke, fill=color/glass/subtle, text=color/text/primary, placeholder=color/text/secondary
 *   - focused: stroke=color/primary, fill=color/glass/subtle, text=color/text/primary, placeholder=color/text/muted
 *   - disabled: stroke=color/glass/stroke, fill=color/glass/subtle, text=color/text/primary, placeholder=color/text/muted (opacity 50%)
 *   - error: stroke=color/accent/error, fill=color/glass/subtle, text=color/text/primary, placeholder=color/text/muted
 * TEXT STYLES: ui/05 (sm), ui/06 (md), ui/08 (lg)
 * SPACING: space/2 (padding), space/3 (icon gap)
 * RADIUS: radius/lg
 * STROKE: stroke/thin (1px)
 */

type TextFieldState = "default" | "focused" | "disabled" | "error";
type TextFieldSize = "sm" | "md" | "lg";

type TextFieldProps = {
	value?: string;
	placeholder?: string;
	iconLeft?: IconName;
	iconRight?: IconName;
	size?: TextFieldSize;
	state?: TextFieldState;
	disabled?: boolean;
	onChange?: (value: string) => void;
	onFocus?: () => void;
	onBlur?: () => void;
	className?: string;
	ariaLabel?: string;
	name?: string;
	id?: string;
	type?: "text" | "email" | "password" | "search" | "tel" | "url";
};

// Contract-defined sizes (heights): 32 (sm), 44 (md), 56 (lg)
const SIZE_CLASSES: Record<TextFieldSize, string> = {
	sm: "h-8 px-2 gap-3 text-[14px] leading-[16px]", // 32px height, space/2, ui/05
	md: "h-11 px-2 gap-3 text-[16px] leading-[20px]", // 44px height, space/2, ui/06
	lg: "h-14 px-2 gap-3 text-[20px] leading-[24px]", // 56px height, space/2, ui/08
};

// Contract-defined icon sizes per field size
const ICON_SIZE_MAP: Record<TextFieldSize, IconSize> = {
	sm: "sm", // 16px
	md: "md", // 20px
	lg: "lg", // 24px
};

export function TextField({
	value = "",
	placeholder = "",
	iconLeft,
	iconRight,
	size = "md",
	state = "default",
	disabled = false,
	onChange,
	onFocus,
	onBlur,
	className = "",
	ariaLabel,
	name,
	id,
	type = "text",
}: Readonly<TextFieldProps>) {
	const base =
		"w-full inline-flex items-center rounded-lg border font-sans transition-all duration-300";

	const sizeClass = SIZE_CLASSES[size];
	const iconSize = ICON_SIZE_MAP[size];

	// Contract-defined state styles - wrapper (border, bg, ring)
	let wrapperClass =
		"bg-white/5 border-white/10 hover:border-white/20 focus-within:outline-none focus-within:ring-2 focus-within:ring-white/30 focus-within:ring-offset-2 focus-within:ring-offset-black"; // default

	if (state === "focused") {
		wrapperClass =
			"bg-white/5 border-cyan-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-400/50 focus-within:ring-offset-2 focus-within:ring-offset-black"; // color/primary
	} else if (state === "error") {
		wrapperClass =
			"bg-white/5 border-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-500/50 focus-within:ring-offset-2 focus-within:ring-offset-black"; // color/accent/error
	} else if (state === "disabled") {
		wrapperClass =
			"bg-white/5 border-white/10 opacity-50 pointer-events-none"; // color/glass/stroke
	}

	// Contract-defined state styles - input text
	const inputTextClass =
		state === "error"
			? "text-red-400 placeholder:text-red-400/60" // error: red text + muted red placeholder
			: "text-white placeholder:text-gray-400"; // default/focused/disabled: white text + gray placeholder

	const iconTone = "primary";

	return (
		<div className={`${base} ${sizeClass} ${wrapperClass} ${className}`}>
			{iconLeft && (
				<Icon name={iconLeft} size={iconSize} tone={iconTone} />
			)}
			<input
				type={type}
				value={value}
				placeholder={placeholder}
				disabled={disabled || state === "disabled"}
				onChange={(e) => onChange?.(e.target.value)}
				onFocus={onFocus}
				onBlur={onBlur}
				aria-label={ariaLabel}
				name={name}
				id={id}
				className={`flex-1 bg-transparent border-none outline-none ${inputTextClass}`}
			/>
			{iconRight && (
				<Icon name={iconRight} size={iconSize} tone={iconTone} />
			)}
		</div>
	);
}
