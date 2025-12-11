import { useState, useMemo } from "react";
import {
	Heart,
	Book,
	Copy,
	Check,
	FolderPlus,
	Trash2,
	Eye,
	EyeOff,
	Edit3,
	ChevronUp,
	ChevronDown,
	Globe,
	FolderOpen,
	ArrowRightLeft,
	X,
} from "lucide-react";
import { PRESET_LIBRARIES, PresetColor } from "../../data/colorPresets";
import { colord } from "colord";
import { ColorGroup } from "../../hooks/useSoloistSystem";

// --- Helper Functions ---
const fallbackCopy = (text: string) => {
	const textArea = document.createElement("textarea");
	textArea.value = text;
	textArea.style.position = "fixed";
	textArea.style.left = "-9999px";
	textArea.style.top = "0";
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	try {
		document.execCommand("copy");
	} catch (err) {
		console.error("Fallback copy failed", err);
	}
	document.body.removeChild(textArea);
};

const performCopy = (text: string) => {
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(text).catch(() => {
			fallbackCopy(text);
		});
	} else {
		fallbackCopy(text);
	}
};

// Ensure labels are unique within a render pass (case-insensitive)
// Instead of "Teal (2)", pick a playful variant for duplicates.
const getUniqueLabel = (
	baseName: string,
	registry: Record<string, number>
): string => {
	const key = baseName.toLowerCase();
	const next = (registry[key] || 0) + 1;
	registry[key] = next;

	if (next === 1) return baseName;

	const variants = [
		`Real Deal ${baseName}`,
		`Neon ${baseName}`,
		`Midnight ${baseName}`,
		`Sunlit ${baseName}`,
		`Velvet ${baseName}`,
		`Prismatic ${baseName}`,
	];

	// If we run out of fun variants, fall back to numbered suffix
	return variants[next - 2] || `${baseName} (${next})`;
};

interface ColorLibraryProps {
	library: any;
	onLoadColor: (c: string) => void;
	onRemoveColor: (c: string, metadata?: PresetColor) => void;
	onRemovePalette: (i: number) => void;
	onInspectColor?: (c: PresetColor) => void;
	onAddColors?: (colors: PresetColor[]) => void;
	onRemoveColors?: (colors: PresetColor[]) => void;
	// Group Management
	onCreateGroup?: (name: string, description: string) => void;
	onUpdateGroup?: (id: string, updates: Partial<ColorGroup>) => void;
	onDeleteGroup?: (id: string) => void;
	onMoveColor?: (colorHex: string, targetGroupId: string | null) => void;
	onReorderGroups?: (newOrder: ColorGroup[]) => void;
	view?: "all" | "colors" | "palettes";
}

