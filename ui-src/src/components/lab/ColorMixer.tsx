import { useState } from "react";
import { colord } from "colord";
import { Heart } from "lucide-react";

export const ColorMixer = ({ onFavorite, favorites }: any) => {
	const [colorA, setColorA] = useState("#3D8BFF");
	const [colorB, setColorB] = useState("#FFFFFF");
	const [steps, setSteps] = useState(5);

	const mix = [];
	for (let i = 0; i <= steps; i++) {
		const ratio = i / steps;
		mix.push(colord(colorA).mix(colorB, ratio).toHex());
	}

	return (
		<div className="h-full flex flex-col items-center justify-center gap-12">
			<div className="flex items-center gap-8 w-full max-w-2xl px-8">
				<ColorInput color={colorA} onChange={setColorA} label="Start" />
				<div className="flex-1 flex flex-col items-center gap-2">
					<span className="text-xs text-gray-500 font-mono">
						STEPS: {steps}
					</span>
					<input
						type="range"
						min="3"
						max="20"
						value={steps}
						onChange={(e) => setSteps(Number(e.target.value))}
						className="w-full accent-accent-cyan"
					/>
				</div>
				<ColorInput color={colorB} onChange={setColorB} label="End" />
			</div>

			<div className="w-full h-32 flex rounded-2xl overflow-hidden shadow-2xl border border-white/10">
				{mix.map((hex, i) => (
					<div key={i} className="flex-1 h-full relative group">
						<div
							className="w-full h-full"
							style={{ backgroundColor: hex }}
						/>
						<div className="absolute bottom-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								onClick={() => onFavorite(hex)}
								className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md"
							>
								<Heart
									size={12}
									className={
										favorites.includes(hex)
											? "fill-current text-red-500"
											: ""
									}
								/>
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const ColorInput = ({ color, onChange, label }: any) => (
	<div className="flex flex-col items-center gap-2">
		<label className="text-[10px] font-mono text-gray-500 uppercase">
			{label}
		</label>
		<div
			className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white/10 relative overflow-hidden"
			style={{ backgroundColor: color }}
		>
			<input
				type="color"
				value={color}
				onChange={(e) => onChange(e.target.value)}
				className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
			/>
		</div>
	</div>
);
