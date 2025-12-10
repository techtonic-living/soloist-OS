import { motion } from "framer-motion";

// Standard Grid Spacing Scale (4pt grid)
const SPACING_STEPS = [
	{ name: "xs", value: 4, label: "4px" },
	{ name: "sm", value: 8, label: "8px" },
	{ name: "md", value: 16, label: "16px" },
	{ name: "lg", value: 24, label: "24px" },
	{ name: "xl", value: 32, label: "32px" },
	{ name: "2xl", value: 48, label: "48px" },
	{ name: "3xl", value: 64, label: "64px" },
	{ name: "4xl", value: 96, label: "96px" },
	{ name: "5xl", value: 128, label: "128px" },
];

export const SpacingMatrix = () => {
	return (
		<div className="h-full flex flex-col">
			<div className="flex items-center justify-between mb-8 text-white">
				<h3 className="font-display text-xs text-gray-400 uppercase tracking-widest">
					Spatial System (4pt Grid)
				</h3>
				<span className="text-[10px] font-mono text-gray-600 px-2 py-1 rounded border border-glass-stroke">
					Formula: n * 4
				</span>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar max-h-[500px] pr-2">
				{SPACING_STEPS.map((step, i) => (
					<motion.div
						key={step.name}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: i * 0.05 }}
						className="p-4 rounded-xl bg-bg-surface border border-glass-stroke hover:border-accent-cyan/30 transition-colors group"
					>
						<div className="flex justify-between items-center mb-3">
							<span className="text-sm font-mono text-primary font-bold">
								spacing-{step.name}
							</span>
							<span className="text-xs text-gray-500 font-mono">
								{step.label} / {step.value / 16}rem
							</span>
						</div>

						{/* Visualization */}
						<div className="w-full bg-bg-void rounded-lg p-2 h-24 flex items-center justify-center relative overflow-hidden">
							<div
								className="absolute inset-0 opacity-20 pointer-events-none"
								style={{
									backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
									backgroundSize: "8px 8px",
								}}
							/>

							<div className="flex gap-0 items-center">
								<div className="w-8 h-8 bg-glass-highlight rounded border border-white/10" />
								<div
									className="bg-accent-success/20 border-x border-accent-success/50 h-4 flex items-center justify-center relative"
									style={{ width: `${step.value}px` }}
								>
									<span className="text-[9px] text-accent-success font-mono absolute -top-4">
										{step.value}
									</span>
								</div>
								<div className="w-8 h-8 bg-glass-highlight rounded border border-white/10" />
							</div>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
};
