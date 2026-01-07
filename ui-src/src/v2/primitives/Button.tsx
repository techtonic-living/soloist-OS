import { ReactNode } from "react";
import { Icon, type IconName, type IconStroke } from "./Icon";

type ButtonVariant = "glass" | "ghost";

type ButtonProps = {
	children: ReactNode;
	iconLeft?: IconName;
	iconRight?: IconName;
	iconSize?: number;
	iconStroke?: IconStroke;
	variant?: ButtonVariant;
	disabled?: boolean;
	onClick?: () => void;
	title?: string;
	ariaLabel?: string;
	className?: string;
	type?: "button" | "submit" | "reset";
};

/**
 * Design system button primitive.
 * - No cursor-not-allowed on disabled.
 * - Uses semantic tokens.
 */
export function Button({
	children,
	iconLeft,
	iconRight,
	iconSize = 14,
	iconStroke = 1,
	variant = "glass",
	disabled,
	onClick,
	title,
	ariaLabel,
	className = "",
	type = "button",
}: Readonly<ButtonProps>) {
	const base =
		"inline-flex items-center justify-center gap-2 rounded-lg text-xs font-mono transition-all duration-300";
	const disabledCls = disabled ? "opacity-50 pointer-events-none" : "";

	const variantCls =
		variant === "ghost"
			? "text-gray-500 hover:text-white hover:bg-white/5"
			: "bg-white/5 hover:bg-white/10 text-white border border-white/5";

	return (
		<button
			type={type}
			title={title}
			aria-label={ariaLabel || title}
			onClick={onClick}
			className={`${base} ${variantCls} ${disabledCls} px-3 py-2 ${className}`}
			disabled={disabled}
		>
			{iconLeft && (
				<Icon
					name={iconLeft}
					size={iconSize}
					stroke={iconStroke}
					className="opacity-90"
				/>
			)}
			{children}
			{iconRight && (
				<Icon
					name={iconRight}
					size={iconSize}
					stroke={iconStroke}
					className="opacity-90"
				/>
			)}
		</button>
	);
}