export const ColorLibrary = ({
	library,
	onLoadColor,
	onRemoveColor,
	onRemovePalette,
	onInspectColor,
	onAddColors,
	onRemoveColors,
	onCreateGroup,
	onUpdateGroup,
	onDeleteGroup,
	onMoveColor,
	onReorderGroups,
	view = "all",
}: ColorLibraryProps) => {
	// Group State
	const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
	// Temp state for inline edits
	const [tempEditData, setTempEditData] = useState<{
		name: string;
		description: string;
	} | null>(null);

	const [isCreatingGroup, setIsCreatingGroup] = useState(false);
	const [newGroupName, setNewGroupName] = useState("");
	const [newGroupDesc, setNewGroupDesc] = useState("");

	// Edit Mode State
	const [isEditingLibrary, setIsEditingLibrary] = useState(false);

	// Drag and Drop Handlers
	const handleDragStart = (
		e: React.DragEvent,
		colorHex: string,
		sourceGroupId: string | null
	) => {
		e.dataTransfer.setData("text/plain", colorHex);
		e.dataTransfer.setData("sourceGroupId", sourceGroupId || "null");
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (e: React.DragEvent, targetGroupId: string | null) => {
		e.preventDefault();
		const colorHex = e.dataTransfer.getData("text/plain");
		const sourceGroupId = e.dataTransfer.getData("sourceGroupId");

		// If moved to same group, do nothing
		if (sourceGroupId === (targetGroupId || "null")) return;

		if (onMoveColor && colorHex) {
			onMoveColor(colorHex, targetGroupId);
		}
	};

	// Separate colors into Groups and "My Favorites" (Unassigned)
	const { unassignedColors, groupColorsMap } = useMemo(() => {
		const colors = library.colors || [];
		const groups = (library.colorGroups as ColorGroup[]) || [];

		// Create a set of all color IDs that are in groups
		const groupedColorIds = new Set<string>();
		groups.forEach((g) => {
			g.colorIds.forEach((cid) => groupedColorIds.add(cid.toUpperCase()));
		});

		// Unassigned are those NOT in the set
		const unassigned = colors.filter((c: string | PresetColor) => {
			const hex = typeof c === "string" ? c : c.value;
			return !groupedColorIds.has(hex.toUpperCase());
		});

		// Map group ID to list of actual color objects
		const groupMap: Record<string, (string | PresetColor)[]> = {};
		groups.forEach((g) => {
			// Find the actual color objects from the main library that match the IDs in the group
			const groupColors = colors.filter((c: string | PresetColor) => {
				const hex = typeof c === "string" ? c : c.value;
				return g.colorIds.some(
					(gid) => gid.toUpperCase() === hex.toUpperCase()
				);
			});
			groupMap[g.id] = groupColors;
		});

		return { unassignedColors: unassigned, groupColorsMap: groupMap };
	}, [library.colors, library.colorGroups]);

	const [activeSubTab, setActiveSubTab] = useState<"favorites" | "presets">(
		"favorites"
	);

	// Registry shared across this render to avoid duplicate names across sections
	const nameRegistry: Record<string, number> = {};

	// Toggling favorite checks if it exists in the library prop
	const isFavorite = (color: string) => {
		// Case insensitive check
		if (!library || !library.colors) return false;
		return library.colors.some((c: string | PresetColor) => {
			const hexValue = typeof c === "string" ? c : c.value;
			return hexValue.toUpperCase() === color.toUpperCase();
		});
	};

	// Grid Density State (Columns)
	const [density, setDensity] = useState(2);

	const handleBulkFavorite = (colorsToProcess: PresetColor[]) => {
		// If targetGroupId is provided, we might be emptying a specific group
		// The original logic was for Presets (adding to library).
		// Reusing this for "Unfavorite All" in a group context.

		// Check if keys exist in library
		const allFavorited = colorsToProcess.every((c) => isFavorite(c.value));

		if (allFavorited) {
			// Remove from library (which removes from group too due to logic in ExploreView)
			if (onRemoveColors) {
				onRemoveColors(colorsToProcess);
			}
		} else {
			// Add to library
			if (onAddColors) {
				const newColors = colorsToProcess.filter(
					(c: PresetColor) => !isFavorite(c.value)
				);
				if (newColors.length > 0) {
					onAddColors(newColors);
					// If we had a specific target group logic for *adding*, we'd do it here,
					// but "Favorites" is just a pool. Moving to a group happens after.
				}
			}
		}
	};

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Sub-Navigation for Colors View */}
			{view === "colors" && (
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
							onClick={() => setActiveSubTab("presets")}
							className={`pb-2 text-xs font-mono tracking-wider transition-colors relative ${
								activeSubTab === "presets"
									? "text-white"
									: "text-gray-500 hover:text-gray-300"
							}`}
						>
							LIBRARIES
							{activeSubTab === "presets" && (
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
							max="6"
							step="1"
							value={density}
							onChange={(e) =>
								setDensity(parseInt(e.target.value))
							}
							className="w-20 accent-accent-cyan h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
						/>
					</div>
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
														<Trash2 size={12} />
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
						<div className="space-y-8">
							{/* My Favorites (Unassigned) */}
							<div
								className={`space-y-4 transition-all ${
									isEditingLibrary
										? "bg-white/5 border border-white/10 border-dashed rounded-xl p-4"
										: "rounded-none p-0"
								}`}
								onDragOver={
									isEditingLibrary
										? handleDragOver
										: undefined
								}
								onDrop={
									isEditingLibrary
										? (e) => handleDrop(e, null)
										: undefined
								}
							>
								<div className="space-y-1">
									<div className="flex items-center justify-between group/section">
										<div className="flex items-center gap-2">
											<Globe
												size={14}
												className="text-accent-cyan"
											/>
											<h3 className="text-sm font-bold text-white tracking-wide">
												Global
											</h3>
											<span className="text-xs text-gray-500 font-mono ml-1">
												({unassignedColors.length})
											</span>
										</div>
										<div className="flex items-center gap-2 transition-opacity">
											{onCreateGroup && (
												<button
													onClick={() =>
														setIsCreatingGroup(true)
													}
													className="p-1.5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
													title="Create New Group"
												>
													<FolderPlus size={14} />
												</button>
											)}
											{/* Organize / Edit Mode Toggle */}
											<button
												onClick={() =>
													setIsEditingLibrary(
														!isEditingLibrary
													)
												}
												className={`p-1.5 rounded-full transition-colors ${
													isEditingLibrary
														? "text-accent-cyan bg-accent-cyan/10 ring-1 ring-accent-cyan/30"
														: "text-gray-500 hover:text-white hover:bg-white/10"
												}`}
												title={
													isEditingLibrary
														? "Done Organizing"
														: "Organize Colors and Groups"
												}
											>
												<ArrowRightLeft size={14} />
											</button>
											{unassignedColors.length > 0 &&
												onRemoveColors && (
													<button
														onClick={() =>
															onRemoveColors(
																unassignedColors.map(
																	(
																		c:
																			| string
																			| PresetColor
																	) =>
																		typeof c ===
																		"string"
																			? {
																					name: c,
																					value: c,
																					id: c,
																			  }
																			: c
																) as PresetColor[]
															)
														}
														className="p-1.5 hover:bg-white/10 rounded-full text-red-500 hover:text-red-400 transition-colors"
														title="Unfavorite All"
													>
														<Heart
															size={14}
															className="fill-current"
														/>
													</button>
												)}
										</div>
									</div>
									<p className="text-xs text-white/80 leading-relaxed border-b border-glass-stroke pb-2">
										Colors saved here will always be active
										and accessible.
									</p>
								</div>

								{/* Create Group Input */}
								{isCreatingGroup && (
									<div className="bg-black/20 p-3 rounded-lg space-y-3 mb-4 border border-glass-stroke">
										<input
											autoFocus
											type="text"
											placeholder="Group Name"
											className="w-full bg-transparent border-b border-white/20 text-sm text-white focus:outline-none focus:border-accent-cyan pb-1"
											value={newGroupName}
											onChange={(e) =>
												setNewGroupName(e.target.value)
											}
										/>
										<input
											type="text"
											placeholder="Description (Optional)"
											className="w-full bg-transparent border-b border-white/10 text-xs text-gray-400 focus:outline-none focus:border-white/40 pb-1"
											value={newGroupDesc}
											onChange={(e) =>
												setNewGroupDesc(e.target.value)
											}
										/>
										<div className="flex justify-end gap-2">
											<button
												onClick={() =>
													setIsCreatingGroup(false)
												}
												className="text-xs text-gray-500 hover:text-white px-2 py-1"
											>
												Cancel
											</button>
											<button
												disabled={!newGroupName.trim()}
												onClick={() => {
													if (
														newGroupName.trim() &&
														onCreateGroup
													) {
														onCreateGroup(
															newGroupName.trim(),
															newGroupDesc
														);
														setIsCreatingGroup(
															false
														);
														setNewGroupName("");
														setNewGroupDesc("");
													}
												}}
												className={`text-xs px-3 py-1 rounded transition-colors ${
													!newGroupName.trim()
														? "bg-accent-cyan/5 text-accent-cyan/50 cursor-not-allowed"
														: "bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30"
												}`}
											>
												Create
											</button>
										</div>
									</div>
								)}

								{unassignedColors.length === 0 ? (
									<p className="text-gray-600 italic text-sm">
										No unassigned favorites.
									</p>
								) : (
									<div
										className={`grid gap-3 transition-all duration-300`}
										style={{
											gridTemplateColumns: `repeat(${density}, minmax(0, 1fr))`,
										}}
									>
										{unassignedColors.map(
											(
												c: PresetColor | string,
												idx: number
											) => {
												const colorItem = c;
												const hexValue =
													typeof colorItem ===
													"string"
														? colorItem
														: colorItem.value;
												const baseLabel =
													typeof colorItem ===
													"string"
														? hexValue.toUpperCase()
														: colorItem.name;
												const uniqueLabel =
													getUniqueLabel(
														baseLabel,
														nameRegistry
													);
												const colorObject: PresetColor =
													typeof colorItem ===
													"string"
														? {
																name: baseLabel,
																value: hexValue,
														  }
														: colorItem;

												return (
													<SmartColorCard
														key={`${hexValue}-${idx}`}
														color={hexValue}
														label={uniqueLabel}
														name={uniqueLabel}
														isFavorite={true}
														draggable={
															isEditingLibrary
														}
														onDragStart={(e) =>
															handleDragStart(
																e,
																hexValue,
																null
															)
														}
														onClick={() => {
															onLoadColor(
																hexValue
															);
															if (onInspectColor)
																onInspectColor(
																	colorObject
																);
														}}
														onToggleFavorite={() =>
															onRemoveColor(
																hexValue
															)
														}
													/>
												);
											}
										)}
									</div>
								)}
							</div>

							{/* Custom Groups */}
							{library.colorGroups?.map(
								(group: ColorGroup, index: number) => {
									const groupItems =
										groupColorsMap[group.id] || [];

									return (
										<div
											key={group.id}
											className={`space-y-4 transition-all ${
												group.isHidden
													? "opacity-50"
													: ""
											} ${
												isEditingLibrary
													? "bg-white/5 border border-white/10 border-dashed rounded-xl p-4"
													: "rounded-none p-0"
											}`}
											onDragOver={
												isEditingLibrary
													? handleDragOver
													: undefined
											}
											onDrop={
												isEditingLibrary
													? (e) =>
															handleDrop(
																e,
																group.id
															)
													: undefined
											}
										>
											<div className="group/header">
												<div className="flex items-center justify-between mb-1">
													<div className="flex items-start gap-2 flex-1 relative">
														{group.id ===
														editingGroupId ? (
															<>
																<div className="fixed inset-0 z-40 bg-transparent cursor-default" />
																<div className="relative z-50 flex flex-col gap-1 flex-1">
																	<input
																		autoFocus
																		type="text"
																		className="bg-black/20 text-white text-sm font-bold px-2 py-0.5 rounded border border-accent-cyan/50 focus:outline-none focus:border-accent-cyan w-full"
																		defaultValue={
																			group.name
																		}
																		placeholder="Group Name"
																		onKeyDown={(
																			e
																		) => {
																			if (
																				e.key ===
																				"Enter"
																			) {
																				e.preventDefault();
																				// Focus textarea
																				const next =
																					e.currentTarget.parentElement?.querySelector(
																						"textarea"
																					) as HTMLTextAreaElement;
																				if (
																					next
																				)
																					next.focus();
																			} else if (
																				e.key ===
																				"Escape"
																			) {
																				setEditingGroupId(
																					null
																				);
																			}
																		}}
																		onChange={(
																			e
																		) => {
																			setTempEditData(
																				(
																					prev
																				) => ({
																					name: e
																						.target
																						.value,
																					description:
																						prev?.description ||
																						"",
																				})
																			);
																		}}
																	/>
																	<textarea
																		className="w-full bg-black/20 text-xs text-gray-400 px-2 py-1 rounded border border-white/10 focus:outline-none focus:border-accent-cyan resize-none"
																		defaultValue={
																			group.description
																		}
																		placeholder="Description"
																		rows={2}
																		onKeyDown={(
																			e
																		) => {
																			if (
																				e.key ===
																					"Enter" &&
																				!e.shiftKey
																			) {
																				e.preventDefault();
																				// Save on Enter in textarea
																				if (
																					onUpdateGroup &&
																					tempEditData
																				) {
																					onUpdateGroup(
																						group.id,
																						tempEditData
																					);
																					setEditingGroupId(
																						null
																					);
																				}
																			} else if (
																				e.key ===
																				"Escape"
																			) {
																				setEditingGroupId(
																					null
																				);
																			}
																		}}
																		onChange={(
																			e
																		) => {
																			setTempEditData(
																				(
																					prev
																				) => ({
																					name:
																						prev?.name ||
																						"",
																					description:
																						e
																							.target
																							.value,
																				})
																			);
																		}}
																	/>
																</div>

																{/* Actions (Outside) */}
																<div className="relative z-50 flex flex-row items-center gap-1 pt-0.5">
																	<button
																		onClick={() =>
																			setEditingGroupId(
																				null
																			)
																		}
																		className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors backdrop-blur-sm"
																		title="Cancel"
																	>
																		<X
																			size={
																				12
																			}
																		/>
																	</button>
																	<button
																		onClick={() => {
																			if (
																				onUpdateGroup &&
																				tempEditData
																			) {
																				onUpdateGroup(
																					group.id,
																					tempEditData
																				);
																				setEditingGroupId(
																					null
																				);
																			}
																		}}
																		className="p-1.5 rounded-full bg-green-500/80 hover:bg-green-500 text-white transition-colors backdrop-blur-sm"
																		title="Save"
																	>
																		<Check
																			size={
																				12
																			}
																		/>
																	</button>
																</div>
															</>
														) : (
															// Display Mode
															<>
																{group.isHidden ? (
																	<EyeOff
																		size={
																			14
																		}
																		className="text-gray-600"
																	/>
																) : (
																	<FolderOpen
																		size={
																			14
																		}
																		className="text-accent-purple"
																	/>
																)}
																<div className="flex items-center gap-2">
																	<h3 className="text-sm font-bold text-white tracking-wide">
																		{
																			group.name
																		}
																	</h3>
																	<span className="text-xs text-gray-500 font-mono ml-1">
																		(
																		{
																			groupItems.length
																		}
																		)
																	</span>
																</div>
															</>
														)}
													</div>

													{/* Actions */}
													<div className="flex items-center gap-1 transition-opacity">
														{onReorderGroups && (
															<div className="flex items-center gap-1 mr-1">
																{index > 0 && (
																	<button
																		onClick={() => {
																			// Move Up - simplified using index
																			const newGroups =
																				[
																					...library.colorGroups,
																				];
																			[
																				newGroups[
																					index -
																						1
																				],
																				newGroups[
																					index
																				],
																			] =
																				[
																					newGroups[
																						index
																					],
																					newGroups[
																						index -
																							1
																					],
																				];
																			onReorderGroups(
																				newGroups
																			);
																		}}
																		className="text-gray-600 hover:text-white"
																		title="Move Up"
																	>
																		<ChevronUp
																			size={
																				14
																			}
																		/>
																	</button>
																)}
																{index <
																	library
																		.colorGroups
																		.length -
																		1 && (
																	<button
																		onClick={() => {
																			// Move Down - simplified using index
																			const newGroups =
																				[
																					...library.colorGroups,
																				];
																			[
																				newGroups[
																					index +
																						1
																				],
																				newGroups[
																					index
																				],
																			] =
																				[
																					newGroups[
																						index
																					],
																					newGroups[
																						index +
																							1
																					],
																				];
																			onReorderGroups(
																				newGroups
																			);
																		}}
																		className="text-gray-600 hover:text-white"
																		title="Move Down"
																	>
																		<ChevronDown
																			size={
																				14
																			}
																		/>
																	</button>
																)}
															</div>
														)}
														{onUpdateGroup && (
															<>
																<button
																	onClick={() =>
																		onUpdateGroup(
																			group.id,
																			{
																				isHidden:
																					!group.isHidden,
																			}
																		)
																	}
																	className="p-1.5 text-gray-500 hover:text-white"
																	title={
																		group.isHidden
																			? "Show Group"
																			: "Hide Group"
																	}
																>
																	{group.isHidden ? (
																		<Eye
																			size={
																				14
																			}
																		/>
																	) : (
																		<EyeOff
																			size={
																				14
																			}
																		/>
																	)}
																</button>
																<button
																	onClick={() => {
																		setEditingGroupId(
																			group.id
																		);
																		setTempEditData(
																			{
																				name: group.name,
																				description:
																					group.description,
																			}
																		);
																	}}
																	className="p-1.5 text-gray-500 hover:text-accent-cyan"
																	title="Rename Group"
																>
																	<Edit3
																		size={
																			14
																		}
																	/>
																</button>
															</>
														)}
														{onDeleteGroup && (
															<button
																onClick={() => {
																	if (
																		window.confirm(
																			"Are you sure you want to delete this group? Colors will be returned to your main library."
																		)
																	) {
																		onDeleteGroup(
																			group.id
																		);
																	}
																}}
																className="p-1.5 text-gray-500 hover:text-red-500"
																title="Delete Group (Colors return to Global)"
															>
																<Trash2
																	size={14}
																/>
															</button>
														)}
														{onRemoveColors && (
															<button
																onClick={() => {
																	if (
																		window.confirm(
																			"Are you sure you want to remove all these colors from your favorites?"
																		)
																	) {
																		onRemoveColors(
																			groupItems.map(
																				(
																					c:
																						| string
																						| PresetColor
																				) =>
																					typeof c ===
																					"string"
																						? {
																								name: c,
																								value: c,
																								id: c,
																						  }
																						: c
																			) as PresetColor[]
																		);
																	}
																}}
																className="p-1.5 text-gray-500 hover:text-red-400 group-btn-heart"
																title="Unfavorite All in Group"
															>
																<Heart
																	size={14}
																	className={
																		groupItems.length >
																		0
																			? "fill-red-500 text-red-500"
																			: ""
																	}
																/>
															</button>
														)}
													</div>
												</div>
												{editingGroupId !==
													group.id && (
													<p className="text-xs text-white/80 leading-relaxed border-b border-glass-stroke pb-2">
														{group.description ||
															"No description"}
													</p>
												)}
											</div>

											{!group.isHidden && (
												<div
													className={`grid gap-3 transition-all duration-300`}
													style={{
														gridTemplateColumns: `repeat(${density}, minmax(0, 1fr))`,
													}}
												>
													{groupItems.map(
														(
															colorItem:
																| string
																| PresetColor,
															idx: number
														) => {
															const hexValue =
																typeof colorItem ===
																"string"
																	? colorItem
																	: colorItem.value;
															const baseLabel =
																typeof colorItem ===
																"string"
																	? hexValue.toUpperCase()
																	: colorItem.name;
															const uniqueLabel =
																getUniqueLabel(
																	baseLabel,
																	nameRegistry
																);
															const colorObject: PresetColor =
																typeof colorItem ===
																"string"
																	? {
																			name: baseLabel,
																			value: hexValue,
																	  }
																	: colorItem;

															return (
																<SmartColorCard
																	key={`${hexValue}-${idx}`}
																	color={
																		hexValue
																	}
																	label={
																		uniqueLabel
																	}
																	name={
																		uniqueLabel
																	}
																	isFavorite={
																		true
																	}
																	onClick={() => {
																		onLoadColor(
																			hexValue
																		);
																		if (
																			onInspectColor
																		)
																			onInspectColor(
																				colorObject
																			);
																	}}
																	onToggleFavorite={() =>
																		onRemoveColor(
																			hexValue
																		)
																	}
																/>
															);
														}
													)}
												</div>
											)}
										</div>
									);
								}
							)}
						</div>
					)}

					{/* Colors: Presets View */}
					{view === "colors" && activeSubTab === "presets" && (
						<div className="space-y-8">
							{!PRESET_LIBRARIES ||
							PRESET_LIBRARIES.length === 0 ? (
								<p className="text-gray-500 italic">
									No preset libraries found.
								</p>
							) : (
								PRESET_LIBRARIES.map((preset) => {
									const isFullyFavorited =
										preset.colors.every((c) =>
											isFavorite(c.value)
										);

									return (
										<div
											key={preset.name}
											className="space-y-4"
										>
											<div className="space-y-1">
												<div className="flex items-center justify-between group/library">
													<div className="flex items-center gap-2">
														<Book
															size={14}
															className="text-accent-cyan"
														/>
														<h4 className="text-sm font-bold text-white tracking-wide">
															{preset.name}
														</h4>
														<span className="text-xs text-gray-500 font-mono ml-1">
															(
															{
																preset.colors
																	.length
															}
															)
														</span>
													</div>
													<div className="flex items-center gap-2">
														{onAddColors && (
															<button
																onClick={() =>
																	handleBulkFavorite(
																		preset.colors
																	)
																}
																className={`p-1.5 rounded-full transition-colors ${
																	isFullyFavorited
																		? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
																		: "text-gray-500 hover:text-red-400 hover:bg-white/10"
																}`}
																title={
																	isFullyFavorited
																		? "All saved to favorites"
																		: "Add all to favorites"
																}
															>
																<Heart
																	size={14}
																	className={
																		isFullyFavorited
																			? "fill-current"
																			: ""
																	}
																/>
															</button>
														)}
													</div>
												</div>
												<p className="text-xs text-white/80 leading-relaxed border-b border-glass-stroke pb-2">
													{preset.description}
												</p>
											</div>

											<div
												className={`grid gap-3 transition-all duration-300`}
												style={{
													gridTemplateColumns: `repeat(${density}, minmax(0, 1fr))`,
												}}
											>
												{preset.colors.map((c, idx) => {
													const uniqueLabel =
														getUniqueLabel(
															c.name,
															nameRegistry
														);
													return (
														<SmartColorCard
															key={`${c.value}-${idx}`}
															color={c.value}
															label={uniqueLabel}
															name={uniqueLabel}
															isFavorite={isFavorite(
																c.value
															)}
															onClick={() => {
																onLoadColor(
																	c.value
																);
																if (
																	onInspectColor
																)
																	onInspectColor(
																		c
																	);
															}}
															onToggleFavorite={() =>
																onRemoveColor(
																	c.value,
																	c
																)
															}
														/>
													);
												})}
											</div>
										</div>
									);
								})
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// --- Subcomponents ---

const SmartColorCard = ({
	color,
	label,
	name,
	isFavorite,
	onClick,
	onToggleFavorite,
	draggable,
	onDragStart,
}: {
	color: string;
	label: string;
	name?: string;
	isFavorite: boolean;
	onClick: () => void;
	onToggleFavorite: () => void;
	draggable?: boolean;
	onDragStart?: (e: React.DragEvent) => void;
}) => {
	const [copied, setCopied] = useState(false);
	const isDark = colord(color).isDark();

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		performCopy(color.toUpperCase());
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div
			className={`relative rounded-lg overflow-hidden h-14 shadow-sm transition-all hover:shadow-lg group/minicard ${
				isDark ? "border border-white/40" : "border border-black/20"
			} ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
			draggable={draggable}
			onDragStart={onDragStart}
		>
			{/* Interactive Color Body */}
			<div
				className="absolute inset-0 cursor-pointer flex"
				onClick={onClick}
				title={`Click to load ${name}`}
			>
				{/* Color Swatch (Full Background) */}
				<div
					className="absolute inset-0 z-0"
					style={{ backgroundColor: color }}
				/>

				{/* Content Overlay */}
				<div className="absolute inset-0 z-10 p-2">
					{/* Text Info (Bottom Left) */}
					<div className="absolute bottom-1 left-2 max-w-[calc(100%-40px)]">
						<span
							className={`text-[9px] font-bold uppercase tracking-wider block truncate ${
								isDark ? "text-white/90" : "text-black/80"
							}`}
						>
							{label}
						</span>
						<span
							className={`text-[8px] font-mono opacity-75 block mt-[-2px] ${
								isDark ? "text-white/80" : "text-black/70"
							}`}
						>
							{color.toUpperCase()}
						</span>
					</div>

					{/* Actions Row (Top Right) */}
					<div
						className={`absolute top-1 right-1 flex items-center gap-0.5 z-20 opacity-0 group-hover/minicard:opacity-100 transition-opacity ${
							isDark ? "text-white" : "text-black/60"
						}`}
					>
						<button
							onClick={handleCopy}
							className="p-1 rounded-full hover:bg-black/10 transition-colors"
							title="Copy Hex"
						>
							{copied ? (
								<Check size={10} className="text-green-500" />
							) : (
								<Copy size={10} />
							)}
						</button>

						{/* Favorite Toggle */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								onToggleFavorite();
							}}
							className={`p-1 rounded-full transition-colors ${
								isFavorite
									? "text-red-500 hover:bg-white/20"
									: "text-gray-400 hover:text-red-400 hover:bg-black/5"
							}`}
							title={
								isFavorite
									? "Remove from Favorites"
									: "Add to Favorites"
							}
						>
							<Heart
								size={10}
								className={isFavorite ? "fill-current" : ""}
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
