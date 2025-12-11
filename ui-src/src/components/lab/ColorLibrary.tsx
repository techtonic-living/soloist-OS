import { useState } from "react";
import { Trash, Heart, Book } from "lucide-react";
import { PRESET_LIBRARIES, PresetColor } from "../../data/colorPresets";

export const ColorLibrary = ({
	library,
	onLoadColor,
	onRemoveColor,
	onRemovePalette,
	onInspectColor,
	view = "all",
}: {
	library: any;
	onLoadColor: (c: string) => void;
	onRemoveColor: (c: string) => void;
	onRemovePalette: (i: number) => void;
	onInspectColor?: (c: PresetColor) => void;
	view?: "all" | "colors" | "palettes";
}) => {
	const [activeSubTab, setActiveSubTab] = useState<"favorites" | "presets">(
		"favorites"
	);

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Sub-Navigation for Colors View */}
			{view === "colors" && (
				<div className="flex gap-4 mb-6 border-b border-glass-stroke px-2">
					<button
						onClick={() => setActiveSubTab("favorites")}
						className={`pb-2 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 ${
							activeSubTab === "favorites"
								? "border-accent-cyan text-white"
								: "border-transparent text-gray-500 hover:text-gray-300"
						}`}
					>
						Favorites
					</button>
					<button
						onClick={() => setActiveSubTab("presets")}
						className={`pb-2 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 ${
							activeSubTab === "presets"
								? "border-accent-cyan text-white"
								: "border-transparent text-gray-500 hover:text-gray-300"
						}`}
					>
						Presets
					</button>
				</div>
			)}

			<div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
				<div className="space-y-12">
					{/* Palettes */}
					{(view === "all" || view === "palettes") && (
						<div className="space-y-4">
							<h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest border-b border-glass-stroke pb-2">
								Saved Palettes
							</h3>
							{library.palettes.length === 0 ? (
								<p className="text-gray-600 text-xs italic">
									No saved palettes.
								</p>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{library.palettes.map(
										(p: any, i: number) => (
											<div
												key={i}
												className="bg-bg-raised border border-glass-stroke p-4 rounded-xl space-y-3 group"
											>
												<div className="flex items-center justify-between">
													<span className="text-xs font-mono text-white">
														{p.name}
													</span>
													<button
														onClick={() =>
															onRemovePalette(i)
														}
														className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
													>
														<Trash size={12} />
													</button>
												</div>
												<div className="h-12 flex rounded-lg overflow-hidden w-full">
													{p.colors.map(
														(
															c: string,
															ci: number
														) => (
															<div
																key={ci}
																className="flex-1 h-full"
																style={{
																	backgroundColor:
																		c,
																}}
															/>
														)
													)}
												</div>
												<div className="flex justify-end">
													<button
														onClick={() =>
															onLoadColor(
																p.colors[0]
															)
														}
														className="text-[10px] text-accent-cyan hover:underline"
													>
														Use Base
													</button>
												</div>
											</div>
										)
									)}
								</div>
							)}
						</div>
					)}

					{/* Colors: Favorites View */}
					{(view === "all" ||
						(view === "colors" &&
							activeSubTab === "favorites")) && (
						<div className="space-y-4">
							<h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest border-b border-glass-stroke pb-2">
								Saved Colors
							</h3>
							{library.colors.length === 0 ? (
								<p className="text-gray-600 italic text-sm">
									No saved colors yet.
								</p>
							) : (
								<div className="grid grid-cols-6 gap-4">
									{library.colors.map((color: string) => (
										<div
											key={color}
											className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg"
										>
											<div
												className="w-full h-full cursor-pointer"
												style={{
													backgroundColor: color,
												}}
												onClick={() =>
													onLoadColor(color)
												}
												title="Click to load as seed"
											/>
											<button
												onClick={() =>
													onRemoveColor(color)
												}
												className="absolute top-1 right-1 p-1 rounded-full bg-black/20 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
											>
												<Heart
													size={12}
													className="fill-current text-white"
												/>
											</button>
											<div className="absolute bottom-0 inset-x-0 bg-black/40 backdrop-blur-sm p-1 text-center rounded-b-xl">
												<span className="text-[8px] font-mono text-white">
													{color}
												</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{view === "colors" && activeSubTab === "presets" && (
						<div className="space-y-8">
							{!PRESET_LIBRARIES ||
							PRESET_LIBRARIES.length === 0 ? (
								<p className="text-gray-500 italic">
									No preset libraries found.
								</p>
							) : (
								PRESET_LIBRARIES.map((preset) => (
									<div
										key={preset.name}
										className="space-y-4"
									>
										<div className="flex items-center gap-2 border-b border-glass-stroke pb-2">
											<Book
												size={14}
												className="text-accent-cyan"
											/>
											<h3 className="text-sm font-brand text-white">
												{preset.name}
											</h3>
											<span className="text-xs text-gray-500 ml-auto">
												{preset.colors.length} colors
											</span>
										</div>
										<p className="text-xs text-gray-500 italic">
											{preset.description}
										</p>
										<div className="grid grid-cols-6 gap-3">
											{preset.colors.map((c) => (
												<div
													key={c.value}
													className="group relative aspect-square rounded-xl overflow-hidden border border-white/20 hover:border-white/50 transition-all cursor-pointer"
													onClick={() => {
														onLoadColor(c.value);
														if (onInspectColor) {
															onInspectColor(c);
														}
													}}
												>
													<div
														className="w-full h-full ring-1 ring-inset ring-black/10"
														style={{
															backgroundColor:
																c.value,
														}}
														title={`Load ${c.name}`}
													/>
													<div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-sm p-1 rounded-b-xl">
														<div className="text-[9px] font-bold text-white text-center truncate">
															{c.name}
														</div>
														<div className="text-[7px] font-mono text-gray-300 text-center uppercase">
															{c.value}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								))
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
