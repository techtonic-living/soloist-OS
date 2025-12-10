import { Trash, Heart } from "lucide-react";

export const ColorLibrary = ({
	library,
	onLoadColor,
	onRemoveColor,
	onRemovePalette,
}: any) => {
	return (
		<div className="h-full overflow-y-auto pr-2 pb-20">
			<div className="space-y-12">
				{/* Palettes */}
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
							{library.palettes.map((p: any, i: number) => (
								<div
									key={i}
									className="bg-bg-raised border border-glass-stroke p-4 rounded-xl space-y-3 group"
								>
									<div className="flex items-center justify-between">
										<span className="text-xs font-mono text-white">
											{p.name}
										</span>
										<button
											onClick={() => onRemovePalette(i)}
											className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<Trash size={12} />
										</button>
									</div>
									<div className="h-12 flex rounded-lg overflow-hidden w-full">
										{p.colors.map(
											(c: string, ci: number) => (
												<div
													key={ci}
													className="flex-1 h-full"
													style={{
														backgroundColor: c,
													}}
												/>
											)
										)}
									</div>
									<div className="flex justify-end">
										<button
											onClick={() =>
												onLoadColor(p.colors[0])
											}
											className="text-[10px] text-accent-cyan hover:underline"
										>
											Use Base
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Saved Colors */}
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
										style={{ backgroundColor: color }}
										onClick={() => onLoadColor(color)}
										title="Click to load as seed"
									/>
									<button
										onClick={() => onRemoveColor(color)}
										className="absolute top-1 right-1 p-1 rounded-full bg-black/20 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
									>
										<Heart
											size={12}
											className="fill-current text-white"
										/>
									</button>
									<div className="absolute bottom-0 inset-x-0 bg-black/40 backdrop-blur-sm p-1 text-center">
										<span className="text-[8px] font-mono text-white">
											{color}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
