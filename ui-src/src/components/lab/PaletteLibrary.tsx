import { useState, useEffect, useMemo } from "react";
import {
  FolderOpen,
  Globe,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  FolderPlus,
  ArrowRightLeft,
  X,
  Check,
  ChevronsUp,
  ChevronsDown,
  Heart,
  ArrowRight,
} from "lucide-react";
import { PALETTE_LIBRARIES } from "../../data/palettePresets";
import { UiPreferences, PaletteGroup } from "../../hooks/useSoloistSystem";
import { colord } from "colord";
import { HeartToggle } from "../common/HeartToggle";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";

interface PaletteLibraryProps {
  library: any;
  onRemovePalette: (index: number) => void;
  onRemovePalettes?: (palettes: any[]) => void;
  onInspectPalette: (palette: any) => void;
  onCreateGroup?: (name: string, description: string) => void;
  onUpdateGroup?: (id: string, updates: Partial<PaletteGroup>) => void;
  onDeleteGroup?: (id: string) => void;
  onMovePalette?: (paletteName: string, targetGroupId: string | null) => void;
  onReorderGroups?: (newOrder: PaletteGroup[]) => void;
  uiPreferences?: UiPreferences;
  onUpdateUiPreferences?: (prefs: Partial<UiPreferences>) => void;
  onToggleFavorite?: (colors: string[], name: string) => void;
  onAddPalettes?: (palettes: any[]) => void;
}

