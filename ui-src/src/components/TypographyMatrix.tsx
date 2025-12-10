import { motion } from "framer-motion";
import { Type } from "lucide-react";

export const TYPE_SCALES = [
	{ name: "Minor Second", ratio: 1.067 },
	{ name: "Major Second", ratio: 1.125 },
	{ name: "Minor Third", ratio: 1.2 },
	{ name: "Major Third", ratio: 1.25 },
	{ name: "Perfect Fourth", ratio: 1.333 },
	{ name: "Augmented Fourth", ratio: 1.414 },
	{ name: "Perfect Fifth", ratio: 1.5 },
	{ name: "Golden Ratio", ratio: 1.618 },
];

export const generateSteps = (baseSize: number, scaleRatio: number) => {
	const levels = [
		{ name: "Display 2XL", step: 5, el: "h1" },
		{ name: "Display XL", step: 4, el: "h2" },
		{ name: "Heading L", step: 3, el: "h3" },
		{ name: "Heading M", step: 2, el: "h4" },
		{ name: "Heading S", step: 1, el: "h5" },
		{ name: "Body Base", step: 0, el: "p" },
		{ name: "Caption", step: -1, el: "small" },
	];

	return levels.map((l) => {
		const size = baseSize * Math.pow(scaleRatio, l.step);
		return {
			...l,
			size: Number(size.toFixed(2)),
			rem: (size / 16).toFixed(3),
		};
	});
};

interface TypographyMatrixProps {
	baseSize: number;
	setBaseSize: (size: number) => void;
	scale: (typeof TYPE_SCALES)[0];
	setScale: (scale: (typeof TYPE_SCALES)[0]) => void;
}

export const TypographyMatrix = ({
	baseSize,
	setBaseSize,
	scale,
	setScale,
}: TypographyMatrixProps) => {
	const typeSteps = generateSteps(baseSize, scale.ratio);

	return (
		<div className="h-full grid grid-cols-12 gap-8">
			{/* Controls */}
			<div className="col-span-4 flex flex-col gap-6 border-r border-glass-stroke pr-6">
				<div className="space-y-4">
					<h3 className="font-display text-xs text-gray-400 uppercase tracking-widest">
						Configuration
					</h3>

					{/* Base Size Input */}
					<div className="space-y-2">
						<label className="text-xs text-gray-500 font-mono">
							Base Size (px)
						</label>
						<input
							type="number"
							value={baseSize}
							onChange={(e) =>
								setBaseSize(Number(e.target.value))
							}
							className="w-full bg-bg-void border border-glass-stroke rounded-lg py-2 px-3 text-white font-mono text-sm focus:outline-none focus:border-accent-cyan/50"
						/>
					</div>

					{/* Scale Selector */}
					<div className="space-y-2">
						<label className="text-xs text-gray-500 font-mono">
							Scale Ratio
						</label>
						<div className="flex flex-col gap-1">
							{TYPE_SCALES.map((s) => (
								<button
									key={s.name}
									onClick={() => setScale(s)}
									className={`text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex justify-between group ${
										scale.name === s.name
											? "bg-primary/20 text-primary border border-primary/30"
											: "text-gray-500 hover:bg-white/5"
									}`}
								>
									<span>{s.name}</span>
									<span
										className={`opacity-0 group-hover:opacity-100 ${
											scale.name === s.name
												? "opacity-100"
												: ""
										}`}
									>
										{s.ratio}
									</span>
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Quick Info */}
				<div className="mt-auto p-4 rounded-xl bg-accent-cyan/5 border border-accent-cyan/10">
					<div className="flex gap-3 items-start">
						<Type size={16} className="text-accent-cyan mt-1" />
						<div>
							<p className="text-xs text-accent-cyan font-semibold mb-1">
								Responsive Typography
							</p>
							<p className="text-[10px] text-gray-400 leading-relaxed">
								Values are calculated in REMs based on a 16px
								root. Using a {scale.name} scale ensures
								meaningful size contrast.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Preview */}
			<div className="col-span-8 overflow-y-auto custom-scrollbar pr-2">
				<h3 className="font-display text-xs text-gray-400 uppercase tracking-widest mb-6">
					Interactive Scale Preview
				</h3>
				<div className="space-y-8">
					{typeSteps.map((step, i) => (
						<motion.div
							key={step.name}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: i * 0.05 }}
							className="group"
						>
							<div className="flex items-baseline justify-between mb-2 border-b border-glass-stroke/50 pb-2">
								<span className="text-xs font-mono text-gray-500 group-hover:text-primary transition-colors">
									{step.name}
								</span>
								<div className="flex gap-4 font-mono text-[10px] text-gray-600">
									<span>{step.size}px</span>
									<span>{step.rem}rem</span>
								</div>
							</div>
							<p
								style={{
									fontSize: `${step.size}px`,
									lineHeight: 1.2,
								}}
								className="text-white font-brand transition-all duration-300 origin-left"
							>
								The quick orbiter.
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</div>
	);
};
