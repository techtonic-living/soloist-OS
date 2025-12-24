import { useState, useMemo, useEffect, useRef } from "react";
import {
	Heart,
	Book,
	Pin,
	Eye,
	EyeOff,
	Copy,
	ChevronUp,
	ChevronDown,
	FolderPlus,
	Pencil,
	ChevronsUp,
	ChevronsDown,
	Globe,
	FolderOpen,
	ArrowRightLeft,
	X,
	ArrowRight,
	Check,
	Edit3,
	Trash2,
} from "lucide-react";
import { PRESET_LIBRARIES, PresetColor } from "../../data/colorPresets";
import { colord } from "colord";
import { ColorGroup, UiPreferences } from "../../hooks/useSoloistSystem";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { HeartToggle } from "../common/HeartToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useCopyFeedback } from "../../hooks/useCopyFeedback";
import { useToast } from "../../context/ToastContext";
import { ToggleFavoriteResult } from "../../utils/favorites";
import {
	createOrganizeDragGhost,
	positionOrganizeDragGhost,
	setOrganizeDragCursorActive,
} from "../../utils/organizeDnD";
import { PopoverMenu } from "../common/PopoverMenu";

// --- Helper Functions ---
// Ensure labels are unique within a render pass (case-insensitive)
// Instead of "Teal (2)", pick a playful variant for duplicates.
// --- Helper Functions ---
// (No longer needed: Unique naming is handled at save time in utils/favorites.ts)

interface ColorLibraryProps {
	library: any;
	onLoadColor: (c: string) => void;
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
	onReorderColors?: (newColors: (string | PresetColor)[]) => void;
	onToggleFavorite: (
		color: string,
		metadata?: PresetColor
	) => Promise<ToggleFavoriteResult | void | null>;
	uiPreferences?: UiPreferences;
	onUpdateUiPreferences?: (prefs: Partial<UiPreferences>) => void;
	view?: "all" | "colors" | "palettes";
}

