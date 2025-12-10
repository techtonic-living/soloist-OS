import { motion } from "framer-motion";
import { Grid, Circle } from "lucide-react";

const SPACING_STEPS = [
	{ name: "xs", multiplier: 1, label: "xs" },
	{ name: "sm", multiplier: 2, label: "sm" },
	{ name: "md", multiplier: 4, label: "md" },
	{ name: "lg", multiplier: 6, label: "lg" },
	{ name: "xl", multiplier: 8, label: "xl" },
	{ name: "2xl", multiplier: 12, label: "2xl" },
	{ name: "3xl", multiplier: 16, label: "3xl" },
	{ name: "4xl", multiplier: 24, label: "4xl" },
	{ name: "5xl", multiplier: 32, label: "5xl" },
];

const RADIUS_STEPS = [
	{ name: "xs", multiplier: 0.5 },
	{ name: "sm", multiplier: 1 },
	{ name: "md", multiplier: 2 },
	{ name: "lg", multiplier: 3 },
	{ name: "xl", multiplier: 4 },
	{ name: "full", multiplier: 100, isPercent: true },
];

interface SizingMatrixProps {
	baseSpacing: number;
	setBaseSpacing: (val: number) => void;
	baseRadius: number;
	setBaseRadius: (val: number) => void;
}

export const SizingMatrix = ({
	baseSpacing,
	setBaseSpacing,
	baseRadius,
	setBaseRadius,
}: SizingMatrixProps) => {
	return (
		<div className="h-full flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-4">
			{/* Controls */}
			<div className="grid grid-cols-2 gap-6 pb-6 border-b border-glass-stroke">
				{/* Spacing Control */}
				<div>
					<div className="flex items-center gap-2 mb-3 text-gray-400">
						<Grid size={14} />
						<span className="text-xs font-mono uppercase tracking-widest">
							Grid Base
						</span>
					</div>
					<div className="flex gap-2">
						{[2, 4, 8].map((val) => (
							<button
								key={val}
								onClick={() => setBaseSpacing(val)}
								className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
									baseSpacing === val
										? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan"
										: "bg-bg-raised border-glass-stroke text-gray-500 hover:text-white"
								}`}
							>
								{val}px
							</button>
						))}
					</div>
				</div>

				{/* Radius Control */}
				<div>
					<div className="flex items-center gap-2 mb-3 text-gray-400">
						<Circle size={14} />
						<span className="text-xs font-mono uppercase tracking-widest">
							Radius Base
						</span>
					</div>
					<div className="flex gap-2">
						{[0, 2, 4, 6, 8].map((val) => (
							<button
								key={val}
								onClick={() => setBaseRadius(val)}
								className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
									baseRadius === val
										? "bg-accent-purple/10 border-accent-purple text-accent-purple"
										: "bg-bg-raised border-glass-stroke text-gray-500 hover:text-white"
								}`}
							>
								{val}px
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Spacing Column */}
				<div>
					<h3 className="font-brand text-lg text-white mb-6">
						Spacing
					</h3>
					<div className="space-y-4">
						{SPACING_STEPS.map((step, i) => (
							<motion.div
								key={step.name}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: i * 0.05 }}
								className="flex items-center gap-4 group"
							>
								<div className="w-24 text-right">
									<div className="text-xs font-mono text-gray-400">
										space-{step.name}
									</div>
									<div className="text-[10px] text-gray-600 font-mono">
										{step.multiplier * baseSpacing}px
									</div>
								</div>

								{/* Visualization */}
								<div className="flex-1 h-12 bg-bg-surface/50 rounded-lg border border-glass-stroke flex items-center p-2 relative overflow-hidden">
									<div className="flex items-center">
										<div className="w-8 h-8 bg-glass-highlight rounded border border-white/10" />
										<div
											className="h-4 bg-accent-cyan/20 border-x border-accent-cyan/50 relative flex items-center justify-center"
											style={{
												width: `${
													step.multiplier *
													baseSpacing
												}px`,
											}}
										></div>
										<div className="w-8 h-8 bg-glass-highlight rounded border border-white/10" />
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</div>

				{/* Radius Column */}
				<div>
					<h3 className="font-brand text-lg text-white mb-6">
						Radius
					</h3>
					<div className="space-y-4">
						{RADIUS_STEPS.map((step, i) => {
							const value = step.isPercent
								? "9999px"
								: `${step.multiplier * baseRadius}px`;
							const displayValue = step.isPercent
								? "Full"
								: `${step.multiplier * baseRadius}px`;

							return (
								<motion.div
									key={step.name}
									initial={{ opacity: 0, x: 10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: i * 0.05 }}
									className="flex items-center gap-4 group"
								>
									<div className="w-24 text-right">
										<div className="text-xs font-mono text-gray-400">
											rounded-{step.name}
										</div>
										<div className="text-[10px] text-gray-600 font-mono">
											{displayValue}
										</div>
									</div>

									{/* Visualization */}
									<div className="flex-1 h-12 bg-bg-surface/50 rounded-lg border border-glass-stroke flex items-center justify-center p-2">
										<div
											className="w-16 h-16 bg-accent-purple/20 border-2 border-accent-purple/50 transition-all duration-300 transform scale-75 group-hover:scale-90"
											style={{ borderRadius: value }}
										/>
									</div>
								</motion.div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};
