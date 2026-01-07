import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { colord } from "colord";

interface DiscreteBlendedPickerProps {
	onChange: (hex: string) => void;
	onHoverColor?: (hex: string | null) => void;
	size?: number;
}

export const DiscreteBlendedPicker = ({
	onChange,
	onHoverColor,
	size = 380,
}: DiscreteBlendedPickerProps) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	const segments = useMemo(() => {
		const count = 12;
		return Array.from({ length: count }).map((_, i) => {
			const hue = (i / count) * 360;
			return colord({ h: hue, s: 80, l: 55 }).toHex();
		});
	}, []);

	return (
		<div
			className="relative flex items-center justify-center pointer-events-auto"
			style={{ width: size, height: size }}
			onMouseLeave={() => {
				setHoveredIndex(null);
				onHoverColor?.(null);
			}}
		>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				<defs>
					<filter
						id="segment-glow"
						x="-50%"
						y="-50%"
						width="200%"
						height="200%"
					>
						<feGaussianBlur stdDeviation="15" result="blur" />
						<feComposite
							in="SourceGraphic"
							in2="blur"
							operator="over"
						/>
					</filter>
				</defs>
				{segments.map((color, i) => {
					const count = segments.length;
					const angleStep = 360 / count;
					const startAngle = i * angleStep;
					const endAngle = (i + 1) * angleStep;
					const radius = size / 2 - 10;
					const innerRadius = radius * 0.4;
					const centerX = size / 2;
					const centerY = size / 2;

					const startRad = (startAngle - 90) * (Math.PI / 180);
					const endRad = (endAngle - 90) * (Math.PI / 180);

					const x1 = centerX + radius * Math.cos(startRad);
					const y1 = centerY + radius * Math.sin(startRad);
					const x2 = centerX + radius * Math.cos(endRad);
					const y2 = centerY + radius * Math.sin(endRad);

					const x3 = centerX + innerRadius * Math.cos(endRad);
					const y3 = centerY + innerRadius * Math.sin(endRad);
					const x4 = centerX + innerRadius * Math.cos(startRad);
					const y4 = centerY + innerRadius * Math.sin(startRad);

					const pathData = `
						M ${x1} ${y1}
						A ${radius} ${radius} 0 0 1 ${x2} ${y2}
						L ${x3} ${y3}
						A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4}
						Z
					`;

					const isHovered = hoveredIndex === i;

					return (
						<motion.path
							key={i}
							d={pathData}
							fill={color}
							stroke="white"
							strokeWidth={isHovered ? 2 : 0.5}
							strokeOpacity={0.2}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{
								opacity: 1,
								scale: 1,
								filter: isHovered
									? "url(#segment-glow)"
									: "none",
								zIndex: isHovered ? 10 : 1,
							}}
							transition={{
								delay: i * 0.03,
								type: "spring",
								stiffness: 300,
								damping: 20,
							}}
							className="cursor-pointer"
							onClick={() => onChange(color)}
							onMouseEnter={() => {
								setHoveredIndex(i);
								onHoverColor?.(color);
							}}
						/>
					);
				})}
			</svg>
		</div>
	);
};