export const ColorLibrary = ({
	library,
	onLoadColor,
	onRemovePalette,
	onInspectColor,
	onToggleFavorite,
	onAddColors,
	onRemoveColors,
	onCreateGroup,
	onUpdateGroup,
	onDeleteGroup,
	onMoveColor,
	onReorderGroups,
	onReorderColors,
	uiPreferences,
	onUpdateUiPreferences,
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

	// Move Color State
	const [colorToMove, setColorToMove] = useState<{
		value: string;
		groupId: string | null;
	} | null>(null);

	// Sort State
	type SortOption = "custom" | "name" | "sat-asc" | "shade-asc";
	const [sortOption, setSortOption] = useState<SortOption>("custom");
	const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
	const sortButtonRef = useRef<HTMLButtonElement | null>(null);

	const getColorSaturation = (c: string | PresetColor) => {
		const hex = typeof c === "string" ? c : c.value;
		const parsed = colord(hex);
		if (!parsed.isValid()) return 0;
		return parsed.toHsl().s;
	};

	// "Shade" for our purposes = HSL lightness (0..1)
	// Sort SHADE (D-B) as low->high lightness.
	const getColorShade = (c: string | PresetColor) => {
		const hex = typeof c === "string" ? c : c.value;
		const parsed = colord(hex);
		if (!parsed.isValid()) return 0;
		return parsed.toHsl().l;
	};

	// Confirmation Modal State
	const [confirmState, setConfirmState] = useState<{
		isOpen: boolean;
		title: string;
		message: React.ReactNode;
		onConfirm: () => void;
		variant?: "danger" | "info" | "warning";
		confirmLabel?: string;
	}>({
		isOpen: false,
		title: "",
		message: null,
		onConfirm: () => {},
		variant: undefined,
		confirmLabel: undefined,
	});

	const closeConfirm = () =>
		setConfirmState((prev) => ({ ...prev, isOpen: false }));

	// Edit Mode State
	const [isEditingLibrary, setIsEditingLibrary] = useState(false);
	// Presets "Custom" mode (hide/reorder built-in libraries + individual preset colors)
	const [isEditingPresets, setIsEditingPresets] = useState(false);

	// Anchor Global State
	const [isGlobalAnchored, setIsGlobalAnchored] = useState(false);
	const [isAtScrollTop, setIsAtScrollTop] = useState(true);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const handleScroll = () => {
		if (scrollContainerRef.current) {
			// Check if scroll is at top (allow small buffer of 2px)
			setIsAtScrollTop(scrollContainerRef.current.scrollTop <= 2);
		}
	};

	// Pointer-based organize drag (replaces native HTML5 drag so cursor can stay grabbing)
	const canReorderInCurrentSort = sortOption === "custom";
	const isPointerOrganizeEnabled = isEditingLibrary;
	const isPointerDraggingRef = useRef(false);
	const pointerDragRef = useRef<{
		pointerId: number | null;
		sourceHex: string;
		sourceGroupId: string | null;
		displayName: string;
		started: boolean;
		startX: number;
		startY: number;
		offsetX: number;
		offsetY: number;
		ghostEl: HTMLDivElement | null;
		activeTargetEl: HTMLElement | null;
		target: {
			groupId: string | null;
			id?: string;
			isDropzone?: boolean;
		} | null;
	} | null>(null);

	const clearActiveTarget = () => {
		const st = pointerDragRef.current;
		if (!st?.activeTargetEl) return;
		st.activeTargetEl.classList.remove("organize-drop-target-active");
		st.activeTargetEl = null;
	};

	const endPointerDrag = () => {
		const st = pointerDragRef.current;
		if (!st) return;

		clearActiveTarget();

		if (st.ghostEl) {
			st.ghostEl.remove();
			st.ghostEl = null;
		}

		setOrganizeDragCursorActive(false);

		// Drop action
		if (st.started && st.target) {
			const targetGroupId = st.target.groupId;

			// Same collection => reorder (Custom only)
			if (targetGroupId === st.sourceGroupId) {
				if (!canReorderInCurrentSort) {
					// Move-only mode: same-group drops are a no-op.
					pointerDragRef.current = null;
					globalThis.setTimeout(() => {
						isPointerDraggingRef.current = false;
					}, 0);
					return;
				}

				// Global reorder
				if (targetGroupId === null && onReorderColors) {
					const allColors = [...(library.colors || [])];
					const sourceIdx = allColors.findIndex(
						(c: string | PresetColor) => {
							const v = typeof c === "string" ? c : c.value;
							return (
								v.toUpperCase() === st.sourceHex.toUpperCase()
							);
						}
					);

					const targetId = st.target.id;
					const targetIdx =
						targetId !== undefined
							? allColors.findIndex((c: string | PresetColor) => {
									const v =
										typeof c === "string" ? c : c.value;
									return (
										v.toUpperCase() ===
										targetId.toUpperCase()
									);
							  })
							: allColors.length - 1;

					if (
						sourceIdx !== -1 &&
						targetIdx !== -1 &&
						sourceIdx !== targetIdx
					) {
						const [moved] = allColors.splice(sourceIdx, 1);
						allColors.splice(targetIdx, 0, moved);
						onReorderColors(allColors);
					}
				}

				// Group reorder
				if (targetGroupId !== null && onUpdateGroup) {
					const group = (
						library.colorGroups as ColorGroup[] | undefined
					)?.find((g) => g.id === targetGroupId);
					const ids = [...(group?.colorIds || [])];
					const sourceIndex = ids.findIndex(
						(cid) =>
							cid.toUpperCase() === st.sourceHex.toUpperCase()
					);

					const targetId = st.target.id;
					const targetIndex =
						targetId !== undefined
							? ids.findIndex(
									(cid) =>
										cid.toUpperCase() ===
										targetId.toUpperCase()
							  )
							: ids.length - 1;

					if (
						sourceIndex !== -1 &&
						targetIndex !== -1 &&
						sourceIndex !== targetIndex
					) {
						const [moved] = ids.splice(sourceIndex, 1);
						ids.splice(targetIndex, 0, moved);
						onUpdateGroup(targetGroupId, { colorIds: ids });
					}
				}
			} else {
				// Cross-group move
				if (onMoveColor) {
					onMoveColor(st.sourceHex, targetGroupId);
				}
			}
		}

		pointerDragRef.current = null;
		globalThis.setTimeout(() => {
			isPointerDraggingRef.current = false;
		}, 0);
	};

	const startPointerOrganizeDrag = (
		e: React.PointerEvent,
		hexValue: string,
		sourceGroupId: string | null,
		displayName: string
	) => {
		if (!isPointerOrganizeEnabled) return;
		if (e.button !== 0) return;

		const target = e.target as HTMLElement | null;
		if (
			target?.closest?.(
				"button, a, input, textarea, select, [role='button']"
			)
		) {
			return;
		}

		// Prevent text selection / native gestures while we begin an organize drag.
		e.preventDefault();

		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();

		// Capture pointer so we keep getting move/up events even if pointer leaves the card.
		el.setPointerCapture(e.pointerId);

		pointerDragRef.current = {
			pointerId: e.pointerId,
			sourceHex: hexValue,
			sourceGroupId,
			displayName,
			started: false,
			startX: e.clientX,
			startY: e.clientY,
			offsetX: rect.width / 2,
			offsetY: rect.height / 2,
			ghostEl: null,
			activeTargetEl: null,
			target: null,
		};

		const onMove = (ev: PointerEvent) => {
			const st = pointerDragRef.current;
			if (!st || st.pointerId !== ev.pointerId) return;

			const dx = ev.clientX - st.startX;
			const dy = ev.clientY - st.startY;
			const dist = Math.hypot(dx, dy);

			if (!st.started && dist > 4) {
				st.started = true;
				isPointerDraggingRef.current = true;
				setOrganizeDragCursorActive(true);

				const width = Math.max(120, Math.ceil(rect.width || 220));
				const height = Math.max(56, Math.ceil(rect.height || 56));
				const ghost = createOrganizeDragGhost(
					{
						kind: "color",
						title: st.displayName || st.sourceHex.toUpperCase(),
						color: st.sourceHex,
					},
					width,
					height
				);
				ghost.style.zIndex = "2147483647";
				document.body.appendChild(ghost);
				st.ghostEl = ghost;
			}

			if (st.started) {
				if (st.ghostEl) {
					positionOrganizeDragGhost(
						st.ghostEl,
						ev.clientX,
						ev.clientY,
						st.offsetX,
						st.offsetY
					);
				}

				const under = document.elementFromPoint(
					ev.clientX,
					ev.clientY
				) as HTMLElement | null;
				const targetSelector = canReorderInCurrentSort
					? "[data-organize-drop='1'], [data-organize-dropzone='1']"
					: "[data-organize-dropzone='1']";
				const targetEl = (under?.closest?.(targetSelector) ||
					null) as HTMLElement | null;

				if (targetEl !== st.activeTargetEl) {
					clearActiveTarget();
					st.activeTargetEl = targetEl;
					if (targetEl) {
						targetEl.classList.add("organize-drop-target-active");
					}
				}

				if (targetEl) {
					const groupRaw = targetEl.dataset.organizeGroup;
					const groupId =
						groupRaw === undefined || groupRaw === "null"
							? null
							: groupRaw;
					const id = targetEl.dataset.organizeId;
					const isDropzone =
						targetEl.dataset.organizeDropzone === "1";
					st.target = {
						groupId,
						id: id && id.length > 0 ? id : undefined,
						isDropzone,
					};
				} else {
					st.target = null;
				}
			}
		};

		const onUpOrCancel = (ev: PointerEvent) => {
			const st = pointerDragRef.current;
			if (!st || st.pointerId !== ev.pointerId) return;
			globalThis.removeEventListener("pointermove", onMove);
			globalThis.removeEventListener("pointerup", onUpOrCancel);
			globalThis.removeEventListener("pointercancel", onUpOrCancel);
			endPointerDrag();
		};

		globalThis.addEventListener("pointermove", onMove);
		globalThis.addEventListener("pointerup", onUpOrCancel);
		globalThis.addEventListener("pointercancel", onUpOrCancel);
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
		// Map group ID to list of actual color objects, PRESERVING ORDER of colorIds
		const groupMap: Record<string, (string | PresetColor)[]> = {};
		groups.forEach((g) => {
			const groupColors = g.colorIds
				.map((cid) => {
					// Find the color object in the main library
					return colors.find((c: string | PresetColor) => {
						const hex = typeof c === "string" ? c : c.value;
						return hex.toUpperCase() === cid.toUpperCase();
					});
				})
				.filter(Boolean) as (string | PresetColor)[]; // Remove any not found (e.g. deleted global colors)

			groupMap[g.id] = groupColors;
		});

		// Apply Sorting
		const sortColors = (
			list: (string | PresetColor)[]
		): (string | PresetColor)[] => {
			const byName = (
				a: string | PresetColor,
				b: string | PresetColor
			) => {
				const nameA = typeof a === "string" ? a : a.name;
				const nameB = typeof b === "string" ? b : b.name;
				return nameA.localeCompare(nameB);
			};

			if (sortOption === "name") {
				return [...list].sort(byName);
			} else if (sortOption === "sat-asc") {
				return [...list].sort((a, b) => {
					const d = getColorSaturation(a) - getColorSaturation(b);
					return d !== 0 ? d : byName(a, b);
				});
			} else if (sortOption === "shade-asc") {
				return [...list].sort((a, b) => {
					const d = getColorShade(a) - getColorShade(b);
					return d !== 0 ? d : byName(a, b);
				});
			}
			return list;
		};

		// Sort Groups Internal Colors
		Object.keys(groupMap).forEach((gid) => {
			groupMap[gid] = sortColors(groupMap[gid]);
		});

		return {
			unassignedColors: sortColors(unassigned),
			groupColorsMap: groupMap,
		};
	}, [library.colors, library.colorGroups, sortOption]);

	const [activeSubTab, setActiveSubTab] = useState<"favorites" | "presets">(
		"favorites"
	);

	// Organize mode only applies to Favorites.
	useEffect(() => {
		if (activeSubTab !== "favorites" && isEditingLibrary) {
			setIsEditingLibrary(false);
		}
	}, [activeSubTab, isEditingLibrary]);

	// Presets customization only applies when viewing Presets AND sort is Custom.
	useEffect(() => {
		if (activeSubTab !== "presets" && isEditingPresets) {
			setIsEditingPresets(false);
			return;
		}
		if (
			activeSubTab === "presets" &&
			sortOption !== "custom" &&
			isEditingPresets
		) {
			setIsEditingPresets(false);
		}
	}, [activeSubTab, sortOption, isEditingPresets]);

	// Close sort menu when switching tabs
	useEffect(() => {
		setIsSortMenuOpen(false);
	}, [activeSubTab]);

	// Outside-click / Escape handling lives in PopoverMenu.

	// Toggling favorite checks if it exists in the library prop
	const isFavorite = (color: string) => {
		// Case insensitive check
		if (!library?.colors) return false;
		return library.colors.some((c: string | PresetColor) => {
			const hexValue = typeof c === "string" ? c : c.value;
			return hexValue.toUpperCase() === color.toUpperCase();
		});
	};

	// Toast
	const toast = useToast();

	// Grid Density State (Columns)
	const [density, setDensity] = useState(2);

	// Sync Density with Preferences
	useEffect(() => {
		if (uiPreferences?.colorGridDensity) {
			const savedDensity =
				activeSubTab === "favorites"
					? uiPreferences.colorGridDensity.favorites
					: uiPreferences.colorGridDensity.presets;

			if (savedDensity) {
				setDensity(savedDensity);
			}
		}
	}, [activeSubTab, uiPreferences]);

	const commitDensityChange = (newDensity: number) => {
		if (onUpdateUiPreferences && uiPreferences) {
			onUpdateUiPreferences({
				colorGridDensity: {
					...uiPreferences.colorGridDensity,
					[activeSubTab]: newDensity,
				},
			});
		}
	};

	// --- Preset Libraries customization (Presets tab, Custom sort) ---
	const colorPresetCustom = uiPreferences?.colorPresetCustom || {};

	const updateColorPresetCustom = (
		updates: NonNullable<UiPreferences["colorPresetCustom"]>
	) => {
		if (!onUpdateUiPreferences) return;
		onUpdateUiPreferences({
			colorPresetCustom: {
				...uiPreferences?.colorPresetCustom,
				...updates,
			},
		});
	};

	const normalizeOrder = (base: string[], preferred?: string[]) => {
		const baseSet = new Set(base);
		const safePreferred = (preferred || []).filter((x) => baseSet.has(x));
		const seen = new Set<string>();
		const result: string[] = [];
		for (const x of safePreferred) {
			if (seen.has(x)) continue;
			seen.add(x);
			result.push(x);
		}
		for (const x of base) {
			if (!seen.has(x)) result.push(x);
		}
		return result;
	};

	// Map density value to Tailwind grid column classes to avoid inline styles
	const densityClasses = [
		"grid-cols-1",
		"grid-cols-2",
		"grid-cols-3",
		"grid-cols-4",
		"grid-cols-5",
		"grid-cols-6",
	];
	const densityClass = densityClasses[Math.max(1, Math.min(6, density)) - 1];

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

					{/* Right-side Controls (match Palette Library layout) */}
					<div className="flex items-center gap-4">
						{/* Sort + Organize group */}
						<div className="flex items-center gap-2 pb-2 border-l border-white/10 pl-4 ml-2">
							{/* Organize (always visible; disabled in Presets unless sort is Custom) */}
							<div className="flex items-center py-1">
								{(() => {
									// No longer disabled if not custom sort
									const isDisabled = false;

									const isActive =
										activeSubTab === "favorites"
											? isEditingLibrary
											: isEditingPresets;

									const isCustomSort =
										sortOption === "custom";

									const label =
										activeSubTab === "favorites"
											? isEditingLibrary
												? "Done Organizing"
												: isCustomSort
												? "Organize Colors and Groups"
												: "Organize Colors and Groups (Move only)"
											: isEditingPresets
											? "Done Customizing"
											: isCustomSort
											? "Customize Libraries"
											: "Switch to Custom Order to Organize";

									return (
										<button
											disabled={isDisabled}
											onClick={() => {
												if (isDisabled) return;

												// If not custom sort, switch to custom sort first
												if (!isCustomSort) {
													setSortOption("custom");
													return;
												}

												if (
													activeSubTab === "favorites"
												) {
													setIsEditingLibrary(
														(v) => !v
													);
												} else {
													setIsEditingPresets(
														(v) => !v
													);
												}
											}}
											className={`p-1.5 rounded-full transition-all ${
												isActive
													? "text-accent-cyan bg-accent-cyan/10 ring-1 ring-accent-cyan/30"
													: isDisabled
													? "text-gray-600 opacity-40 cursor-default"
													: "text-gray-500 hover:text-white hover:bg-white/10"
											}`}
											title={label}
											aria-label={label}
										>
											{isCustomSort ? (
												<ArrowRightLeft size={14} />
											) : (
												<Pencil size={14} />
											)}
										</button>
									);
								})()}
							</div>

							<span className="text-[10px] text-gray-500 font-mono uppercase">
								Sort
							</span>
							<div className="relative">
								<button
									type="button"
									ref={sortButtonRef}
									onClick={() => setIsSortMenuOpen((v) => !v)}
									className="w-28 appearance-none bg-black/20 border border-white/10 rounded px-2 py-0.5 text-[10px] text-gray-300 font-mono uppercase focus:outline-none focus:border-accent-cyan cursor-pointer pr-6 hover:bg-white/5 transition-colors flex items-center gap-2"
									aria-label="Sort order"
									aria-haspopup="menu"
								>
									{sortOption === "custom"
										? "Custom"
										: sortOption === "sat-asc"
										? "SAT (L-H)"
										: sortOption === "shade-asc"
										? "SHADE (D-B)"
										: "Name (A-Z)"}
								</button>

								<PopoverMenu
									open={isSortMenuOpen}
									anchorRef={sortButtonRef}
									onClose={() => setIsSortMenuOpen(false)}
									align="end"
									className="bg-bg-raised/95 border border-glass-stroke rounded-xl shadow-monolith z-[200] min-w-[220px] py-1 overflow-hidden backdrop-blur-xl"
								>
									<button
										type="button"
										onClick={() => {
											setSortOption("custom");
											setIsSortMenuOpen(false);
										}}
										className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 cursor-pointer transition-colors"
									>
										Custom
									</button>
									<button
										type="button"
										onClick={() => {
											setSortOption("name");
											setIsSortMenuOpen(false);
										}}
										className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 cursor-pointer transition-colors"
									>
										Name (A-Z)
									</button>
									<button
										type="button"
										onClick={() => {
											setSortOption("sat-asc");
											setIsSortMenuOpen(false);
										}}
										className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 cursor-pointer transition-colors"
									>
										SAT (L-H)
									</button>
									<button
										type="button"
										onClick={() => {
											setSortOption("shade-asc");
											setIsSortMenuOpen(false);
										}}
										className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 cursor-pointer transition-colors"
									>
										SHADE (D-B)
									</button>
								</PopoverMenu>

								<div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
									<svg
										width="8"
										height="8"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path d="M6 9l6 6 6-6" />
									</svg>
								</div>
							</div>
						</div>

						{/* Density Slider */}
						<div className="flex items-center gap-2 pb-2">
							<span className="text-[10px] text-gray-500 font-mono uppercase">
								View
							</span>
							<label htmlFor="view-density" className="sr-only">
								View density
							</label>
							<input
								id="view-density"
								type="range"
								min="1"
								max="6"
								step="1"
								value={density}
								onChange={(e) =>
									setDensity(Number.parseInt(e.target.value))
								}
								onMouseUp={(e) =>
									commitDensityChange(
										Number.parseInt(e.currentTarget.value)
									)
								}
								onTouchEnd={(e) =>
									commitDensityChange(
										Number.parseInt(e.currentTarget.value)
									)
								}
								aria-label="View density"
								className="w-20 accent-accent-cyan h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
							/>
						</div>
					</div>
				</div>
			)}

			<div
				ref={scrollContainerRef}
				onScroll={handleScroll}
				className="flex-1 overflow-y-auto overflow-x-hidden pr-2 pb-20 custom-scrollbar"
				style={{ scrollbarGutter: "stable" }}
			>
				<div className="space-y-12">
					<AnimatePresence mode="wait">
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
																onRemovePalette(
																	i
																)
															}
															className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
															title="Delete Palette"
															aria-label="Delete Palette"
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
																>
																	<svg className="w-full h-full">
																		<rect
																			x="0"
																			y="0"
																			width="100%"
																			height="100%"
																			fill={
																				c
																			}
																		/>
																	</svg>
																</div>
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
							<motion.div
								key="favorites-list"
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 10 }}
								className="space-y-8"
							>
								{/* My Favorites (Unassigned) */}
								<div
									className={`space-y-4 transition-all duration-300 ${
										isGlobalAnchored
											? "-mx-4 px-4 pt-4 pb-4 border-b sticky top-0 z-20 bg-bg-void border-glass-stroke shadow-2xl rounded-none"
											: isEditingLibrary
											? "p-4 bg-accent-cyan/5 border border-accent-cyan/30 border-dashed rounded-xl relative overflow-hidden mx-0"
											: "-mx-4 px-4 pt-4 pb-4 border-b border-transparent rounded-none"
									}`}
									data-organize-dropzone={
										isPointerOrganizeEnabled
											? "1"
											: undefined
									}
									data-organize-group={
										isPointerOrganizeEnabled
											? "null"
											: undefined
									}
								>
									{/* Blueprint Pattern Background (Edit Mode) */}
									{isEditingLibrary && (
										<div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-blueprint-grid" />
									)}

									<div className="space-y-1 relative z-10">
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
												{/* Anchor Toggle */}
												<button
													onClick={() =>
														setIsGlobalAnchored(
															!isGlobalAnchored
														)
													}
													disabled={!isAtScrollTop}
													className={`p-1.5 rounded-full transition-colors ${
														isGlobalAnchored
															? "text-accent-cyan bg-accent-cyan/10"
															: "text-gray-500 hover:text-white"
													} ${
														!isAtScrollTop
															? "opacity-20 cursor-default"
															: ""
													}`}
													title={
														isGlobalAnchored
															? "Unpin Global Section"
															: "Pin Global Section to Top"
													}
												>
													<Pin
														size={14}
														className={
															isGlobalAnchored
																? "fill-current"
																: ""
														}
													/>
												</button>
												{onCreateGroup && (
													<button
														onClick={() =>
															setIsCreatingGroup(
																true
															)
														}
														className="p-1.5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
														title="Create New Group"
													>
														<FolderPlus size={14} />
													</button>
												)}
												{onRemoveColors && (
													<button
														disabled={
															unassignedColors.length ===
															0
														}
														onClick={() => {
															if (
																unassignedColors.length ===
																0
															)
																return;
															setConfirmState({
																isOpen: true,
																title: "Remove Global Favorites",
																message: (
																	<span className="text-gray-300">
																		Are you
																		sure you
																		want to
																		remove
																		all
																		colors
																		saved to
																		Global
																		from
																		Favorites?
																	</span>
																),
																onConfirm:
																	() => {
																		if (
																			onRemoveColors
																		) {
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
																			);
																		}
																		closeConfirm();
																	},
															});
														}}
														className={`p-1.5 rounded-full transition-colors ${
															unassignedColors.length ===
															0
																? "text-gray-600 opacity-40 cursor-default"
																: "hover:bg-white/10 text-red-500 hover:text-red-400"
														}`}
														title={
															unassignedColors.length ===
															0
																? "No colors to remove"
																: "Unfavorite All in Global"
														}
													>
														<Heart
															size={14}
															className={
																unassignedColors.length ===
																0
																	? ""
																	: "fill-current"
															}
														/>
													</button>
												)}
											</div>
										</div>
										<p className="text-xs text-white/80 leading-relaxed border-b border-glass-stroke pb-2">
											Colors saved here will always be
											active and accessible.
										</p>
									</div>

									{/* Create Group Input */}
									{isCreatingGroup &&
										(() => {
											const isDuplicate = (
												(library.colorGroups as ColorGroup[]) ||
												[]
											).some(
												(g) =>
													g.name
														.trim()
														.toLowerCase() ===
													newGroupName
														.trim()
														.toLowerCase()
											);
											const isValid =
												newGroupName.trim().length >
													0 && !isDuplicate;

											const handleCreate = () => {
												if (isValid && onCreateGroup) {
													onCreateGroup(
														newGroupName.trim(),
														newGroupDesc
													);
													setIsCreatingGroup(false);
													setNewGroupName("");
													setNewGroupDesc("");
													setIsEditingLibrary(true);
												}
											};

											const handleKeyDown = (
												e: React.KeyboardEvent
											) => {
												if (e.key === "Enter") {
													e.preventDefault();
													handleCreate();
												} else if (e.key === "Escape") {
													e.preventDefault();
													setIsCreatingGroup(false);
													setNewGroupName("");
													setNewGroupDesc("");
												}
											};

											return (
												<div className="bg-black/20 p-3 rounded-lg space-y-3 mb-4 border border-glass-stroke">
													<div className="space-y-1">
														<input
															autoFocus
															type="text"
															placeholder="Group Name"
															className={`w-full bg-black/20 border text-sm text-white font-sans px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
																isDuplicate
																	? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
																	: "border-white/10 focus:border-accent-cyan focus:ring-accent-cyan/20"
															}`}
															value={newGroupName}
															onChange={(e) =>
																setNewGroupName(
																	e.target
																		.value
																)
															}
															onKeyDown={
																handleKeyDown
															}
														/>
														{isDuplicate && (
															<p className="text-[10px] text-red-400 font-medium">
																Group name must
																be unique.
															</p>
														)}
													</div>
													<input
														type="text"
														placeholder="Description (Optional)"
														className="w-full bg-black/20 border border-white/10 text-xs text-gray-400 font-sans px-3 py-2 rounded-lg focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-colors"
														value={newGroupDesc}
														onChange={(e) =>
															setNewGroupDesc(
																e.target.value
															)
														}
														onKeyDown={
															handleKeyDown
														}
													/>
													<div className="flex justify-end gap-2">
														<button
															onClick={() => {
																setIsCreatingGroup(
																	false
																);
																setNewGroupName(
																	""
																);
																setNewGroupDesc(
																	""
																);
															}}
															className="text-xs text-gray-500 hover:text-white px-2 py-1"
														>
															Cancel
														</button>
														<button
															disabled={!isValid}
															onClick={
																handleCreate
															}
															className={`text-xs px-3 py-1 rounded transition-colors ${
																!isValid
																	? "bg-accent-cyan/5 text-accent-cyan/50 cursor-default"
																	: "bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30"
															}`}
														>
															Create
														</button>
													</div>
												</div>
											);
										})()}

									{unassignedColors.length === 0 ? (
										isEditingLibrary ? (
											<div
												className="border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 gap-2 bg-black/5 relative z-10 transition-colors hover:border-accent-cyan/30 hover:text-accent-cyan/70"
												data-organize-dropzone={
													isPointerOrganizeEnabled
														? "1"
														: undefined
												}
												data-organize-group={
													isPointerOrganizeEnabled
														? "null"
														: undefined
												}
											>
												<Globe
													size={24}
													className="opacity-50"
												/>
												<span className="text-xs font-mono uppercase tracking-wider">
													Drop Colors Here
												</span>
											</div>
										) : (
											<p className="text-gray-600 text-xs italic">
												No global favorites.
											</p>
										)
									) : (
										<div
											className={`grid gap-3 transition-all duration-300 relative z-10 ${densityClass}`}
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
													const finalName =
														typeof colorItem ===
														"string"
															? "Custom Color"
															: colorItem.name;
													return (
														<SmartColorCard
															key={`${hexValue}-${idx}`}
															color={hexValue}
															label={finalName}
															name={finalName}
															isFavorite={true}
															draggable={
																isPointerOrganizeEnabled
															}
															usePointerDnD={
																isPointerOrganizeEnabled
															}
															organizeDnd={{
																groupId: null,
																id: hexValue,
															}}
															onPointerDown={
																isPointerOrganizeEnabled
																	? (e) =>
																			startPointerOrganizeDrag(
																				e,
																				hexValue,
																				null,
																				finalName
																			)
																	: undefined
															}
															onClickCapture={(
																e
															) => {
																if (
																	isPointerDraggingRef.current
																) {
																	e.preventDefault();
																	e.stopPropagation();
																}
															}}
															onMoveRequest={() =>
																setColorToMove({
																	value: hexValue,
																	groupId:
																		null,
																})
															}
															onClick={() => {
																onLoadColor(
																	hexValue
																);

																// Use stored name directly

																if (
																	onInspectColor
																)
																	onInspectColor(
																		typeof c ===
																			"string"
																			? {
																					name: finalName,
																					value: hexValue,
																			  }
																			: c
																	);
															}}
															onToggleFavorite={async () => {
																const res =
																	await onToggleFavorite(
																		hexValue,
																		{
																			name: finalName,
																			value: hexValue,
																		}
																	);
																if (
																	res &&
																	res.action ===
																		"removed"
																) {
																	toast.standard(
																		<>
																			Removed{" "}
																			<span className="text-accent-cyan">
																				{
																					finalName
																				}
																			</span>{" "}
																			from
																			favorites
																		</>
																	);
																} else if (
																	res &&
																	res.action ===
																		"added" &&
																	(
																		res.color as PresetColor
																	)
																		.isAutoRenamed
																) {
																	toast.standard(
																		<>
																			Saved
																			as{" "}
																			<span className="text-accent-cyan">
																				{
																					(
																						res.color as PresetColor
																					)
																						.name
																				}
																			</span>
																		</>
																	);
																}
															}}
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
												className={`space-y-4 transition-all duration-300 ${
													group.isHidden
														? "opacity-50"
														: ""
												} ${
													isEditingLibrary
														? "bg-accent-cyan/5 border border-accent-cyan/30 border-dashed rounded-xl p-4 relative overflow-hidden"
														: "rounded-none p-0"
												}`}
												data-organize-dropzone={
													isPointerOrganizeEnabled
														? "1"
														: undefined
												}
												data-organize-group={
													isPointerOrganizeEnabled
														? group.id
														: undefined
												}
											>
												{/* Blueprint Pattern Background (Edit Mode) */}
												{isEditingLibrary && (
													<div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-blueprint-grid" />
												)}

												<div className="group/header relative z-10">
													<div className="flex items-center justify-between mb-1">
														<div className="flex items-center gap-2 flex-1 relative">
															{group.id ===
															editingGroupId ? (
																(() => {
																	// Validation Logic
																	const currentName =
																		tempEditData?.name ??
																		group.name;
																	const isDuplicate =
																		(
																			(library.colorGroups as ColorGroup[]) ||
																			[]
																		).some(
																			(
																				g
																			) =>
																				g.id !==
																					group.id &&
																				g.name
																					.trim()
																					.toLowerCase() ===
																					currentName
																						.trim()
																						.toLowerCase()
																		);
																	const isValid =
																		currentName.trim()
																			.length >
																			0 &&
																		!isDuplicate;

																	return (
																		<>
																			<div className="fixed inset-0 z-40 bg-transparent cursor-default" />
																			<div className="relative z-50 flex flex-row items-start gap-2 flex-1 w-full">
																				<div className="flex flex-col gap-1 flex-1 min-w-0">
																					<div className="relative">
																						<input
																							autoFocus
																							type="text"
																							className={`bg-black/40 text-white text-sm font-brand font-bold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 w-full shadow-lg transition-colors ${
																								isDuplicate
																									? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
																									: "border-white/20 focus:border-accent-cyan focus:ring-accent-cyan/20"
																							}`}
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
																									if (
																										isValid &&
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
																						{!isValid && (
																							<div className="absolute top-full left-0 mt-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded shadow-lg z-[60]">
																								{currentName.trim()
																									.length ===
																								0
																									? "Name is required."
																									: "Group name must be unique."}
																							</div>
																						)}
																					</div>
																					<textarea
																						className="w-full bg-black/20 text-xs text-gray-400 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 resize-none shadow-inner font-sans leading-relaxed"
																						defaultValue={
																							group.description
																						}
																						placeholder="Add a description..."
																						rows={
																							2
																						}
																						onKeyDown={(
																							e
																						) => {
																							if (
																								e.key ===
																									"Enter" &&
																								!e.shiftKey
																							) {
																								e.preventDefault();
																								if (
																									isValid &&
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
																				<div className="flex flex-row items-center gap-1 shrink-0 pt-0.5">
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
																						disabled={
																							!isValid
																						}
																						onClick={() => {
																							if (
																								isValid &&
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
																						className={`p-1.5 rounded-full text-white transition-colors backdrop-blur-sm ${
																							!isValid
																								? "bg-gray-500 opacity-50"
																								: "bg-green-500/80 hover:bg-green-500"
																						}`}
																						title={
																							!isValid
																								? isDuplicate
																									? "Group Name Must Be Unique"
																									: "Name Cannot Be Empty"
																								: "Save"
																						}
																					>
																						<Check
																							size={
																								12
																							}
																						/>
																					</button>
																				</div>
																			</div>

																			{/* Actions (Outside) */}
																			{/* Actions Moved Inline */}
																		</>
																	);
																})()
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
															{isEditingLibrary &&
																onReorderGroups && (
																	<div className="flex items-center gap-1 border-r border-glass-stroke mr-1 pr-1">
																		{index >
																			0 && (
																			<div className="flex items-center">
																				{/* Move to Top (Only show if more than 1 step from top) */}
																				{index >
																					1 && (
																					<button
																						onClick={() => {
																							// Move to Top
																							const newGroups =
																								[
																									...library.colorGroups,
																								];
																							const [
																								moved,
																							] =
																								newGroups.splice(
																									index,
																									1
																								);
																							newGroups.unshift(
																								moved
																							);
																							onReorderGroups(
																								newGroups
																							);
																						}}
																						className="p-1.5 text-gray-500 hover:text-white"
																						title="Move to Top"
																					>
																						<ChevronsUp
																							size={
																								14
																							}
																						/>
																					</button>
																				)}

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
																					className="p-1.5 text-gray-500 hover:text-white"
																					title="Move Up"
																				>
																					<ChevronUp
																						size={
																							14
																						}
																					/>
																				</button>
																			</div>
																		)}
																		{index <
																			library
																				.colorGroups
																				.length -
																				1 && (
																			<div className="flex items-center">
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
																					className="p-1.5 text-gray-500 hover:text-white"
																					title="Move Down"
																				>
																					<ChevronDown
																						size={
																							14
																						}
																					/>
																				</button>
																				{/* Move to Bottom (Only show if more than 1 step from bottom) */}
																				{index <
																					library
																						.colorGroups
																						.length -
																						2 && (
																					<button
																						onClick={() => {
																							// Move to Bottom
																							const newGroups =
																								[
																									...library.colorGroups,
																								];
																							const [
																								moved,
																							] =
																								newGroups.splice(
																									index,
																									1
																								);
																							newGroups.push(
																								moved
																							);
																							onReorderGroups(
																								newGroups
																							);
																						}}
																						className="p-1.5 text-gray-500 hover:text-white"
																						title="Move to Bottom"
																					>
																						<ChevronsDown
																							size={
																								14
																							}
																						/>
																					</button>
																				)}
																			</div>
																		)}
																	</div>
																)}

															{/* Edit/Delete Group Buttons */}
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
																		className={
																			group.isHidden
																				? "p-1.5 text-accent-cyan hover:text-accent-cyan/80"
																				: "p-1.5 text-gray-500 hover:text-white"
																		}
																		title={
																			group.isHidden
																				? "Show Group"
																				: "Hide Group"
																		}
																	>
																		{group.isHidden ? (
																			<EyeOff
																				size={
																					14
																				}
																			/>
																		) : (
																			<Eye
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
																		className="p-1.5 text-gray-500 hover:text-accent-cyan disabled:opacity-30 disabled:hover:text-gray-500"
																		title="Edit Group Name and Description"
																		disabled={
																			editingGroupId ===
																			group.id
																		}
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
																		setConfirmState(
																			{
																				isOpen: true,
																				title: `Delete ${group.name}?`,
																				message:
																					"Are you sure you want to delete this group? Colors assigned to this group will be returned to Global.",
																				variant:
																					"danger",
																				confirmLabel:
																					"Delete Group",
																				onConfirm:
																					() => {
																						if (
																							onDeleteGroup
																						) {
																							onDeleteGroup(
																								group.id
																							);
																						}
																						closeConfirm();
																					},
																			}
																		);
																	}}
																	className="p-1.5 text-gray-500 hover:text-red-500"
																	title="Delete Group"
																>
																	<Trash2
																		size={
																			14
																		}
																	/>
																</button>
															)}
															{onRemoveColors && (
																<button
																	onClick={() => {
																		setConfirmState(
																			{
																				isOpen: true,
																				title: "Unfavorite All in Group",
																				message:
																					(
																						<span className="text-gray-300">
																							Are
																							you
																							sure
																							you
																							want
																							to
																							remove
																							all
																							colors
																							assigned
																							to{" "}
																							<strong className="text-white">
																								{
																									group.name
																								}
																							</strong>{" "}
																							from
																							Favorites?
																						</span>
																					),
																				onConfirm:
																					() => {
																						if (
																							onRemoveColors
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
																						closeConfirm();
																					},
																				variant:
																					"danger",
																			}
																		);
																	}}
																	className="p-1.5 rounded-full transition-colors hover:bg-white/10 text-gray-500 hover:text-red-400 group-btn-heart disabled:opacity-30 disabled:hover:text-gray-500"
																	title={
																		groupItems.length ===
																		0
																			? "No Colors to Remove"
																			: "Unfavorite All in Group"
																	}
																	disabled={
																		groupItems.length ===
																		0
																	}
																>
																	<Heart
																		size={
																			14
																		}
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
														group.id &&
														group.description && (
															<p className="text-xs text-white/80 leading-relaxed border-b border-glass-stroke pb-2">
																{
																	group.description
																}
															</p>
														)}
												</div>

												{!group.isHidden && (
													<div
														className={`grid gap-3 transition-all duration-300 ${densityClass}`}
														data-organize-dropzone={
															isPointerOrganizeEnabled
																? "1"
																: undefined
														}
														data-organize-group={
															isPointerOrganizeEnabled
																? group.id
																: undefined
														}
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
																const finalName =
																	typeof colorItem ===
																	"string"
																		? "Custom Color"
																		: colorItem.name;
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
																			finalName
																		}
																		name={
																			finalName
																		}
																		isFavorite={
																			true
																		}
																		draggable={
																			isPointerOrganizeEnabled
																		}
																		usePointerDnD={
																			isPointerOrganizeEnabled
																		}
																		organizeDnd={{
																			groupId:
																				group.id,
																			id: hexValue,
																		}}
																		onPointerDown={
																			isPointerOrganizeEnabled
																				? (
																						e
																				  ) =>
																						startPointerOrganizeDrag(
																							e,
																							hexValue,
																							group.id,
																							finalName
																						)
																				: undefined
																		}
																		onClickCapture={(
																			e
																		) => {
																			if (
																				isPointerDraggingRef.current
																			) {
																				e.preventDefault();
																				e.stopPropagation();
																			}
																		}}
																		onMoveRequest={() =>
																			setColorToMove(
																				{
																					value: hexValue,
																					groupId:
																						group.id,
																				}
																			)
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
																		onToggleFavorite={async () => {
																			const res =
																				await onToggleFavorite(
																					hexValue,
																					colorObject
																				);
																			if (
																				res &&
																				res.action ===
																					"removed"
																			) {
																				toast.standard(
																					<>
																						Removed{" "}
																						<span className="text-accent-cyan">
																							{(
																								res.color as PresetColor
																							)
																								.name ||
																								hexValue}
																						</span>{" "}
																						from
																						favorites
																					</>
																				);
																			}
																			if (
																				res &&
																				res.action ===
																					"added" &&
																				(
																					res.color as PresetColor
																				)
																					.isAutoRenamed
																			) {
																				toast.standard(
																					<>
																						Saved
																						as{" "}
																						<span className="text-accent-cyan">
																							{
																								(
																									res.color as PresetColor
																								)
																									.name
																							}
																						</span>
																					</>
																				);
																			}
																		}}
																	/>
																);
															}
														)}
													</div>
												)}

												{/* Empty State Drop Zone */}
												{groupItems.length === 0 &&
													isEditingLibrary && (
														<div
															className="border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 gap-2 bg-black/5 relative z-10 transition-colors hover:border-accent-cyan/30 hover:text-accent-cyan/70"
															data-organize-dropzone={
																isPointerOrganizeEnabled
																	? "1"
																	: undefined
															}
															data-organize-group={
																isPointerOrganizeEnabled
																	? group.id
																	: undefined
															}
														>
															<FolderPlus
																size={24}
																className="opacity-50"
															/>
															<span className="text-xs font-mono uppercase tracking-wider">
																Drop Colors Here
															</span>
														</div>
													)}
											</div>
										);
									}
								)}
							</motion.div>
						)}
						{/* Move Color Modal/Menu */}
						{colorToMove && (
							<div
								role="dialog"
								aria-modal="true"
								aria-label="Move color dialog"
								className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
								onClick={() => setColorToMove(null)}
								onKeyDown={(e) => {
									if (e.key === "Escape")
										setColorToMove(null);
								}}
							>
								<div
									className="bg-bg-raised border border-glass-stroke rounded-xl shadow-2xl p-4 w-full max-w-xs space-y-4"
									onClick={(e) => e.stopPropagation()}
								>
									<div className="flex items-center justify-between border-b border-glass-stroke pb-2">
										<h4 className="text-sm font-brand text-white">
											Move Color
										</h4>
										<button
											onClick={() => setColorToMove(null)}
											className="text-gray-500 hover:text-white"
											title="Close"
											aria-label="Close"
										>
											<X size={14} />
										</button>
									</div>

									<div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
										<div className="text-[10px] uppercase font-mono text-gray-500 mb-1 px-2">
											Available Groups
										</div>
										<button
											disabled={
												colorToMove?.groupId === null
											}
											onClick={() => {
												if (onMoveColor && colorToMove)
													onMoveColor(
														colorToMove.value,
														null
													); // Move to Global
												setColorToMove(null);
											}}
											className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between group ${
												colorToMove?.groupId === null
													? "opacity-30 text-gray-500"
													: "text-gray-300 hover:bg-white/5 hover:text-white"
											}`}
										>
											<span className="flex items-center gap-2">
												<Globe
													size={12}
													className="text-accent-cyan"
												/>
												Global Favorites
											</span>
											{colorToMove?.groupId === null && (
												<span className="text-[9px] opacity-50 uppercase tracking-wider">
													Current
												</span>
											)}
										</button>
										{(library.colorGroups || []).map(
											(g: ColorGroup) => (
												<button
													key={g.id}
													disabled={
														colorToMove?.groupId ===
														g.id
													}
													onClick={() => {
														if (onMoveColor)
															onMoveColor(
																colorToMove.value,
																g.id
															);
														setColorToMove(null);
													}}
													className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center gap-2 truncate ${
														colorToMove?.groupId ===
														g.id
															? "opacity-30 text-gray-500"
															: "text-gray-300 hover:bg-white/5 hover:text-white"
													}`}
												>
													<FolderOpen
														size={12}
														className="text-accent-purple shrink-0"
													/>
													<span className="truncate">
														{g.name}
													</span>
													{colorToMove?.groupId ===
														g.id && (
														<span className="text-[9px] opacity-50 ml-auto uppercase tracking-wider">
															Current
														</span>
													)}
												</button>
											)
										)}
									</div>
								</div>
							</div>
						)}

						{/* Colors: Presets View */}
						{view === "colors" && activeSubTab === "presets" && (
							<motion.div
								key="presets-list"
								initial={{ opacity: 0, x: 10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -10 }}
								className="space-y-8 pt-4"
							>
								{!PRESET_LIBRARIES ||
								PRESET_LIBRARIES.length === 0 ? (
									<p className="text-gray-500 italic">
										No preset libraries found.
									</p>
								) : (
									(() => {
										const hiddenLibraries =
											colorPresetCustom.hiddenLibraries ||
											{};
										const hiddenItems =
											colorPresetCustom.hiddenItems || {};

										const baseLibraryNames =
											PRESET_LIBRARIES.map((p) => p.name);

										const orderedLibraryNames =
											sortOption === "custom"
												? normalizeOrder(
														baseLibraryNames,
														colorPresetCustom.libraryOrder
												  )
												: baseLibraryNames;

										const libraryByName = new Map(
											PRESET_LIBRARIES.map((p) => [
												p.name,
												p,
											])
										);

										const orderedLibraries =
											orderedLibraryNames
												.map((name) =>
													libraryByName.get(name)
												)
												.filter(
													Boolean
												) as typeof PRESET_LIBRARIES;

										const visibleLibraries =
											sortOption === "custom" &&
											!isEditingPresets
												? orderedLibraries.filter(
														(p) =>
															!hiddenLibraries[
																p.name
															]
												  )
												: orderedLibraries;

										return visibleLibraries.map(
											(preset, libraryIndex) => {
												const isLibraryHidden = Boolean(
													hiddenLibraries[preset.name]
												);

												const isFullyFavorited =
													preset.colors.every((c) =>
														isFavorite(c.value)
													);

												// Determine which colors to show & in what order
												let sortedPresetColors = [
													...preset.colors,
												];

												const byName = (
													a: PresetColor,
													b: PresetColor
												) =>
													a.name.localeCompare(
														b.name
													);

												if (sortOption === "name") {
													sortedPresetColors.sort(
														(a, b) =>
															a.name.localeCompare(
																b.name
															)
													);
												} else if (
													sortOption === "sat-asc"
												) {
													sortedPresetColors.sort(
														(a, b) => {
															const d =
																colord(
																	a.value
																).toHsl().s -
																colord(
																	b.value
																).toHsl().s;
															return d !== 0
																? d
																: byName(a, b);
														}
													);
												} else if (
													sortOption === "shade-asc"
												) {
													sortedPresetColors.sort(
														(a, b) => {
															const d =
																colord(
																	a.value
																).toHsl().l -
																colord(
																	b.value
																).toHsl().l;
															return d !== 0
																? d
																: byName(a, b);
														}
													);
												}

												if (
													sortOption === "custom" &&
													!isEditingPresets
												) {
													sortedPresetColors =
														sortedPresetColors.filter(
															(c) =>
																!hiddenItems[
																	`${preset.name}::${c.value}`
																]
														);
												}

												return (
													<div
														key={preset.name}
														className={`space-y-4 ${
															sortOption ===
																"custom" &&
															isEditingPresets &&
															isLibraryHidden
																? "opacity-50"
																: ""
														}`}
													>
														<div className="space-y-1">
															<div className="flex items-center justify-between group/library">
																<div className="flex items-center gap-2">
																	{sortOption ===
																		"custom" &&
																	isEditingPresets &&
																	isLibraryHidden ? (
																		<EyeOff
																			size={
																				14
																			}
																			className="text-gray-600"
																		/>
																	) : (
																		<Book
																			size={
																				14
																			}
																			className="text-accent-cyan"
																		/>
																	)}
																	<h4 className="text-sm font-bold text-white tracking-wide">
																		{
																			preset.name
																		}
																	</h4>
																	<span className="text-xs text-gray-500 font-mono ml-1">
																		(
																		{
																			preset
																				.colors
																				.length
																		}
																		)
																	</span>
																</div>

																<div className="flex items-center gap-1">
																	{sortOption ===
																		"custom" &&
																		isEditingPresets && (
																			<>
																				<div className="flex items-center gap-0.5 border-r border-glass-stroke mr-1 pr-1">
																					{libraryIndex >
																						1 && (
																						<button
																							onClick={() => {
																								const base =
																									PRESET_LIBRARIES.map(
																										(
																											p
																										) =>
																											p.name
																									);
																								const current =
																									normalizeOrder(
																										base,
																										colorPresetCustom.libraryOrder
																									);
																								const idx =
																									current.indexOf(
																										preset.name
																									);
																								if (
																									idx >
																									0
																								) {
																									const next =
																										[
																											...current,
																										];
																									const [
																										moved,
																									] =
																										next.splice(
																											idx,
																											1
																										);
																									next.unshift(
																										moved
																									);
																									updateColorPresetCustom(
																										{
																											libraryOrder:
																												next,
																										}
																									);
																								}
																							}}
																							className="p-1.5 text-gray-500 hover:text-white"
																							title="Move to Top"
																						>
																							<ChevronsUp
																								size={
																									14
																								}
																							/>
																						</button>
																					)}
																					{libraryIndex >
																						0 && (
																						<button
																							onClick={() => {
																								const base =
																									PRESET_LIBRARIES.map(
																										(
																											p
																										) =>
																											p.name
																									);
																								const current =
																									normalizeOrder(
																										base,
																										colorPresetCustom.libraryOrder
																									);
																								const idx =
																									current.indexOf(
																										preset.name
																									);
																								if (
																									idx >
																									0
																								) {
																									const next =
																										[
																											...current,
																										];
																									[
																										next[
																											idx -
																												1
																										],
																										next[
																											idx
																										],
																									] =
																										[
																											next[
																												idx
																											],
																											next[
																												idx -
																													1
																											],
																										];
																									updateColorPresetCustom(
																										{
																											libraryOrder:
																												next,
																										}
																									);
																								}
																							}}
																							className="p-1.5 text-gray-500 hover:text-white"
																							title="Move Up"
																						>
																							<ChevronUp
																								size={
																									14
																								}
																							/>
																						</button>
																					)}
																					<button
																						onClick={() => {
																							const base =
																								PRESET_LIBRARIES.map(
																									(
																										p
																									) =>
																										p.name
																								);
																							const current =
																								normalizeOrder(
																									base,
																									colorPresetCustom.libraryOrder
																								);
																							const idx =
																								current.indexOf(
																									preset.name
																								);
																							if (
																								idx !==
																									-1 &&
																								idx <
																									current.length -
																										1
																							) {
																								const next =
																									[
																										...current,
																									];
																								[
																									next[
																										idx +
																											1
																									],
																									next[
																										idx
																									],
																								] =
																									[
																										next[
																											idx
																										],
																										next[
																											idx +
																												1
																										],
																									];
																								updateColorPresetCustom(
																									{
																										libraryOrder:
																											next,
																									}
																								);
																							}
																						}}
																						className="p-1.5 text-gray-500 hover:text-white"
																						title="Move Down"
																					>
																						<ChevronDown
																							size={
																								14
																							}
																						/>
																					</button>
																					{libraryIndex <
																						visibleLibraries.length -
																							2 && (
																						<button
																							onClick={() => {
																								const base =
																									PRESET_LIBRARIES.map(
																										(
																											p
																										) =>
																											p.name
																									);
																								const current =
																									normalizeOrder(
																										base,
																										colorPresetCustom.libraryOrder
																									);
																								const idx =
																									current.indexOf(
																										preset.name
																									);
																								if (
																									idx !==
																										-1 &&
																									idx <
																										current.length -
																											1
																								) {
																									const next =
																										[
																											...current,
																										];
																									const [
																										moved,
																									] =
																										next.splice(
																											idx,
																											1
																										);
																									next.push(
																										moved
																									);
																									updateColorPresetCustom(
																										{
																											libraryOrder:
																												next,
																										}
																									);
																								}
																							}}
																							className="p-1.5 text-gray-500 hover:text-white"
																							title="Move to Bottom"
																						>
																							<ChevronsDown
																								size={
																									14
																								}
																							/>
																						</button>
																					)}
																				</div>

																				<button
																					onClick={() => {
																						updateColorPresetCustom(
																							{
																								hiddenLibraries:
																									{
																										...hiddenLibraries,
																										[preset.name]:
																											!isLibraryHidden,
																									},
																							}
																						);
																					}}
																					className={
																						isLibraryHidden
																							? "p-1.5 text-accent-cyan hover:text-accent-cyan/80"
																							: "p-1.5 text-gray-500 hover:text-white"
																					}
																					title={
																						isLibraryHidden
																							? "Show Library"
																							: "Hide Library"
																					}
																				>
																					{isLibraryHidden ? (
																						<EyeOff
																							size={
																								14
																							}
																						/>
																					) : (
																						<Eye
																							size={
																								14
																							}
																						/>
																					)}
																				</button>
																			</>
																		)}

																	{onAddColors && (
																		<HeartToggle
																			isFavorite={
																				isFullyFavorited
																			}
																			onToggle={() =>
																				handleBulkFavorite(
																					preset.colors
																				)
																			}
																			size={
																				14
																			}
																			className={
																				isFullyFavorited
																					? "scale-110"
																					: "text-gray-500 hover:text-red-500 hover:scale-110"
																			}
																		/>
																	)}
																</div>
															</div>
															<p className="text-xs text-white/80 leading-relaxed border-b border-glass-stroke pb-2">
																{
																	preset.description
																}
															</p>
														</div>

														<div
															className={`grid gap-3 transition-all duration-300 ${densityClass}`}
														>
															{sortedPresetColors.map(
																(c, idx) => {
																	const finalName =
																		c.name;
																	const hideKey = `${preset.name}::${c.value}`;
																	const itemHidden =
																		Boolean(
																			hiddenItems[
																				hideKey
																			]
																		);
																	const isCustomizing =
																		sortOption ===
																			"custom" &&
																		isEditingPresets;

																	return (
																		<SmartColorCard
																			key={`${c.value}-${idx}`}
																			color={
																				c.value
																			}
																			label={
																				finalName
																			}
																			name={
																				finalName
																			}
																			isFavorite={isFavorite(
																				c.value
																			)}
																			isCustomizing={
																				isCustomizing
																			}
																			isHidden={
																				isCustomizing
																					? itemHidden
																					: false
																			}
																			onToggleHidden={
																				isCustomizing
																					? () => {
																							updateColorPresetCustom(
																								{
																									hiddenItems:
																										{
																											...hiddenItems,
																											[hideKey]:
																												!itemHidden,
																										},
																								}
																							);
																					  }
																					: undefined
																			}
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
																			onToggleFavorite={async () => {
																				const res =
																					await onToggleFavorite(
																						c.value,
																						c
																					);
																				if (
																					res &&
																					res.action ===
																						"added" &&
																					(
																						res.color as PresetColor
																					)
																						.isAutoRenamed
																				) {
																					toast.standard(
																						<>
																							Saved
																							as{" "}
																							<span className="text-accent-cyan">
																								{
																									(
																										res.color as PresetColor
																									)
																										.name
																								}
																							</span>
																						</>
																					);
																				}
																			}}
																		/>
																	);
																}
															)}
														</div>
													</div>
												);
											}
										);
									})()
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
			<ConfirmationModal
				isOpen={confirmState.isOpen}
				title={confirmState.title}
				message={confirmState.message}
				onConfirm={confirmState.onConfirm}
				onCancel={closeConfirm}
				confirmLabel={confirmState.confirmLabel || "Remove All"}
				variant="danger"
			/>
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
	isCustomizing,
	isHidden,
	onToggleHidden,
	onMoveUp,
	onMoveDown,
	draggable,
	onDragStart,
	onDragEnd,
	onMoveRequest,
	onDrop,
	onDragOver,
	usePointerDnD,
	organizeDnd,
	onPointerDown,
	onClickCapture,
}: {
	color: string;
	label: string;
	name?: string;
	isFavorite: boolean;
	onClick: () => void;
	// Updated to support new return type and metadata passing
	onToggleFavorite: (
		color: string,
		metadata?: PresetColor
	) => Promise<ToggleFavoriteResult | void>;
	isCustomizing?: boolean;
	isHidden?: boolean;
	onToggleHidden?: () => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	draggable?: boolean;
	onDragStart?: (e: React.DragEvent) => void;
	onDragEnd?: (e: React.DragEvent) => void;
	onMoveRequest?: () => void;
	onDrop?: (e: React.DragEvent) => void;
	onDragOver?: (e: React.DragEvent) => void;
	usePointerDnD?: boolean;
	organizeDnd?: { groupId: string | null; id: string };
	onPointerDown?: (e: React.PointerEvent) => void;
	onClickCapture?: (e: React.MouseEvent) => void;
}) => {
	const { isCopied, copy } = useCopyFeedback();
	const isDark = colord(color).isDark();

	const isOrganizing = Boolean(usePointerDnD || draggable);

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		copy(color.toUpperCase(), color.toUpperCase());
	};

	return (
		<div
			className={`relative rounded-lg overflow-hidden h-14 shadow-sm transition-all hover:shadow-lg group/minicard ${
				isDark ? "border border-white/40" : "border border-black/20"
			} ${isHidden ? "opacity-50" : ""} ${
				draggable || usePointerDnD
					? "cursor-grab active:cursor-grabbing"
					: ""
			} ${usePointerDnD ? "touch-none" : ""}`}
			draggable={draggable && !usePointerDnD}
			onDragStart={usePointerDnD ? undefined : onDragStart}
			onDragEnd={usePointerDnD ? undefined : onDragEnd}
			onDrop={usePointerDnD ? undefined : onDrop}
			onDragOver={usePointerDnD ? undefined : onDragOver}
			onPointerDown={usePointerDnD ? onPointerDown : undefined}
			onClickCapture={usePointerDnD ? onClickCapture : undefined}
			data-organize-drop={usePointerDnD ? "1" : undefined}
			data-organize-group={
				usePointerDnD
					? organizeDnd?.groupId === null
						? "null"
						: organizeDnd?.groupId
					: undefined
			}
			data-organize-id={usePointerDnD ? organizeDnd?.id : undefined}
		>
			{/* Interactive Color Body */}
			<button
				type="button"
				className={`absolute inset-0 flex border-none p-0 bg-transparent ${
					isOrganizing ? "pointer-events-none" : "cursor-pointer"
				}`}
				onClick={onClick}
				aria-label={`Load ${name}`}
			>
				{/* Color Swatch (Full Background) */}
				<div className="absolute inset-0 z-0">
					<svg className="w-full h-full">
						<rect
							x="0"
							y="0"
							width="100%"
							height="100%"
							fill={color}
						/>
					</svg>
				</div>

				{/* Content Overlay */}
				<div className="absolute inset-0 z-10 p-2 pointer-events-none">
					{/* Name (Middle Left) */}
					<div className="absolute top-1/2 -translate-y-1/2 left-2 max-w-[calc(100%-12px)]">
						<span
							className={`text-[9px] font-bold uppercase tracking-wider block truncate ${
								isDark ? "text-white/90" : "text-black/80"
							}`}
						>
							{label}
						</span>
					</div>

					{/* Hex (Bottom Left) */}
					<div className="absolute bottom-1 left-2">
						<span
							className={`text-[8px] font-mono opacity-75 block ${
								isDark ? "text-white/80" : "text-black/70"
							}`}
						>
							{color.toUpperCase()}
						</span>
					</div>

					{/* Actions Row (Top Right) */}
					<div
						className={`absolute top-1 right-1 flex items-center gap-0.5 z-20 transition-opacity pointer-events-auto ${
							isCustomizing
								? "opacity-100"
								: "opacity-0 group-hover/minicard:opacity-100"
						} ${isDark ? "text-white" : "text-black/60"}`}
					>
						{/* Presets Customization Controls */}
						{(isCustomizing ||
							onToggleHidden ||
							onMoveUp ||
							onMoveDown) && (
							<div className="flex items-center gap-0.5 mr-0.5 pr-0.5 border-r border-black/10">
								{onMoveUp && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											onMoveUp();
										}}
										className="p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
										title="Move Up"
										aria-label="Move Up"
									>
										<ChevronUp size={10} />
									</button>
								)}
								{onMoveDown && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											onMoveDown();
										}}
										className="p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
										title="Move Down"
										aria-label="Move Down"
									>
										<ChevronDown size={10} />
									</button>
								)}
								{onToggleHidden && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											onToggleHidden();
										}}
										className="p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
										title={isHidden ? "Show" : "Hide"}
										aria-label={isHidden ? "Show" : "Hide"}
									>
										{isHidden ? (
											<EyeOff size={10} />
										) : (
											<Eye size={10} />
										)}
									</button>
								)}
							</div>
						)}

						{/* Move Button (Only if draggable/editable) */}
						{onMoveRequest && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									onMoveRequest();
								}}
								className="p-1 rounded-full hover:bg-black/20 transition-colors cursor-pointer"
								title="Move to Group"
							>
								<ArrowRight size={10} />
							</button>
						)}

						<button
							onClick={handleCopy}
							className="p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
							title="Copy Hex"
						>
							{isCopied ? (
								<Check size={10} className="text-green-500" />
							) : (
								<Copy size={10} />
							)}
						</button>

						{/* Favorite Toggle */}
						<HeartToggle
							isFavorite={isFavorite}
							onToggle={() => onToggleFavorite(color)}
							size={10}
							className={
								isDark
									? "text-white hover:bg-white/20 cursor-pointer"
									: "text-black/80 hover:bg-black/10 cursor-pointer"
							}
						/>
					</div>
				</div>
			</button>
		</div>
	);
};
