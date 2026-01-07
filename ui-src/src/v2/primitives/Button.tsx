import { ReactNode } from "react";
import { Icon, type IconName, type IconSize } from "./Icon";

/**
 * Button primitive — 12 variants (glass/ghost × sm/md/lg × default/disabled)
 *
 * CONTRACT: design/contracts/primitives/Button.contract.json
 * SCHEMA: soloist-os.primitives.button.contract.v1
 *
 * SIZES: 70×32 (sm), 91×44 (md), 113×56 (lg)
 * VARIANTS:
 *   - glass: fill=color/glass/subtle, stroke=color/glass/stroke, label=color/text/primary, icons=color/text/primary
 *   - ghost: fill=transparent, stroke=none, label=color/text/secondary, icons=color/text/primary
 * TEXT STYLES: mono/07 (sm), mono/09 (md), mono/10 (lg)
 * SPACING: space/2 (sm), space/3 (md), space/4 (lg)
 * GOVERNANCE: Tool identity on surfaces, icons remain tone-based (color/text/*)
 */

type ButtonVariant = "glass" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
	children?: ReactNode;
	iconLeft?: IconName;
	iconRight?: IconName;
	variant?: ButtonVariant;
	size?: ButtonSize;
	disabled?: boolean;
	onClick?: () => void;
	title?: string;
	ariaLabel?: string;
	className?: string;
	type?: "button" | "submit" | "reset";
};

// Contract-defined sizes (heights): 32 (sm), 44 (md), 56 (lg)
const SIZE_CLASSES: Record<ButtonSize, string> = {
	sm: "h-8 px-2 gap-2 text-[16px] leading-[16px]", // 32px height, space/2, mono/07
	md: "h-11 px-3 gap-3 text-[20px] leading-[20px]", // 44px height, space/3, mono/09
	lg: "h-14 px-4 gap-4 text-[24px] leading-[24px]", // 56px height, space/4, mono/10
};

// Contract-defined icon sizes per button size
const ICON_SIZE_MAP: Record<ButtonSize, IconSize> = {
	sm: "sm", // 16px
	md: "md", // 20px
	lg: "lg", // 24px
};

export function Button({
	children,
	iconLeft,
	iconRight,
	variant = "glass",
	size = "md",
	disabled = false,
	onClick,
	title,
	ariaLabel,
	className = "",
	type = "button",
}: Readonly<ButtonProps>) {
	const base =
		"inline-flex items-center justify-center rounded-lg font-mono font-thin uppercase tracking-wide transition-all duration-300";

	const sizeClass = SIZE_CLASSES[size];
	const iconSize = ICON_SIZE_MAP[size];

	// Contract-defined variant styles
	const variantClass =
		variant === "glass"
			? "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 active:bg-white/15 active:border-white/25" // color/glass/subtle + color/glass/stroke + color/text/primary
			: "bg-transparent border-none text-gray-400 hover:text-white active:text-gray-300"; // transparent + color/text/secondary

	const disabledClass = disabled ? "opacity-50 pointer-events-none" : "";

	// Icon tone: ghost uses primary for icons (even though label is secondary)
	const iconTone = "primary";

	return (
		<button
			type={type}
			title={title}
			aria-label={ariaLabel || title}
			onClick={onClick}
			className={`${base} ${sizeClass} ${variantClass} ${disabledClass} ${className}`}
			disabled={disabled}
		>
			{iconLeft && (
				<Icon name={iconLeft} size={iconSize} tone={iconTone} />
			)}
			{children}
			{iconRight && (
				<Icon name={iconRight} size={iconSize} tone={iconTone} />
			)}
		</button>
	);
}
