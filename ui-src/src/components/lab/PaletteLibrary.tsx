import { useState } from "react";
import { Trash2, FolderOpen, Globe } from "lucide-react";
import { PALETTE_LIBRARIES } from "../../data/palettePresets";

interface PaletteLibraryProps {
	library: any; // Using any for now to match the flexible structure of system settings
	onRemovePalette: (index: number) => void;
	onInspectPalette: (palette: any) => void;
}

export const PaletteLibrary = ({
	library,
	onRemovePalette,
	onInspectPalette,
}: PaletteLibraryProps) => {
	const [activeSubTab, setActiveSubTab] = useState<"favorites" | "libraries">(
		"favorites"
	);
	const [density, setDensity] = useState(2);

	// Flatten preset libraries for easier viewing if we want "All Libraries"
	// Or we can show them as accordions. For mirroring ColorLibrary, we'll keep it simple.

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Sub-Navigation */}
			<div className="flex items-center justify-between mb-6 border-b border-glass-stroke px-2">
				<div className="flex gap-4">
					<button
						onClick={() => setActiveSubTab("favorites")}
						className={`pb-2 text-xs font-mono tracking-wider transition-colors relative ${
							activeSubTab === "favorites"
								? "text-white"
								: "text-gray-500 hover:text-gray-300"
						}`}
					>
						FAVORITES
						{activeSubTab === "favorites" && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan shadow-[0_0_8px_rgba(63,227,242,0.8)]" />
						)}
					</button>
					<button
						onClick={() => setActiveSubTab("libraries")}
						className={`pb-2 text-xs font-mono tracking-wider transition-colors relative ${
							activeSubTab === "libraries"
								? "text-white"
								: "text-gray-500 hover:text-gray-300"
						}`}
					>
						LIBRARIES
						{activeSubTab === "libraries" && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan shadow-[0_0_8px_rgba(63,227,242,0.8)]" />
						)}
					</button>
				</div>

				{/* Density Slider */}
				<div className="flex items-center gap-2 pb-2">
					<span className="text-[10px] text-gray-500 font-mono uppercase">
						View
					</span>
					<input
						type="range"
						min="1"
						max="4"
						step="1"
						value={density}
						onChange={(e) => setDensity(parseInt(e.target.value))}
						className="w-20 accent-accent-cyan h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
					/>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
				<div className="space-y-12">
					{/* Favorites View */}
					{activeSubTab === "favorites" && (
						<div className="space-y-8">
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<Globe
										size={14}
										className="text-accent-cyan"
									/>
									<h3 className="text-sm font-bold text-white tracking-wide">
										Saved Palettes
									</h3>
									<span className="text-xs text-gray-500 font-mono ml-1">
										({library?.palettes?.length || 0})
									</span>
								</div>

								{(!library?.palettes ||
									library.palettes.length === 0) && (
									<p className="text-gray-600 italic text-sm">
										No saved palettes yet. Create one in the
										Generator.
									</p>
								)}

								<div
									className="grid gap-4"
									style={{
										gridTemplateColumns: `repeat(${density}, minmax(0, 1fr))`,
									}}
								>
									{library?.palettes?.map(
										(p: any, i: number) => (
											<PaletteCard
												key={i}
												name={p.name}
												description={p.description}
												colors={p.colors}
												tags={p.tags}
												onLoad={() =>
													onInspectPalette(p)
												}
												onDelete={() =>
													onRemovePalette(i)
												}
											/>
										)
									)}
								</div>
							</div>
						</div>
					)}

					{/* Libraries View */}
					{activeSubTab === "libraries" && (
						<div className="space-y-8">
							{PALETTE_LIBRARIES.map((lib) => (
								<div key={lib.id} className="space-y-4">
									<div className="flex items-center gap-2">
										<FolderOpen
											size={14}
											className="text-accent-purple"
										/>
										<h3 className="text-sm font-bold text-white tracking-wide">
											{lib.name}
										</h3>
										<span className="text-xs text-gray-500 font-mono ml-1">
											({lib.palettes.length})
										</span>
									</div>
									<p className="text-xs text-gray-400">
										{lib.description}
									</p>

									<div
										className="grid gap-4"
										style={{
											gridTemplateColumns: `repeat(${density}, minmax(0, 1fr))`,
										}}
									>
										{lib.palettes.map((p, i) => (
											<PaletteCard
												key={`${lib.id}-${i}`}
												name={p.name}
												description={p.description}
												colors={p.colors}
												tags={p.tags}
												onLoad={() =>
													onInspectPalette(p)
												}
												// No delete for presets
											/>
										))}
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

// --- Sub-components ---

interface PaletteCardProps {
	name: string;
	description?: string;
	colors: string[];
	tags?: string[];
	onLoad: () => void;
	onDelete?: () => void;
}

const PaletteCard = ({
	name,
	description,
	colors,
	tags,
	onLoad,
	onDelete,
}: PaletteCardProps) => {
	return (
		<div className="group relative bg-bg-raised border border-glass-stroke p-3 rounded-xl transition-all hover:border-accent-cyan/50 hover:shadow-lg flex flex-col gap-3">
			{/* Color Strip */}
			<div
				className="h-24 w-full rounded-lg flex overflow-hidden cursor-pointer relative"
				onClick={onLoad}
			>
				{colors.map((c, i) => (
					<div
						key={i}
						className="flex-1 h-full relative group/color"
						style={{ backgroundColor: c }}
					>
						{/* Tooltip on hover */}
						<div className="absolute inset-0 opacity-0 group-hover/color:opacity-100 flex items-end justify-center pb-1">
							<span className="text-[8px] font-mono text-black/70 bg-white/90 px-1 rounded uppercase backdrop-blur-sm">
								{c}
							</span>
						</div>
					</div>
				))}

				{/* Hover Overlay indicating Action - Minimal */}
				<div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
			</div>

			{/* Info */}
			<div className="flex flex-col gap-1">
				<div className="flex items-start justify-between gap-2">
					<h4
						className="text-sm font-bold text-white truncate"
						title={name}
					>
						{name}
					</h4>
					{onDelete && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								onDelete();
							}}
							className="text-gray-600 hover:text-red-500 transition-colors bg-transparent hover:bg-red-500/10 p-1 rounded opacity-0 group-hover:opacity-100"
							title="Remove Palette"
						>
							<Trash2 size={12} />
						</button>
					)}
				</div>
				{description && (
					<p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
						{description}
					</p>
				)}
				{tags && tags.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-1">
						{tags.slice(0, 3).map((t, i) => (
							<span
								key={i}
								className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-gray-500 uppercase border border-white/5"
							>
								{t}
							</span>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
