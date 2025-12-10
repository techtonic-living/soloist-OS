import { useState } from "react";
import { colord } from "colord";

export const ContrastLab = () => {
	const [fg, setFg] = useState("#FFFFFF");
	const [bg, setBg] = useState("#3D8BFF");

	const contrast = colord(bg).contrast(fg);
	const score =
		contrast >= 7
			? "AAA"
			: contrast >= 4.5
			? "AA"
			: contrast >= 3
			? "AA Large"
			: "Fail";
	const isPass = contrast >= 4.5;

	return (
		<div className="h-full flex flex-row gap-8">
			{/* Controls */}
			<div className="w-1/3 flex flex-col gap-6 p-6 bg-black/20 rounded-xl border border-glass-stroke">
				<h3 className="text-white font-brand text-lg mb-2">
					Parameters
				</h3>
				<ColorControl label="TEXT COLOR" color={fg} onChange={setFg} />
				<ColorControl label="BACKGROUND" color={bg} onChange={setBg} />

				<div className="mt-auto pt-6 border-t border-glass-stroke">
					<div className="flex justify-between items-end">
						<span className="text-gray-400 text-sm">Ratio</span>
						<span className="text-4xl font-mono text-white font-bold">
							{contrast.toFixed(2)}
						</span>
					</div>
					<div
						className={`mt-2 flex items-center justify-center py-2 rounded-lg font-bold text-sm ${
							isPass
								? "bg-accent-success/20 text-accent-success"
								: "bg-red-500/20 text-red-500"
						}`}
					>
						{score}
					</div>
				</div>
			</div>

			{/* Preview */}
			<div
				className="flex-1 rounded-2xl flex flex-col items-center justify-center p-12 transition-colors duration-200 shadow-inner"
				style={{ backgroundColor: bg }}
			>
				<div className="space-y-8 text-center" style={{ color: fg }}>
					<h1 className="text-6xl font-brand">Heading</h1>
					<p className="text-lg max-w-md leading-relaxed">
						The quick brown fox jumps over the lazy dog.
					</p>
					<div className="flex gap-4 justify-center">
						<span className="font-bold">Bold</span>
						<span className="opacity-60">Regular</span>
						<span className="font-light">Light</span>
					</div>
				</div>
			</div>
		</div>
	);
};

const ColorControl = ({ label, color, onChange }: any) => (
	<div className="space-y-2">
		<label className="text-xs text-gray-400 font-mono">{label}</label>
		<div className="flex items-center gap-3">
			<input
				type="color"
				value={color}
				onChange={(e) => onChange(e.target.value)}
				className="w-10 h-10 rounded-lg border border-glass-stroke bg-transparent cursor-pointer"
			/>
			<input
				type="text"
				value={color}
				onChange={(e) => onChange(e.target.value)}
				className="flex-1 bg-transparent border-b border-glass-stroke text-white font-mono text-sm focus:outline-none focus:border-accent-cyan"
			/>
		</div>
	</div>
);
