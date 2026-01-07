import {
	Trash2,
	ArrowUpRight,
	Palette as PaletteIcon,
	ArrowRightLeft,
} from "lucide-react";

interface RemixStagingViewProps {
	colors: string[];
	palettes: any[];
	onRemoveColor: (index: number) => void;
	onRemovePalette: (index: number) => void;
	onCommitColor: (color: string) => void;
	onCommitPalette: (palette: any) => void;
	onSwapPrimary: (index: number) => void;
	onToggleFavoriteColor?: (color: string) => void;
}

export const RemixStagingView = ({
	colors = [],
	palettes = [],
	onRemoveColor,
	onRemovePalette,
	onCommitColor,
	onSwapPrimary,
}: RemixStagingViewProps) => {
	const primaryColor = colors[0];
	const secondaryColors = colors.slice(1);

	return (
		<div className="h-full flex flex-col p-6 space-y-8 overflow-y-auto custom-scrollbar">
			<div>
				<h2 className="text-2xl text-white font-brand mb-2 leading-tight">
					Remix Staging
				</h2>
				<p className="text-gray-400 text-sm leading-relaxed">
					Items collected here are ready to be mixed into new
					combinations.
				</p>
			</div>

			{/* Colors Section */}
			<div className="space-y-4">
				<h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">
					<span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
					Staged Colors ({colors.length})
				</h4>

				{colors.length === 0 ? (
					<p className="text-xs text-gray-500 italic">
						No colors staged yet.
					</p>
				) : (
					<div className="space-y-3">
						{/* Primary Color (First Item) */}
						{primaryColor && (
							<div className="group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:border-accent-cyan/30 transition-colors">
								<div className="flex items-center gap-3">
									<div
										className="w-10 h-10 rounded-full border border-white/10 shadow-lg"
										style={{
											backgroundColor: primaryColor,
										}}
									/>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-mono text-white">
											{primaryColor.toUpperCase()}
										</p>
										<span className="text-[10px] text-accent-cyan uppercase tracking-wider font-bold">
											Primary Seed
										</span>
									</div>
									<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<button
											onClick={() =>
												onCommitColor(primaryColor)
											}
											className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-accent-cyan"
											title="Use as Remix Seed"
										>
											<ArrowUpRight size={14} />
										</button>
										<button
											onClick={() => onRemoveColor(0)}
											className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400"
											title="Remove"
										>
											<Trash2 size={14} />
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Secondary Colors */}
						{secondaryColors.map((color, idx) => (
							<div
								key={`${color}-${idx}`}
								className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
							>
								<div className="flex items-center gap-3">
									<div
										className="w-6 h-6 rounded-full border border-white/10"
										style={{ backgroundColor: color }}
									/>
									<span className="text-xs font-mono text-gray-400">
										{color.toUpperCase()}
									</span>
								</div>
								<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<button
										onClick={() => onSwapPrimary(idx + 1)}
										className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-white"
										title="Set as Primary"
									>
										<ArrowRightLeft size={12} />
									</button>
									<button
										onClick={() => onRemoveColor(idx + 1)}
										className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-red-400"
										title="Remove"
									>
										<Trash2 size={12} />
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Palettes Section */}
			<div className="space-y-4">
				<h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">
					<PaletteIcon size={12} />
					Staged Palettes ({palettes.length})
				</h4>

				{palettes.length === 0 ? (
					<p className="text-xs text-gray-500 italic">
						No palettes staged yet.
					</p>
				) : (
					<div className="space-y-3">
						{palettes.map((palette, idx) => (
							<div
								key={idx}
								className="group p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
							>
								<div className="flex justify-between items-start mb-2">
									<span className="text-xs font-bold text-white">
										{palette.name || "Untitled Palette"}
									</span>
									<button
										onClick={() => onRemovePalette(idx)}
										className="text-white/30 hover:text-red-400 transition-colors"
									>
										<Trash2 size={12} />
									</button>
								</div>
								<div className="flex h-4 rounded-md overflow-hidden w-full">
									{palette.colors.map(
										(c: string, i: number) => (
											<div
												key={i}
												className="flex-1"
												style={{ backgroundColor: c }}
											/>
										)
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
