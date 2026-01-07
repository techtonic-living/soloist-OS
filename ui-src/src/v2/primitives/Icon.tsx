import type { ComponentType } from "react";
import {
	IconCheck,
	IconChevronLeft,
	IconChevronRight,
	IconLoader2,
	IconPlus,
	IconX,
	type IconProps as TablerIconProps,
} from "@tabler/icons-react";

export type IconStroke = 0.5 | 1 | 1.5 | 2;

export type IconName =
	| "plus"
	| "chevron-left"
	| "chevron-right"
	| "x"
	| "check"
	| "loader";

const ICONS: Record<IconName, ComponentType<TablerIconProps>> = {
	plus: IconPlus,
	"chevron-left": IconChevronLeft,
	"chevron-right": IconChevronRight,
	x: IconX,
	check: IconCheck,
	loader: IconLoader2,
};

export type IconProps = {
	name: IconName;
	size?: number;
	stroke?: IconStroke;
	className?: string;
	/** For non-decorative icons only. Prefer leaving this undefined in buttons and labeling the button itself. */
	ariaLabel?: string;
	/** Optional tooltip/title text for the SVG */
	title?: string;
};

/**
 * Design-system Icon primitive.
 *
 * - Defaults to Tabler icons
 * - Defaults to 1px stroke (stroke/thin)
 * - Defaults to inheriting text color (tone-based icons)
 */
export function Icon({
	name,
	size = 14,
	stroke = 1,
	className,
	ariaLabel,
	title,
}: Readonly<IconProps>) {
	const Svg = ICONS[name];
	const isDecorative = !ariaLabel;

	return (
		<Svg
			size={size}
			stroke={stroke}
			className={className}
			focusable={false}
			role={isDecorative ? undefined : "img"}
			aria-hidden={isDecorative ? true : undefined}
			aria-label={isDecorative ? undefined : ariaLabel}
			title={title}
		/>
	);
}
