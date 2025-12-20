import { useState, useMemo, useEffect } from "react";
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
  ArrowRight,
} from "lucide-react";
import { PRESET_LIBRARIES, PresetColor } from "../../data/colorPresets";
import { colord } from "colord";
import { ColorGroup, UiPreferences } from "../../hooks/useSoloistSystem";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { HeartToggle } from "../common/HeartToggle";
import { useCopyFeedback } from "../../hooks/useCopyFeedback";
import { useToast } from "../../context/ToastContext";
import { ToggleFavoriteResult } from "../../utils/favorites";

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
  ) => Promise<ToggleFavoriteResult | void>;
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
  type SortOption = "custom" | "name" | "hue";
  const [sortOption, setSortOption] = useState<SortOption>("custom");

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

  // Drag and Drop Handlers
  const handleDragStart = (
    e: React.DragEvent,
    colorHex: string,
    sourceGroupId: string | null,
    index?: number
  ) => {
    e.dataTransfer.setData("text/plain", colorHex);
    e.dataTransfer.setData("sourceGroupId", sourceGroupId || "null");
    if (index !== undefined) {
      e.dataTransfer.setData("sourceIndex", index.toString());
    }
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
    const sourceIndexStr = e.dataTransfer.getData("sourceIndex");

    // Handle Reordering (Same Group)
    if (
      sourceGroupId === (targetGroupId || "null") &&
      targetGroupId !== null &&
      sourceIndexStr &&
      onUpdateGroup
    ) {
      // Get target index from drop target (we need to pass this somehow or assume drop on container = append?
      // Actually, to reorder *between* items, we need SmartColorCard to handle the drop or pass the index up.
      // For this implementation, we will utilize the `SmartColorCard`'s onDrop prop (added below)
      // instead of the container's onDrop for precise targeting.
      // The container drop (this function) will handle "Add to Group" or "Append".

      // If we are dropping on the container background, maybe append?
      // For now, let's keep container drop for cross-group moves,
      // and let individual cards handle reorder drops in the render loop.

      // If we are here, it means we dropped on the *container* but not a specific card.
      // We can treat this as "Move to end".
      return;
    }

    // If moved to same group (and not caught by specific card reorder), do nothing
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
      if (sortOption === "name") {
        return [...list].sort((a, b) => {
          const nameA = typeof a === "string" ? a : a.name;
          const nameB = typeof b === "string" ? b : b.name;
          return nameA.localeCompare(nameB);
        });
      } else if (sortOption === "hue") {
        return [...list].sort((a, b) => {
          const hexA = typeof a === "string" ? a : a.value;
          const hexB = typeof b === "string" ? b : b.value;
          return colord(hexA).toHsl().h - colord(hexB).toHsl().h;
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

  // Reset sort to 'hue' if switching to presets while in 'custom'
  useEffect(() => {
    if (activeSubTab === "presets" && sortOption === "custom") {
      setSortOption("hue");
    }
  }, [activeSubTab, sortOption]);

  // Toggling favorite checks if it exists in the library prop
  const isFavorite = (color: string) => {
    // Case insensitive check
    if (!library || !library.colors) return false;
    return library.colors.some((c: string | PresetColor) => {
      const hexValue = typeof c === "string" ? c : c.value;
      return hexValue.toUpperCase() === color.toUpperCase();
    });
  };

  // Toast
  const { showToast } = useToast();

  // Grid Density State (Columns)
  const [density, setDensity] = useState(2);

  // Sync Density with Preferences
  useEffect(() => {
    if (uiPreferences && uiPreferences.colorGridDensity) {
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
              onChange={(e) => setDensity(parseInt(e.target.value))}
              onMouseUp={(e) =>
                commitDensityChange(parseInt(e.currentTarget.value))
              }
              onTouchEnd={(e) =>
                commitDensityChange(parseInt(e.currentTarget.value))
              }
              aria-label="View density"
              className="w-20 accent-accent-cyan h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
            />
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 pb-2 border-l border-white/10 pl-4 ml-2">
            <span className="text-[10px] text-gray-500 font-mono uppercase">
              Sort
            </span>
            <div className="relative">
              <button
                onClick={(e) => {
                  const menu = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  menu.classList.toggle("hidden");
                }}
                className="appearance-none bg-black/20 border border-white/10 rounded px-2 py-0.5 text-[10px] text-gray-300 font-mono uppercase focus:outline-none focus:border-accent-cyan cursor-pointer pr-6 hover:bg-white/5 transition-colors flex items-center gap-2"
                aria-label="Sort order"
              >
                {sortOption === "custom"
                  ? "Custom"
                  : sortOption === "hue"
                  ? "Hue"
                  : "Name (A-Z)"}
              </button>
              <div className="hidden absolute right-0 mt-1 bg-bg-raised border border-glass-stroke rounded shadow-monolith z-50 min-w-max">
                {activeSubTab === "favorites" && (
                  <button
                    onClick={() => {
                      setSortOption("custom");
                      (document.activeElement as HTMLElement)?.blur();
                      const menu = document.activeElement?.parentElement
                        ?.nextElementSibling as HTMLElement;
                      if (menu) menu.classList.add("hidden");
                    }}
                    className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    Custom
                  </button>
                )}
                <button
                  onClick={() => {
                    setSortOption("hue");
                    const menu = document.querySelector(
                      '[aria-label="Sort order"]'
                    )?.nextElementSibling as HTMLElement;
                    if (menu) menu.classList.add("hidden");
                  }}
                  className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 cursor-pointer transition-colors"
                >
                  Hue
                </button>
                <button
                  onClick={() => {
                    setSortOption("name");
                    const menu = document.querySelector(
                      '[aria-label="Sort order"]'
                    )?.nextElementSibling as HTMLElement;
                    if (menu) menu.classList.add("hidden");
                  }}
                  className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 cursor-pointer transition-colors"
                >
                  Name (A-Z)
                </button>
              </div>
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
                          title="Delete Palette"
                          aria-label="Delete Palette"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="h-12 flex rounded-lg overflow-hidden w-full">
                        {p.colors.map((c: string, ci: number) => (
                          <div key={ci} className="flex-1 h-full">
                            <svg className="w-full h-full">
                              <rect
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                fill={c}
                              />
                            </svg>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => onLoadColor(p.colors[0])}
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
          )}

          {/* Colors: Favorites View */}
          {(view === "all" ||
            (view === "colors" && activeSubTab === "favorites")) && (
            <div className="space-y-8">
              {/* My Favorites (Unassigned) */}
              <div
                className={`space-y-4 transition-all ${
                  isEditingLibrary
                    ? "bg-white/5 border border-white/10 border-dashed rounded-xl p-4"
                    : "rounded-none p-0"
                }`}
                onDragOver={isEditingLibrary ? handleDragOver : undefined}
                onDrop={
                  isEditingLibrary ? (e) => handleDrop(e, null) : undefined
                }
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between group/section">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-accent-cyan" />
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
                          onClick={() => setIsCreatingGroup(true)}
                          className="p-1.5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
                          title="Create New Group"
                        >
                          <FolderPlus size={14} />
                        </button>
                      )}
                      {/* Organize / Edit Mode Toggle */}
                      <button
                        disabled={sortOption !== "custom"}
                        onClick={() => setIsEditingLibrary(!isEditingLibrary)}
                        className={`p-1.5 rounded-full transition-all ${
                          sortOption !== "custom"
                            ? "opacity-30 text-gray-500"
                            : isEditingLibrary
                            ? "text-accent-cyan bg-accent-cyan/10 ring-1 ring-accent-cyan/30"
                            : "text-gray-500 hover:text-white hover:bg-white/10"
                        }`}
                        title={
                          sortOption !== "custom"
                            ? "Switch to Custom Sort to Organize"
                            : isEditingLibrary
                            ? "Done Organizing"
                            : "Organize Colors and Groups"
                        }
                      >
                        <ArrowRightLeft size={14} />
                      </button>
                      {unassignedColors.length > 0 && onRemoveColors && (
                        <button
                          onClick={() => {
                            setConfirmState({
                              isOpen: true,
                              title: "Remove Global Favorites",
                              message: (
                                <span className="text-gray-300">
                                  Are you sure you want to remove all colors in{" "}
                                  <strong className="text-white">
                                    Favorites &gt; Global
                                  </strong>
                                  ?
                                </span>
                              ),
                              onConfirm: () => {
                                if (onRemoveColors) {
                                  onRemoveColors(
                                    unassignedColors.map(
                                      (c: string | PresetColor) =>
                                        typeof c === "string"
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
                          className="p-1.5 hover:bg-white/10 rounded-full text-red-500 hover:text-red-400 transition-colors"
                          title="Unfavorite All in Global"
                        >
                          <Heart size={14} className="fill-current" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed border-b border-glass-stroke pb-2">
                    Colors saved here will always be active and accessible.
                  </p>
                </div>

                {/* Create Group Input */}
                {isCreatingGroup &&
                  (() => {
                    const isDuplicate = (
                      (library.colorGroups as ColorGroup[]) || []
                    ).some(
                      (g) =>
                        g.name.trim().toLowerCase() ===
                        newGroupName.trim().toLowerCase()
                    );
                    const isValid =
                      newGroupName.trim().length > 0 && !isDuplicate;

                    const handleCreate = () => {
                      if (isValid && onCreateGroup) {
                        onCreateGroup(newGroupName.trim(), newGroupDesc);
                        setIsCreatingGroup(false);
                        setNewGroupName("");
                        setNewGroupDesc("");
                      }
                    };

                    const handleKeyDown = (e: React.KeyboardEvent) => {
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
                            onChange={(e) => setNewGroupName(e.target.value)}
                            onKeyDown={handleKeyDown}
                          />
                          {isDuplicate && (
                            <p className="text-[10px] text-red-400 font-medium">
                              Group name must be unique.
                            </p>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Description (Optional)"
                          className="w-full bg-black/20 border border-white/10 text-xs text-gray-400 font-sans px-3 py-2 rounded-lg focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-colors"
                          value={newGroupDesc}
                          onChange={(e) => setNewGroupDesc(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setIsCreatingGroup(false);
                              setNewGroupName("");
                              setNewGroupDesc("");
                            }}
                            className="text-xs text-gray-500 hover:text-white px-2 py-1"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={!isValid}
                            onClick={handleCreate}
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
                  <p className="text-gray-600 italic text-sm">
                    No unassigned favorites.
                  </p>
                ) : (
                  <div
                    className={`grid gap-3 transition-all duration-300 ${densityClass}`}
                  >
                    {unassignedColors.map(
                      (c: PresetColor | string, idx: number) => {
                        const colorItem = c;
                        const hexValue =
                          typeof colorItem === "string"
                            ? colorItem
                            : colorItem.value;
                        const finalName =
                          typeof colorItem === "string"
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
                              isEditingLibrary && sortOption === "custom"
                            }
                            onDragStart={
                              isEditingLibrary && sortOption === "custom"
                                ? (e) => handleDragStart(e, hexValue, null)
                                : undefined
                            }
                            onMoveRequest={() =>
                              setColorToMove({
                                value: hexValue,
                                groupId: null,
                              })
                            }
                            onDrop={
                              isEditingLibrary
                                ? (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const sourceGroupId =
                                      e.dataTransfer.getData("sourceGroupId");
                                    const sourceHex =
                                      e.dataTransfer.getData("text/plain");

                                    // Global Reordering (Unassigned <-> Unassigned)
                                    if (
                                      sourceGroupId === "null" &&
                                      onReorderColors
                                    ) {
                                      const allColors = [
                                        ...(library.colors || []),
                                      ];

                                      // Find indices in MASTER list (by Hex)
                                      const sourceIdx = allColors.findIndex(
                                        (c) => {
                                          const v =
                                            typeof c === "string" ? c : c.value;
                                          return (
                                            v.toUpperCase() ===
                                            sourceHex.toUpperCase()
                                          );
                                        }
                                      );
                                      const targetIdx = allColors.findIndex(
                                        (c) => {
                                          const v =
                                            typeof c === "string" ? c : c.value;
                                          return (
                                            v.toUpperCase() ===
                                            hexValue.toUpperCase()
                                          );
                                        }
                                      );

                                      if (
                                        sourceIdx !== -1 &&
                                        targetIdx !== -1 &&
                                        sourceIdx !== targetIdx
                                      ) {
                                        const [moved] = allColors.splice(
                                          sourceIdx,
                                          1
                                        );
                                        allColors.splice(targetIdx, 0, moved);
                                        onReorderColors(allColors);
                                      }
                                    }
                                    // Group -> Global Drop
                                    else if (
                                      sourceGroupId !== "null" &&
                                      sourceGroupId
                                    ) {
                                      if (onMoveColor) {
                                        onMoveColor(sourceHex, null);
                                      }
                                    }
                                  }
                                : undefined
                            }
                            onDragOver={
                              isEditingLibrary
                                ? (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.dataTransfer.dropEffect = "move";
                                  }
                                : undefined
                            }
                            onClick={() => {
                              onLoadColor(hexValue);

                              // Use stored name directly

                              if (onInspectColor)
                                onInspectColor(
                                  typeof c === "string"
                                    ? {
                                        name: finalName,
                                        value: hexValue,
                                      }
                                    : c
                                );
                            }}
                            onToggleFavorite={async () => {
                              const res = await onToggleFavorite(hexValue, {
                                name: finalName,
                                value: hexValue,
                              });
                              if (res && res.action === "removed") {
                                showToast(
                                  <>
                                    Removed{" "}
                                    <span className="text-accent-cyan">
                                      {finalName}
                                    </span>{" "}
                                    from favorites
                                  </>
                                );
                              } else if (
                                res &&
                                res.action === "added" &&
                                (res.color as PresetColor).isAutoRenamed
                              ) {
                                // ... (existing auto-rename toast logic)
                                showToast(
                                  <div className="flex flex-col">
                                    <span>
                                      Auto-renamed to{" "}
                                      <span className="text-accent-cyan">
                                        {(res.color as PresetColor).name}
                                      </span>
                                    </span>
                                    <span className="text-[10px] opacity-60 font-normal">
                                      Prevention: Duplicate Found
                                    </span>
                                  </div>
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
              {library.colorGroups?.map((group: ColorGroup, index: number) => {
                const groupItems = groupColorsMap[group.id] || [];

                return (
                  <div
                    key={group.id}
                    className={`space-y-4 transition-all duration-300 ${
                      group.isHidden ? "opacity-50" : ""
                    } ${
                      isEditingLibrary
                        ? "bg-accent-cyan/5 border border-accent-cyan/30 border-dashed rounded-xl p-4 relative overflow-hidden"
                        : "rounded-none p-0"
                    }`}
                    onDragOver={isEditingLibrary ? handleDragOver : undefined}
                    onDrop={
                      isEditingLibrary
                        ? (e) => handleDrop(e, group.id)
                        : undefined
                    }
                  >
                    {/* Blueprint Pattern Background (Edit Mode) */}
                    {isEditingLibrary && (
                      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-blueprint-grid" />
                    )}

                    <div className="group/header relative z-10">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-start gap-2 flex-1 relative">
                          {group.id === editingGroupId ? (
                            (() => {
                              // Validation Logic
                              const currentName =
                                tempEditData?.name ?? group.name;
                              const isDuplicate = (
                                (library.colorGroups as ColorGroup[]) || []
                              ).some(
                                (g) =>
                                  g.id !== group.id &&
                                  g.name.trim().toLowerCase() ===
                                    currentName.trim().toLowerCase()
                              );
                              const isValid =
                                currentName.trim().length > 0 && !isDuplicate;

                              return (
                                <>
                                  <div className="fixed inset-0 z-40 bg-transparent cursor-default" />
                                  <div className="relative z-50 flex flex-col gap-1 flex-1">
                                    <div className="relative">
                                      <input
                                        autoFocus
                                        type="text"
                                        className={`bg-black/20 text-white text-sm font-sans px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 w-full shadow-lg transition-colors ${
                                          isDuplicate
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                                            : "border-white/10 focus:border-accent-cyan focus:ring-accent-cyan/20"
                                        }`}
                                        defaultValue={group.name}
                                        placeholder="Group Name"
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
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
                                              setEditingGroupId(null);
                                            }
                                          } else if (e.key === "Escape") {
                                            setEditingGroupId(null);
                                          }
                                        }}
                                        onChange={(e) => {
                                          setTempEditData((prev) => ({
                                            name: e.target.value,
                                            description:
                                              prev?.description || "",
                                          }));
                                        }}
                                      />
                                      {isDuplicate && (
                                        <div className="absolute top-full left-0 mt-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded shadow-lg z-[60]">
                                          Group name must be unique.
                                        </div>
                                      )}
                                    </div>
                                    <textarea
                                      className="w-full bg-black/20 text-xs text-gray-400 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 resize-none shadow-inner font-sans leading-relaxed mt-2"
                                      defaultValue={group.description}
                                      placeholder="Add a description..."
                                      rows={2}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          // Save on Enter in textarea
                                          if (
                                            isValid &&
                                            onUpdateGroup &&
                                            tempEditData
                                          ) {
                                            onUpdateGroup(
                                              group.id,
                                              tempEditData
                                            );
                                            setEditingGroupId(null);
                                          }
                                        } else if (e.key === "Escape") {
                                          setEditingGroupId(null);
                                        }
                                      }}
                                      onChange={(e) => {
                                        setTempEditData((prev) => ({
                                          name: prev?.name || "",
                                          description: e.target.value,
                                        }));
                                      }}
                                    />
                                  </div>

                                  {/* Actions (Outside) */}
                                  <div className="relative z-50 flex flex-row items-center gap-1 pt-0.5">
                                    <button
                                      onClick={() => setEditingGroupId(null)}
                                      className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors backdrop-blur-sm"
                                      title="Cancel"
                                    >
                                      <X size={12} />
                                    </button>
                                    <button
                                      disabled={!isValid}
                                      onClick={() => {
                                        if (
                                          isValid &&
                                          onUpdateGroup &&
                                          tempEditData
                                        ) {
                                          onUpdateGroup(group.id, tempEditData);
                                          setEditingGroupId(null);
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
                                      <Check size={12} />
                                    </button>
                                  </div>
                                </>
                              );
                            })()
                          ) : (
                            // Display Mode
                            <>
                              {group.isHidden ? (
                                <EyeOff size={14} className="text-gray-600" />
                              ) : (
                                <FolderOpen
                                  size={14}
                                  className="text-accent-purple"
                                />
                              )}
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-white tracking-wide">
                                  {group.name}
                                </h3>
                                <span className="text-xs text-gray-500 font-mono ml-1">
                                  ({groupItems.length})
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
                                    const newGroups = [...library.colorGroups];
                                    [newGroups[index - 1], newGroups[index]] = [
                                      newGroups[index],
                                      newGroups[index - 1],
                                    ];
                                    onReorderGroups(newGroups);
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-white"
                                  title="Move Up"
                                >
                                  <ChevronUp size={14} />
                                </button>
                              )}
                              {index < library.colorGroups.length - 1 && (
                                <button
                                  onClick={() => {
                                    // Move Down - simplified using index
                                    const newGroups = [...library.colorGroups];
                                    [newGroups[index + 1], newGroups[index]] = [
                                      newGroups[index],
                                      newGroups[index + 1],
                                    ];
                                    onReorderGroups(newGroups);
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-white"
                                  title="Move Down"
                                >
                                  <ChevronDown size={14} />
                                </button>
                              )}
                            </div>
                          )}

                          {/* Edit/Delete Group Buttons */}
                          {onUpdateGroup && (
                            <>
                              <button
                                onClick={() =>
                                  onUpdateGroup(group.id, {
                                    isHidden: !group.isHidden,
                                  })
                                }
                                className="p-1.5 text-gray-500 hover:text-white"
                                title={
                                  group.isHidden ? "Show Group" : "Hide Group"
                                }
                              >
                                {group.isHidden ? (
                                  <Eye size={14} />
                                ) : (
                                  <EyeOff size={14} />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingGroupId(group.id);
                                  setTempEditData({
                                    name: group.name,
                                    description: group.description,
                                  });
                                }}
                                className="p-1.5 text-gray-500 hover:text-accent-cyan"
                                title="Rename Group"
                              >
                                <Edit3 size={14} />
                              </button>
                            </>
                          )}
                          {onDeleteGroup && (
                            <button
                              onClick={() => {
                                setConfirmState({
                                  isOpen: true,
                                  title: `Delete ${group.name}?`,
                                  message:
                                    "Are you sure you want to delete this group? Colors assigned to this group will be returned to Global.",
                                  variant: "danger",
                                  confirmLabel: "Delete Group",
                                  onConfirm: () => {
                                    if (onDeleteGroup) {
                                      onDeleteGroup(group.id);
                                    }
                                    closeConfirm();
                                  },
                                });
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-500"
                              title="Delete Group"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {onRemoveColors && (
                            <button
                              onClick={() => {
                                setConfirmState({
                                  isOpen: true,
                                  title: "Unfavorite All in Group",
                                  message: (
                                    <span className="text-gray-300">
                                      Are you sure you want to remove all colors
                                      assigned to{" "}
                                      <strong className="text-white">
                                        {group.name}
                                      </strong>{" "}
                                      from Favorites?
                                    </span>
                                  ),
                                  onConfirm: () => {
                                    if (onRemoveColors) {
                                      onRemoveColors(
                                        groupItems.map(
                                          (c: string | PresetColor) =>
                                            typeof c === "string"
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
                                  variant: "danger",
                                });
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-400 group-btn-heart disabled:opacity-30 disabled:hover:text-gray-500"
                              title="Unfavorite All in Group"
                              disabled={groupItems.length === 0}
                            >
                              <Heart
                                size={14}
                                className={
                                  groupItems.length > 0
                                    ? "fill-red-500 text-red-500"
                                    : ""
                                }
                              />
                            </button>
                          )}
                        </div>
                      </div>
                      {editingGroupId !== group.id && group.description && (
                        <p className="text-xs text-white/80 leading-relaxed border-b border-glass-stroke pb-2">
                          {group.description}
                        </p>
                      )}
                    </div>

                    {!group.isHidden && (
                      <div
                        className={`grid gap-3 transition-all duration-300 ${densityClass}`}
                      >
                        {groupItems.map(
                          (colorItem: string | PresetColor, idx: number) => {
                            const hexValue =
                              typeof colorItem === "string"
                                ? colorItem
                                : colorItem.value;
                            const baseLabel =
                              typeof colorItem === "string"
                                ? hexValue.toUpperCase()
                                : colorItem.name;
                            const finalName =
                              typeof colorItem === "string"
                                ? "Custom Color"
                                : colorItem.name;
                            const colorObject: PresetColor =
                              typeof colorItem === "string"
                                ? {
                                    name: baseLabel,
                                    value: hexValue,
                                  }
                                : colorItem;

                            return (
                              <SmartColorCard
                                key={`${hexValue}-${idx}`}
                                color={hexValue}
                                label={finalName}
                                name={finalName}
                                isFavorite={true}
                                draggable={
                                  isEditingLibrary && sortOption === "custom"
                                }
                                onDragStart={
                                  isEditingLibrary && sortOption === "custom"
                                    ? (e) =>
                                        handleDragStart(
                                          e,
                                          hexValue,
                                          group.id,
                                          idx
                                        )
                                    : undefined
                                }
                                onMoveRequest={() =>
                                  setColorToMove({
                                    value: hexValue,
                                    groupId: group.id,
                                  })
                                }
                                onDrop={
                                  isEditingLibrary
                                    ? (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.dataTransfer.dropEffect = "move";

                                        const colorHex =
                                          e.dataTransfer.getData("text/plain");
                                        // Robust Value-Based Reordering
                                        if (colorHex && onUpdateGroup) {
                                          // 1. Find indices based on VALUES, not drag indices
                                          const sourceIndex =
                                            group.colorIds.findIndex(
                                              (cid) =>
                                                cid.toUpperCase() ===
                                                colorHex.toUpperCase()
                                            );
                                          // Target is THIS card's index (idx)
                                          const targetIndex = idx;

                                          if (
                                            sourceIndex === -1 ||
                                            sourceIndex === targetIndex
                                          )
                                            return;

                                          // 2. Perform Move
                                          const newColorIds = [
                                            ...group.colorIds,
                                          ];
                                          const [moved] = newColorIds.splice(
                                            sourceIndex,
                                            1
                                          );
                                          newColorIds.splice(
                                            targetIndex,
                                            0,
                                            moved
                                          );

                                          // 3. Update Group
                                          onUpdateGroup(group.id, {
                                            colorIds: newColorIds,
                                          });
                                        }
                                      }
                                    : undefined
                                }
                                onDragOver={
                                  isEditingLibrary
                                    ? (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.dataTransfer.dropEffect = "move";
                                      }
                                    : undefined
                                }
                                onClick={() => {
                                  onLoadColor(hexValue);
                                  if (onInspectColor)
                                    onInspectColor(colorObject);
                                }}
                                onToggleFavorite={async () => {
                                  const res = await onToggleFavorite(
                                    hexValue,
                                    colorObject
                                  );
                                  if (res && res.action === "removed") {
                                    showToast(
                                      <>
                                        Removed{" "}
                                        <span className="text-accent-cyan">
                                          {(res.color as PresetColor).name ||
                                            hexValue}
                                        </span>{" "}
                                        from favorites
                                      </>
                                    );
                                  }
                                  if (
                                    res &&
                                    res.action === "added" &&
                                    (res.color as PresetColor).isAutoRenamed
                                  ) {
                                    showToast(
                                      <div className="flex flex-col">
                                        <span>
                                          Auto-renamed to{" "}
                                          <span className="text-accent-cyan">
                                            {(res.color as PresetColor).name}
                                          </span>
                                        </span>
                                        <span className="text-[10px] opacity-60 font-normal">
                                          Prevention: Duplicate Found
                                        </span>
                                      </div>
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
                    {groupItems.length === 0 && isEditingLibrary && (
                      <div className="border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 gap-2 bg-black/5 relative z-10 transition-colors hover:border-accent-cyan/30 hover:text-accent-cyan/70">
                        <FolderPlus size={24} className="opacity-50" />
                        <span className="text-xs font-mono uppercase tracking-wider">
                          Drop Colors Here
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* Move Color Modal/Menu */}
          {colorToMove && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setColorToMove(null)}
            >
              <div
                className="bg-bg-raised border border-glass-stroke rounded-xl shadow-2xl p-4 w-full max-w-xs space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-glass-stroke pb-2">
                  <h4 className="text-sm font-brand text-white">Move Color</h4>
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
                    disabled={colorToMove?.groupId === null}
                    onClick={() => {
                      if (onMoveColor && colorToMove)
                        onMoveColor(colorToMove.value, null); // Move to Global
                      setColorToMove(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between group ${
                      colorToMove?.groupId === null
                        ? "opacity-30 text-gray-500"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Globe size={12} className="text-accent-cyan" />
                      Global Favorites
                    </span>
                    {colorToMove?.groupId === null && (
                      <span className="text-[9px] opacity-50 uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </button>
                  {(library.colorGroups || []).map((g: ColorGroup) => (
                    <button
                      key={g.id}
                      disabled={colorToMove?.groupId === g.id}
                      onClick={() => {
                        if (onMoveColor) onMoveColor(colorToMove.value, g.id);
                        setColorToMove(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center gap-2 truncate ${
                        colorToMove?.groupId === g.id
                          ? "opacity-30 text-gray-500"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <FolderOpen
                        size={12}
                        className="text-accent-purple shrink-0"
                      />
                      <span className="truncate">{g.name}</span>
                      {colorToMove?.groupId === g.id && (
                        <span className="text-[9px] opacity-50 ml-auto uppercase tracking-wider">
                          Current
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Colors: Presets View */}
          {view === "colors" && activeSubTab === "presets" && (
            <div className="space-y-8">
              {!PRESET_LIBRARIES || PRESET_LIBRARIES.length === 0 ? (
                <p className="text-gray-500 italic">
                  No preset libraries found.
                </p>
              ) : (
                PRESET_LIBRARIES.map((preset) => {
                  const isFullyFavorited = preset.colors.every((c) =>
                    isFavorite(c.value)
                  );

                  // Logic: Sort Presets based on sortOption
                  // Note: We create a copy to avoid mutating the original preset constant
                  const sortedPresetColors = [...preset.colors].sort((a, b) => {
                    if (sortOption === "hue") {
                      // Use HSL hue for robust sorting
                      return (
                        colord(a.value).toHsl().h - colord(b.value).toHsl().h
                      );
                    }
                    if (sortOption === "name") {
                      return a.name.localeCompare(b.name);
                    }
                    return 0; // Default/Custom preserves original order (though Presets don't use Custom sort)
                  });

                  return (
                    <div key={preset.name} className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between group/library">
                          <div className="flex items-center gap-2">
                            <Book size={14} className="text-accent-cyan" />
                            <h4 className="text-sm font-bold text-white tracking-wide">
                              {preset.name}
                            </h4>
                            <span className="text-xs text-gray-500 font-mono ml-1">
                              ({preset.colors.length})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {onAddColors && (
                              <HeartToggle
                                isFavorite={isFullyFavorited}
                                onToggle={() =>
                                  handleBulkFavorite(preset.colors)
                                }
                                size={14}
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
                          {preset.description}
                        </p>
                      </div>

                      <div
                        className={`grid gap-3 transition-all duration-300 ${densityClass}`}
                      >
                        {sortedPresetColors.map((c, idx) => {
                          const finalName = c.name;
                          return (
                            <SmartColorCard
                              key={`${c.value}-${idx}`}
                              color={c.value}
                              label={finalName}
                              name={finalName}
                              isFavorite={isFavorite(c.value)}
                              onClick={() => {
                                onLoadColor(c.value);
                                if (onInspectColor) onInspectColor(c);
                              }}
                              onToggleFavorite={async () => {
                                const res = await onToggleFavorite(c.value, c);
                                if (
                                  res &&
                                  res.action === "added" &&
                                  (res.color as PresetColor).isAutoRenamed
                                ) {
                                  showToast(
                                    <div className="flex flex-col">
                                      <span>
                                        Auto-renamed to{" "}
                                        <span className="text-accent-cyan">
                                          {(res.color as PresetColor).name}
                                        </span>
                                      </span>
                                      <span className="text-[10px] opacity-60 font-normal">
                                        Prevention: Duplicate Found
                                      </span>
                                    </div>
                                  );
                                }
                              }}
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
  draggable,
  onDragStart,
  onMoveRequest,
  onDrop,
  onDragOver,
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
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onMoveRequest?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
}) => {
  const { isCopied, copy } = useCopyFeedback();
  const isDark = colord(color).isDark();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(color.toUpperCase(), color.toUpperCase());
  };

  return (
    <div
      className={`relative rounded-lg overflow-hidden h-14 shadow-sm transition-all hover:shadow-lg group/minicard ${
        isDark ? "border border-white/40" : "border border-black/20"
      } ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {/* Interactive Color Body */}
      <div
        className="absolute inset-0 cursor-pointer flex"
        onClick={onClick}
        title={`Click to load ${name}`}
      >
        {/* Color Swatch (Full Background) */}
        <div className="absolute inset-0 z-0">
          <svg className="w-full h-full">
            <rect x="0" y="0" width="100%" height="100%" fill={color} />
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
            className={`absolute top-1 right-1 flex items-center gap-0.5 z-20 opacity-0 group-hover/minicard:opacity-100 transition-opacity pointer-events-auto ${
              isDark ? "text-white" : "text-black/60"
            }`}
          >
            {/* Move Button (Only if draggable/editable) */}
            {onMoveRequest && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveRequest();
                }}
                className="p-1 rounded-full hover:bg-black/20 transition-colors"
                title="Move to Group"
              >
                <ArrowRight size={10} />
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-1 rounded-full hover:bg-black/10 transition-colors"
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
                  ? "text-white hover:bg-white/20"
                  : "text-black/80 hover:bg-black/10"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
