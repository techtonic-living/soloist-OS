import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { colord } from "colord";

interface ColoredPencilsPickerProps {
	onChange: (hex: string) => void;
	onHoverColor?: (hex: string | null) => void;
	size?: number;
}

export const ColoredPencilsPicker = ({
	onChange,
	onHoverColor,
	size = 380,
}: ColoredPencilsPickerProps) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	const colors = useMemo(() => {
		const count = 24;
		return Array.from({ length: count }).map((_, i) => {
			const hue = (i / count) * 360;
			return colord({ h: hue, s: 70, l: 60 }).toHex();
		});
	}, []);

	return (
		<div
			className="relative flex items-center justify-center pointer-events-auto overflow-hidden rounded-full"
			style={{ width: size, height: size }}
			onMouseLeave={() => {
				setHoveredIndex(null);
				onHoverColor?.(null);
			}}
		>
			<div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-full border border-white/10" />

			<div className="relative flex flex-wrap gap-2 justify-center items-center p-8">
				{colors.map((color, i) => {
					const isHovered = hoveredIndex === i;
					return (
						<motion.button
							key={i}
							onClick={() => onChange(color)}
							onMouseEnter={() => {
								setHoveredIndex(i);
								onHoverColor?.(color);
							}}
							initial={{ opacity: 0, y: 20 }}
							animate={{
								opacity: 1,
								y: 0,
								scale: isHovered ? 1.4 : 1,
								zIndex: isHovered ? 50 : 1,
							}}
							transition={{ delay: i * 0.02 }}
							className="w-8 h-24 rounded-full relative shadow-lg"
							style={{
								backgroundColor: color,
								boxShadow: isHovered
									? `0 0 20px ${color}80`
									: "none",
							}}
						>
							<div className="absolute top-0 left-0 right-0 h-8 rounded-full bg-white/20" />
							<div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1 h-8 bg-black/10 rounded-full" />
						</motion.button>
					);
				})}
			</div>
		</div>
	);
};
