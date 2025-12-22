import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, X } from "lucide-react";
import { useSoloist } from "../../context/SoloistContext";

interface SharedSamplerProps {
	onSelectColor: (hex: string) => void;
}

export const SharedSampler = ({ onSelectColor }: SharedSamplerProps) => {
	const {
		sampledColors,
		setSampledColors,
		isSamplerActive,
		setIsSamplerActive,
	} = useSoloist();

	const [isSamplerHovered, setIsSamplerHovered] = useState(false);

	const toggleSampler = () => {
		setIsSamplerActive(!isSamplerActive);
	};

	return (
		<div
			onMouseEnter={() => setIsSamplerHovered(true)}
			onMouseLeave={() => setIsSamplerHovered(false)}
			className="relative flex items-center justify-center w-[44px] h-[44px]"
		>
			{/* Center Toggle Button */}
			<button
				onClick={toggleSampler}
				className={`relative w-full h-full rounded-full backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all duration-300 z-20 ${
					isSamplerActive
						? "bg-accent-cyan/20 text-accent-cyan ring-2 ring-accent-cyan/30"
						: "bg-bg-raised/95 text-gray-400 border-glass-stroke hover:text-white hover:bg-white/10"
				}`}
				title={
					isSamplerActive
						? "Deactivate Sampler"
						: "Activate Orbiting Sampler"
				}
			>
				{isSamplerActive ? (
					<span className="font-mono text-[10px] font-bold">
						{sampledColors.length}/10
					</span>
				) : (
					<Target
						size={18}
						className="hover:rotate-90 transition-transform duration-300"
					/>
				)}
				{isSamplerActive && (
					<div className="absolute inset-0 rounded-full animate-pulse bg-accent-cyan/20 -z-10" />
				)}
			</button>

			{/* Orbiting Color Bubbles */}
			<AnimatePresence>
				{isSamplerActive &&
					sampledColors.map((hex, i) => {
						const count = Math.min(sampledColors.length, 10);
						const spreadAngle = (360 / count) * i;
						const orbitAngle = (360 / count) * i;
						const radius = isSamplerHovered ? 50 : 36 + (i % 2) * 6;
						const scale = isSamplerHovered ? 1.25 : 1;

						return (
							<motion.div
								key={`${hex}-${i}`}
								className="absolute w-6 h-6 pointer-events-none"
								style={{
									left: "50%",
									top: "50%",
									marginLeft: "-12px",
									marginTop: "-12px",
									zIndex: 10,
								}}
								animate={{
									rotate: isSamplerHovered
										? spreadAngle
										: [orbitAngle, orbitAngle + 360],
								}}
								transition={{
									rotate: isSamplerHovered
										? {
												type: "spring",
												stiffness: 45,
												damping: 14,
										  }
										: {
												duration: 15 + (i % 3) * 5,
												repeat: Infinity,
												ease: "linear",
										  },
								}}
							>
								{/* Satellite Bubble */}
								<motion.div
									className="absolute inset-0 group/bubble pointer-events-auto"
									animate={{
										x: radius,
										scale: scale,
										rotate: isSamplerHovered
											? -spreadAngle
											: [
													-orbitAngle,
													-(orbitAngle + 360),
											  ],
									}}
									transition={{
										x: {
											type: "spring",
											stiffness: 80,
											damping: 12,
										},
										scale: {
											type: "spring",
											stiffness: 100,
											damping: 10,
										},
										rotate: isSamplerHovered
											? {
													type: "spring",
													stiffness: 45,
													damping: 14,
											  }
											: {
													duration: 15 + (i % 3) * 5,
													repeat: Infinity,
													ease: "linear",
											  },
									}}
								>
									{/* Color Circle */}
									<button
										onClick={() => onSelectColor(hex)}
										className="absolute inset-0 rounded-full border border-white/20 shadow-sm transition-transform duration-200 group-hover/bubble:scale-110 cursor-pointer"
										style={{
											backgroundColor: hex,
										}}
										title={`Sample ${hex}`}
										aria-label={`Select color ${hex}`}
									/>

									{/* Delete Badge */}
									<button
										onClick={(e) => {
											e.stopPropagation();
											setSampledColors((prev) =>
												prev.filter((c) => c !== hex)
											);
										}}
										className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover/bubble:opacity-100 transition-all duration-200 scale-75 group-hover/bubble:scale-100 shadow-sm hover:bg-red-600 z-30"
										aria-label={`Remove color ${hex}`}
									>
										<X size={10} strokeWidth={3} />
									</button>
								</motion.div>
							</motion.div>
						);
					})}
			</AnimatePresence>
		</div>
	);
};