export const PaletteLibrary = ({
  library,
  onRemovePalette,
  onRemovePalettes,
  onInspectPalette,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onMovePalette,
  onReorderGroups,
  uiPreferences,
  onUpdateUiPreferences,
  onToggleFavorite,
  onAddPalettes,
}: PaletteLibraryProps) => {
  const [activeSubTab, setActiveSubTab] = useState<"favorites" | "libraries">(
    "favorites"
  );
  const [density, setDensity] = useState(
    uiPreferences?.paletteGridDensity?.[
      activeSubTab === "favorites" ? "favorites" : "presets"
    ] || 2
  );

  const densityClasses = [
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-3",
    "grid-cols-4",
    "grid-cols-5",
    "grid-cols-6",
  ];
  const densityClass = densityClasses[Math.max(1, Math.min(6, density)) - 1];

  // Group Management State
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [paletteToMove, setPaletteToMove] = useState<{
    name: string;
    groupId: string | null;
  } | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [tempEditData, setTempEditData] = useState({
    name: "",
    description: "",
  });
  const [isEditingLibrary, setIsEditingLibrary] = useState(false);

  // Derived state for validation
  const isDuplicate = (library.paletteGroups || []).some(
    (g: any) => g.name.toLowerCase() === newGroupName.trim().toLowerCase()
  );

  // Confirmation Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    variant?: "danger";
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

  // Sync Density with Preferences
  useEffect(() => {
    if (uiPreferences && uiPreferences.paletteGridDensity) {
      const savedDensity =
        activeSubTab === "favorites"
          ? uiPreferences.paletteGridDensity.favorites
          : uiPreferences.paletteGridDensity.presets;

      if (savedDensity) {
        setDensity(savedDensity);
      }
    }
  }, [activeSubTab, uiPreferences]);

  const commitDensityChange = (newDensity: number) => {
    if (onUpdateUiPreferences && uiPreferences) {
      onUpdateUiPreferences({
        paletteGridDensity: {
          ...uiPreferences.paletteGridDensity,
          [activeSubTab === "favorites" ? "favorites" : "presets"]: newDensity,
        },
      } as Partial<UiPreferences>);
    }
  };

  // --- Palette Grouping Logic ---
  const { unassignedPalettes, groupPalettesMap } = useMemo(() => {
    const favorites = library?.palettes || [];
    const groups = library?.paletteGroups || [];

    // Map of palette Name -> Group ID
    const paletteToGroup = new Map<string, string>();
    groups.forEach((g: PaletteGroup) => {
      g.paletteIds.forEach((pId) => {
        paletteToGroup.set(pId, g.id);
      });
    });

    const unassigned: any[] = [];
    const grouped: Record<string, any[]> = {};

    favorites.forEach((p: any) => {
      const gId = paletteToGroup.get(p.name);
      if (gId) {
        if (!grouped[gId]) grouped[gId] = [];
        grouped[gId].push(p);
      } else {
        unassigned.push(p);
      }
    });

    return {
      unassignedPalettes: unassigned,
      groupPalettesMap: grouped,
    };
  }, [library?.palettes, library?.paletteGroups]);

  const handleDragStart = (e: React.DragEvent, paletteName: string) => {
    e.dataTransfer.setData("paletteName", paletteName);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetGroupId: string | null) => {
    e.preventDefault();
    const paletteName = e.dataTransfer.getData("paletteName");
    if (onMovePalette && paletteName) {
      onMovePalette(paletteName, targetGroupId);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sub-Navigation */}
      {/* Sub-Navigation Standardized Header */}
      <div className="flex flex-col gap-4 mb-6 border-b border-glass-stroke px-2">
        <div className="flex items-center justify-between">
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

          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2">
        <AnimatePresence mode="wait">
          {activeSubTab === "favorites" ? (
            <motion.div
              key="favorites-list"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-8 pb-12"
            >
              {/* --- Create Group UI --- */}
              {/* --- Create Group UI --- */}
              {isCreatingGroup &&
                (() => {
                  const isValid =
                    newGroupName.trim().length > 0 && !isDuplicate;

                  const handleCreate = () => {
                    if (isValid && onCreateGroup) {
                      onCreateGroup(newGroupName.trim(), newGroupDesc);
                      setIsCreatingGroup(false);
                      setNewGroupName("");
                      setNewGroupDesc("");
                      setIsEditingLibrary(true);
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

              {/* --- Global (Unassigned) --- */}
              <div
                className={`flex flex-col gap-3 group/section transition-all duration-300 ${
                  isEditingLibrary
                    ? "bg-accent-cyan/5 border border-accent-cyan/30 border-dashed rounded-xl p-4 relative overflow-hidden"
                    : "rounded-none p-0"
                }`}
              >
                {/* Blueprint Pattern Background (Edit Mode) */}
                {isEditingLibrary && (
                  <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-blueprint-grid" />
                )}

                <div className="space-y-1 relative z-10">
                  <div className="flex items-center justify-between group/section">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-accent-cyan" />
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        Global
                      </h3>
                      <span className="text-xs text-gray-500 font-mono ml-1">
                        ({unassignedPalettes.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onCreateGroup && (
                        <button
                          onClick={() => setIsCreatingGroup(true)}
                          className="p-1.5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
                          title="Create New Group"
                        >
                          <FolderPlus size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => setIsEditingLibrary(!isEditingLibrary)}
                        className={`p-1.5 rounded-full transition-all ${
                          isEditingLibrary
                            ? "text-accent-cyan bg-accent-cyan/10 ring-1 ring-accent-cyan/30"
                            : "text-gray-500 hover:text-white hover:bg-white/10"
                        }`}
                        title={
                          isEditingLibrary
                            ? "Done Organizing"
                            : "Organize Palettes and Groups"
                        }
                      >
                        <ArrowRightLeft size={14} />
                      </button>
                      {unassignedPalettes.length > 0 && onRemovePalettes && (
                        <button
                          onClick={() => {
                            setConfirmState({
                              isOpen: true,
                              title: "Remove Global Favorites",
                              message: (
                                <span className="text-gray-300">
                                  Are you sure you want to remove all palettes
                                  in{" "}
                                  <strong className="text-white">
                                    Favorites &gt; Global
                                  </strong>
                                  ?
                                </span>
                              ),
                              onConfirm: () => {
                                onRemovePalettes(unassignedPalettes);
                                closeConfirm();
                              },
                              variant: "danger",
                            });
                          }}
                          className="p-1.5 hover:bg-white/10 rounded-full text-red-500 hover:text-red-400 transition-colors"
                          title="Unfavorite All in Global"
                        >
                          <Heart
                            size={14}
                            className="fill-red-500 text-red-500"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed border-b border-glass-stroke pb-2">
                    Palettes saved here will always be active and accessible.
                  </p>
                </div>

                <div
                  className="grid gap-3 min-h-[40px] relative z-10"
                  style={{
                    gridTemplateColumns: `repeat(${density}, minmax(0, 1fr))`,
                  }}
                  onDragOver={(e) => {
                    if (isEditingLibrary) {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }
                  }}
                  onDrop={(e) => handleDrop(e, null)}
                >
                  {unassignedPalettes.map((p: any) => (
                    <div
                      key={p.name}
                      draggable={isEditingLibrary}
                      onDragStart={(e) => handleDragStart(e, p.name)}
                    >
                      <PaletteCard
                        name={p.name}
                        colors={p.colors}
                        onLoad={() => onInspectPalette(p)}
                        onDelete={() => {
                          const idx = library.palettes.findIndex(
                            (pal: any) => pal.name === p.name
                          );
                          if (idx !== -1) onRemovePalette(idx);
                        }}
                        onMoveRequest={() =>
                          setPaletteToMove({
                            name: p.name,
                            groupId: null,
                          })
                        }
                      />
                    </div>
                  ))}
                  {unassignedPalettes.length === 0 && (
                    <div className="col-span-full border-2 border-dashed border-white/10 rounded-lg p-10 flex flex-col items-center justify-center text-gray-500 gap-2 bg-black/5 relative z-10 transition-colors hover:border-accent-cyan/30 hover:text-accent-cyan/70">
                      <Globe size={32} className="opacity-30" />
                      <span className="text-xs font-mono uppercase tracking-wider">
                        Favorite Palettes to see them here
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* --- Group List --- */}
              {library?.paletteGroups?.map(
                (group: PaletteGroup, index: number) => {
                  const groupPalettes = groupPalettesMap[group.id] || [];
                  return (
                    <div
                      key={group.id}
                      className={`flex flex-col gap-3 group/section transition-all duration-300 ${
                        isEditingLibrary
                          ? "bg-accent-cyan/5 border border-accent-cyan/30 border-dashed rounded-xl p-4 relative overflow-hidden"
                          : "rounded-none p-0"
                      }`}
                    >
                      {/* Blueprint Pattern Background (Edit Mode) */}
                      {isEditingLibrary && (
                        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-blueprint-grid" />
                      )}

                      <div className="space-y-1 relative z-10">
                        <div className="flex items-center justify-between group/header mb-2 relative min-h-[28px]">
                          {/* Left Side: Edit Form or Display */}
                          <div className="flex-1 mr-2">
                            {editingGroupId === group.id ? (
                              // Edit Mode
                              (() => {
                                const isValid =
                                  tempEditData.name.trim().length > 0 &&
                                  (!isDuplicate ||
                                    tempEditData.name.trim().toLowerCase() ===
                                      group.name.toLowerCase());

                                return (
                                  <>
                                    <div className="relative">
                                      <input
                                        autoFocus
                                        type="text"
                                        value={tempEditData.name}
                                        onChange={(e) =>
                                          setTempEditData((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                          }))
                                        }
                                        className={`w-full bg-black/40 text-sm font-bold text-white px-2 py-1 rounded border focus:outline-none focus:ring-2 transition-all ${
                                          isValid
                                            ? "border-accent-cyan/50 focus:border-accent-cyan focus:ring-accent-cyan/20"
                                            : "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                        }`}
                                        placeholder="Group Name"
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            if (isValid && onUpdateGroup) {
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
                                      />
                                      {/* Inline Validation Message */}
                                      {!isValid && (
                                        <div className="absolute left-0 -bottom-5 text-[10px] text-red-400 font-medium whitespace-nowrap bg-black/90 px-1.5 py-0.5 rounded">
                                          {tempEditData.name.trim().length === 0
                                            ? "Name required"
                                            : "Name already exists"}
                                        </div>
                                      )}

                                      <textarea
                                        className="w-full bg-black/20 text-xs text-gray-400 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 resize-none shadow-inner font-sans leading-relaxed mt-2"
                                        defaultValue={group.description}
                                        placeholder="Add a description..."
                                        rows={2}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            !e.shiftKey
                                          ) {
                                            e.preventDefault();
                                            if (isValid && onUpdateGroup) {
                                              onUpdateGroup(
                                                group.id,
                                                tempEditData
                                              );
                                              setEditingGroupId(null);
                                            }
                                          }
                                        }}
                                        onChange={(e) => {
                                          setTempEditData((prev) => ({
                                            name: prev.name,
                                            description: e.target.value,
                                          }));
                                        }}
                                      />
                                    </div>

                                    {/* Edit Actions */}
                                    <div className="absolute right-0 top-0 flex flex-row items-center gap-1">
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
                                          if (isValid && onUpdateGroup) {
                                            onUpdateGroup(
                                              group.id,
                                              tempEditData
                                            );
                                            setEditingGroupId(null);
                                          }
                                        }}
                                        className={`p-1.5 rounded-full text-white transition-colors backdrop-blur-sm ${
                                          !isValid
                                            ? "bg-gray-500 opacity-50"
                                            : "bg-green-500/80 hover:bg-green-500"
                                        }`}
                                        title="Save"
                                      >
                                        <Check size={12} />
                                      </button>
                                    </div>
                                  </>
                                );
                              })()
                            ) : (
                              // Display Mode
                              <div className="flex items-center gap-2">
                                {group.isHidden ? (
                                  <EyeOff size={14} className="text-gray-600" />
                                ) : (
                                  <FolderOpen
                                    size={14}
                                    className="text-accent-purple"
                                  />
                                )}
                                <h4 className="text-sm font-bold text-white tracking-wide truncate">
                                  {group.name}
                                </h4>
                                <span className="text-xs text-gray-500 font-mono">
                                  ({(groupPalettesMap[group.id] || []).length})
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Right Side: Header Actions */}
                          <div className="flex items-center gap-1.5 h-8">
                            <div className="flex items-center gap-1 opacity-100 transition-opacity">
                              {isEditingLibrary && onReorderGroups && (
                                <div className="flex items-center border-r border-glass-stroke mr-1 pr-1">
                                  {index > 0 && (
                                    <div className="flex items-center">
                                      <button
                                        onClick={() => {
                                          const newGroups = [
                                            ...(library.paletteGroups || []),
                                          ];
                                          const [moved] = newGroups.splice(
                                            index,
                                            1
                                          );
                                          newGroups.unshift(moved);
                                          onReorderGroups(newGroups);
                                        }}
                                        className="p-1.5 text-gray-500 hover:text-white"
                                        title="Move to Top"
                                      >
                                        <ChevronsUp size={14} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const newGroups = [
                                            ...(library.paletteGroups || []),
                                          ];
                                          [
                                            newGroups[index - 1],
                                            newGroups[index],
                                          ] = [
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
                                    </div>
                                  )}
                                  {index <
                                    (library.paletteGroups?.length || 0) -
                                      1 && (
                                    <div className="flex items-center">
                                      <button
                                        onClick={() => {
                                          const newGroups = [
                                            ...(library.paletteGroups || []),
                                          ];
                                          [
                                            newGroups[index + 1],
                                            newGroups[index],
                                          ] = [
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
                                      <button
                                        onClick={() => {
                                          const newGroups = [
                                            ...(library.paletteGroups || []),
                                          ];
                                          const [moved] = newGroups.splice(
                                            index,
                                            1
                                          );
                                          newGroups.push(moved);
                                          onReorderGroups(newGroups);
                                        }}
                                        className="p-1.5 text-gray-500 hover:text-white"
                                        title="Move to Bottom"
                                      >
                                        <ChevronsDown size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
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
                                      group.isHidden
                                        ? "Show Group"
                                        : "Hide Group"
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
                                      setNewGroupName(group.name);
                                      setTempEditData({
                                        name: group.name,
                                        description: group.description || "",
                                      });
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-accent-cyan"
                                    title="Rename Group"
                                    disabled={editingGroupId === group.id}
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                </>
                              )}
                              {onDeleteGroup && (
                                <button
                                  onClick={() => onDeleteGroup(group.id)}
                                  className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                                  title="Delete Group"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                              {onRemovePalettes && (
                                <button
                                  disabled={groupPalettes.length === 0}
                                  onClick={() => {
                                    if (groupPalettes.length > 0) {
                                      setConfirmState({
                                        isOpen: true,
                                        title: `Remove ${group.name} Favorites`,
                                        message: (
                                          <span className="text-gray-300">
                                            Are you sure you want to remove all
                                            palettes in{" "}
                                            <strong className="text-white">
                                              {group.name}
                                            </strong>
                                            ?
                                          </span>
                                        ),
                                        onConfirm: () => {
                                          onRemovePalettes(groupPalettes);
                                          closeConfirm();
                                        },
                                        variant: "danger",
                                      });
                                    }
                                  }}
                                  className="p-1.5 rounded-full transition-colors hover:bg-white/10 text-gray-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-gray-500"
                                  title={
                                    groupPalettes.length === 0
                                      ? "No palettes to remove"
                                      : `Unfavorite All in ${group.name}`
                                  }
                                >
                                  <Heart
                                    size={14}
                                    className={
                                      groupPalettes.length > 0
                                        ? "fill-red-500 text-red-500"
                                        : ""
                                    }
                                  />
                                </button>
                              )}
                            </div>
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
                          className="grid gap-3 min-h-[40px] relative z-10"
                          style={{
                            gridTemplateColumns: `repeat(${density}, minmax(0, 1fr))`,
                          }}
                          onDragOver={(e) => {
                            if (isEditingLibrary) {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                            }
                          }}
                          onDrop={(e) => handleDrop(e, group.id)}
                        >
                          {groupPalettes.map((p: any, idx: number) => (
                            <div
                              key={p.name}
                              draggable={isEditingLibrary}
                              onDragStart={(e) => handleDragStart(e, p.name)}
                              onDragOver={(e) => {
                                if (isEditingLibrary) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  e.dataTransfer.dropEffect = "move";
                                }
                              }}
                              onDrop={(e) => {
                                if (!isEditingLibrary) return;
                                e.preventDefault();
                                e.stopPropagation();
                                const draggedPaletteName =
                                  e.dataTransfer.getData("paletteName");

                                // Specific logic for intra-group reordering
                                if (
                                  draggedPaletteName &&
                                  onUpdateGroup &&
                                  group.paletteIds
                                ) {
                                  const currentIds = [
                                    ...(group.paletteIds || []),
                                  ];
                                  const sourceIndex =
                                    currentIds.indexOf(draggedPaletteName);
                                  const targetIndex = idx;

                                  if (
                                    sourceIndex !== -1 &&
                                    sourceIndex !== targetIndex
                                  ) {
                                    // Reorder
                                    const [moved] = currentIds.splice(
                                      sourceIndex,
                                      1
                                    );
                                    currentIds.splice(targetIndex, 0, moved);
                                    onUpdateGroup(group.id, {
                                      paletteIds: currentIds,
                                    });
                                    return; // Handled
                                  }
                                }

                                // Fallback to inter-group move if source not in this group
                                if (onMovePalette) {
                                  handleDrop(e, group.id);
                                }
                              }}
                            >
                              <PaletteCard
                                name={p.name}
                                colors={p.colors}
                                onLoad={() => onInspectPalette(p)}
                                onDelete={() => {
                                  const idx = library.palettes.findIndex(
                                    (pal: any) => pal.name === p.name
                                  );
                                  if (idx !== -1) onRemovePalette(idx);
                                }}
                                onMoveRequest={() =>
                                  setPaletteToMove({
                                    name: p.name,
                                    groupId: group.id,
                                  })
                                }
                              />
                            </div>
                          ))}
                          {isEditingLibrary && groupPalettes.length === 0 && (
                            <div className="col-span-full border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 gap-2 bg-black/5 relative z-10 transition-colors hover:border-accent-cyan/30 hover:text-accent-cyan/70">
                              <FolderPlus size={24} className="opacity-50" />
                              <span className="text-xs font-mono uppercase tracking-wider">
                                Drop Palettes Here
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </motion.div>
          ) : (
            <motion.div
              key="libraries-list"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-8 pb-12"
            >
              {(PALETTE_LIBRARIES || []).map((lib: any) => (
                <div key={lib.id} className="space-y-4">
                  <div className="flex items-center justify-between group/header">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={14} className="text-accent-purple" />
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        {lib.name}
                      </h3>
                      <span className="text-xs text-gray-500 font-mono ml-1">
                        ({lib.palettes.length})
                      </span>
                    </div>

                    {/* Bulk Action */}
                    {onAddPalettes &&
                      onRemovePalettes &&
                      (() => {
                        const allFav = lib.palettes.every((p: any) =>
                          library.palettes?.some(
                            (saved: any) => saved.name === p.name
                          )
                        );

                        return (
                          <HeartToggle
                            isFavorite={allFav}
                            onToggle={() => {
                              if (allFav) {
                                // Remove All Logic
                                const toRemove = library.palettes.filter(
                                  (saved: any) =>
                                    lib.palettes.some(
                                      (p: any) => p.name === saved.name
                                    )
                                );
                                if (onRemovePalettes)
                                  onRemovePalettes(toRemove);
                              } else {
                                // Add Logic
                                const toAdd = lib.palettes.filter(
                                  (p: any) =>
                                    !library.palettes?.some(
                                      (saved: any) => saved.name === p.name
                                    )
                                );
                                if (onAddPalettes) onAddPalettes(toAdd);
                              }
                            }}
                            size={14}
                            className={
                              allFav
                                ? "scale-110"
                                : "text-gray-500 hover:text-red-500 hover:scale-110"
                            }
                          />
                        );
                      })()}
                  </div>
                  <p className="text-xs text-gray-400">{lib.description}</p>

                  <div className={`grid gap-4 ${densityClass}`}>
                    {lib.palettes.map((p: any, idx: number) => {
                      const isFav =
                        library.palettes?.some(
                          (saved: any) => saved.name === p.name
                        ) || false;
                      return (
                        <PaletteCard
                          key={`${p.name}-${idx}`}
                          name={p.name}
                          colors={p.colors}
                          onLoad={() => {
                            // Logic to load/inspect
                            onInspectPalette(p);
                          }}
                          isFavorite={isFav}
                          onToggleFavorite={() => {
                            if (onToggleFavorite) {
                              onToggleFavorite(p.colors, p.name);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Move Palette Modal */}
      {paletteToMove && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPaletteToMove(null)}
        >
          <div
            className="bg-bg-raised border border-glass-stroke rounded-xl shadow-2xl p-4 w-full max-w-xs space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-glass-stroke pb-2">
              <h4 className="text-sm font-brand text-white">Move Palette</h4>
              <button
                onClick={() => setPaletteToMove(null)}
                className="text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
              <div className="text-[10px] uppercase font-mono text-gray-500 mb-1 px-2">
                Available Groups
              </div>
              <button
                disabled={paletteToMove.groupId === null}
                onClick={() => {
                  if (onMovePalette) onMovePalette(paletteToMove.name, null);
                  setPaletteToMove(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between group ${
                  paletteToMove.groupId === null
                    ? "opacity-30 text-gray-500"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Globe size={12} className="text-accent-cyan" />
                  Global Favorites
                </span>
                {paletteToMove.groupId === null && (
                  <span className="text-[9px] opacity-50 uppercase tracking-wider">
                    Current
                  </span>
                )}
              </button>

              {(library.paletteGroups || []).map((g: PaletteGroup) => (
                <button
                  key={g.id}
                  disabled={paletteToMove.groupId === g.id}
                  onClick={() => {
                    if (onMovePalette) onMovePalette(paletteToMove.name, g.id);
                    setPaletteToMove(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center gap-2 truncate ${
                    paletteToMove.groupId === g.id
                      ? "opacity-30 text-gray-500"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <FolderOpen
                    size={12}
                    className="text-accent-purple shrink-0"
                  />
                  <span className="truncate">{g.name}</span>
                  {paletteToMove.groupId === g.id && (
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

      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
        variant={confirmState.variant}
        confirmLabel={confirmState.confirmLabel}
      />
    </div>
  );
};

// --- Sub-components ---

interface PaletteCardProps {
  name: string;
  colors: string[];
  onLoad: () => void;
  onDelete?: () => void;
  onMoveRequest?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const PaletteCard = ({
  name,
  colors,
  onLoad,
  onDelete,
  onMoveRequest,
  isFavorite = false,
  onToggleFavorite,
}: PaletteCardProps) => {
  // Use the first color for contrast logic of the name if helpful,
  // or just use a strong default since it spans multiple.
  const isFirstDark = colord(colors[0] || "#000").isDark();

  return (
    <div
      className={`group relative h-14 rounded-lg overflow-hidden border shadow-sm transition-all hover:shadow-lg cursor-pointer bg-bg-surface ${
        isFirstDark ? "border-white/40" : "border-black/20"
      }`}
      onClick={onLoad}
    >
      {/* Background Color Bars */}
      <div className="absolute inset-0 flex">
        {colors.map((color, idx) => {
          const isDark = colord(color).isDark();
          return (
            <div key={idx} className="flex-1 h-full relative overflow-hidden">
              <svg className="absolute inset-0 w-full h-full">
                <rect width="100%" height="100%" fill={color} />
              </svg>
              {/* Divider */}
              {idx < colors.length - 1 && (
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/20 z-10" />
              )}

              {/* HEX Value (Bottom Left of each cell) */}
              <div className="absolute bottom-1 left-1.5 pointer-events-none">
                <span
                  className={`text-[8px] font-mono opacity-80 whitespace-nowrap ${
                    isDark ? "text-white/80" : "text-black/70"
                  }`}
                >
                  {color.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 p-2 pointer-events-none">
        {/* Actions Row (Top Right) */}
        <div
          className={`absolute top-1 right-1 flex items-center gap-0.5 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            colord(colors[colors.length - 1] || "#000").isDark()
              ? "text-white"
              : "text-black/60"
          }`}
        >
          {/* Move/Folder Icon - Only if onMoveRequest exists */}
          {onMoveRequest && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveRequest();
              }}
              className="p-1 rounded-full hover:bg-black/10 transition-colors"
              title="Move to Group"
            >
              <ArrowRight size={10} />
            </button>
          )}

          {/* Heart/Favorite Toggle */}
          {onToggleFavorite && (
            <HeartToggle
              isFavorite={isFavorite}
              onToggle={onToggleFavorite}
              className={`p-1 rounded-full hover:bg-black/10 transition-colors ${
                isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-400"
              }`}
              size={12}
            />
          )}

          {/* Delete Action (Favorites View) */}
          {onDelete && !onToggleFavorite && (
            <HeartToggle
              isFavorite={true}
              onToggle={onDelete}
              className={`p-1 rounded-full hover:bg-black/10 transition-colors text-red-500`}
              size={12}
            />
          )}
        </div>

        {/* Middle Row: Palette Name (Left, Full Width) */}
        <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex items-center pr-6">
          <span
            className={`text-[9px] font-bold uppercase tracking-wider truncate drop-shadow-md pb-0.5 ${
              isFirstDark ? "text-white/90" : "text-black/80"
            }`}
            title={name}
          >
            {name}
          </span>
        </div>
        {/* Bottom Row: Move/Folder Icon (Left) - Only if onMoveRequest exists */}
      </div>

      {/* Action Overlay */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
    </div>
  );
};
