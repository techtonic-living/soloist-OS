import { LucideIcon } from "lucide-react";

type IconButtonProps = {
	icon: LucideIcon;
	onClick?: () => void;
	disabled?: boolean;
	title: string;
	ariaLabel: string;
	className?: string;
	size?: number;
};

/**
 * Icon button primitive.
 * Requires explicit `title` + `ariaLabel` (design-system rule).
 */
export function IconButton({
	icon: Icon,
	onClick,
	disabled,
	title,
	ariaLabel,
	className = "",
	size = 16,
}: Readonly<IconButtonProps>) {
	return (
		<button
			type="button"
			title={title}
			aria-label={ariaLabel}
			onClick={onClick}
			disabled={disabled}
			className={`p-2 rounded-full transition-all duration-300 ${
				disabled
					? "opacity-50 pointer-events-none"
					: "hover:bg-white/10"
			} text-gray-400 hover:text-white ${className}`}
		>
			<Icon size={size} />
		</button>
	);
}
