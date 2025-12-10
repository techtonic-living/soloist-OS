import { useState } from "react";
import { Heart } from "lucide-react";

export const TypeSandbox = ({ onFavorite, favorites }: any) => {
	const [headerFont, setHeaderFont] = useState("Playfair Display");
	const [bodyFont, setBodyFont] = useState("Inter");
	const pairingKey = `${headerFont}:${bodyFont}`;
	const isFavorite = favorites.includes(pairingKey);

	const FONTS = [
		"Inter",
		"Roboto",
		"Outfit",
		"Space Grotesk",
		"Playfair Display",
		"Lora",
		"Merriweather",
	];

	const randomize = () => {
		setHeaderFont(FONTS[Math.floor(Math.random() * FONTS.length)]);
		setBodyFont(FONTS[Math.floor(Math.random() * FONTS.length)]);
	};

	return (
		<div className="h-full flex flex-row gap-8">
			<div className="w-1/3 flex flex-col gap-6 p-6 bg-black/20 rounded-xl border border-glass-stroke">
				<h3 className="text-white font-brand text-lg mb-2">Controls</h3>
				<div className="space-y-4">
					<div>
						<label className="text-xs text-gray-500 font-mono block mb-2">
							HEADER FONT
						</label>
						<select
							value={headerFont}
							onChange={(e) => setHeaderFont(e.target.value)}
							className="w-full bg-bg-void border border-glass-stroke rounded-lg p-2 text-white font-mono text-xs"
						>
							{FONTS.map((f) => (
								<option key={f} value={f}>
									{f}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="text-xs text-gray-500 font-mono block mb-2">
							BODY FONT
						</label>
						<select
							value={bodyFont}
							onChange={(e) => setBodyFont(e.target.value)}
							className="w-full bg-bg-void border border-glass-stroke rounded-lg p-2 text-white font-mono text-xs"
						>
							{FONTS.map((f) => (
								<option key={f} value={f}>
									{f}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="flex gap-4 mt-auto">
					<button
						onClick={randomize}
						className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-mono text-xs transition-colors"
					>
						Randomize
					</button>
					<button
						onClick={() => onFavorite(pairingKey)}
						className={`p-2 rounded-lg border transition-all ${
							isFavorite
								? "bg-red-500 text-white border-red-500"
								: "bg-transparent text-gray-400 border-glass-stroke hover:text-white"
						}`}
					>
						<Heart
							size={16}
							className={isFavorite ? "fill-current" : ""}
						/>
					</button>
				</div>
			</div>

			<div className="flex-1 bg-white p-12 rounded-2xl flex flex-col justify-center gap-6 shadow-monolith text-black">
				<h1
					className="text-5xl leading-tight"
					style={{ fontFamily: headerFont }}
				>
					The quick brown fox jumps over the lazy dog.
				</h1>
				<div className="space-y-4" style={{ fontFamily: bodyFont }}>
					<p className="text-lg leading-relaxed opacity-80 max-w-xl">
						Good typography is invisible. It allows the reader to
						focus on the content, not the formatting.
					</p>
					<p className="text-sm opacity-60 max-w-lg">
						Use modular scales to ensure harmony between your
						headings and body text. A well-chosen pair can define
						your entire brand aesthetic.
					</p>
				</div>
			</div>
		</div>
	);
};
