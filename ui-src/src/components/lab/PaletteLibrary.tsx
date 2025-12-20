import { useState, useEffect, useMemo, useRef } from "react";
import {
  FolderOpen,
  Globe,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Copy,
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
import { useCopyFeedback } from "../../hooks/useCopyFeedback";
import {
  setOrganizeDragCursorActive,
  createOrganizeDragGhost,
  positionOrganizeDragGhost,
} from "../../utils/organizeDnD";

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
  onReorderPalettes?: (newOrder: any[]) => void;
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
  onReorderPalettes,
  uiPreferences,
  onUpdateUiPreferences,
  onToggleFavorite,
  onAddPalettes,
}: PaletteLibraryProps) => {
  const [activeSubTab, setActiveSubTab] = useState<"favorites" | "libraries">(
    "favorites"
  );

  type SortOption = "custom" | "name" | "colors-asc" | "sat-asc";
  const [sortOption, setSortOption] = useState<SortOption>("custom");

  type LibrarySortOption = "custom" | "name" | "sat-asc" | "colors-asc";
  const [librarySortOption, setLibrarySortOption] =
    useState<LibrarySortOption>("name");

  // Libraries "Custom" mode (hide/reorder built-in libraries + individual preset palettes)
  const [isEditingPresetLibraries, setIsEditingPresetLibraries] =
    useState(false);

  // Auto-exit libraries customization when leaving Libraries tab or switching sort away from Custom.
  useEffect(() => {
    if (activeSubTab !== "libraries" || librarySortOption !== "custom") {
      setIsEditingPresetLibraries(false);
    }
  }, [activeSubTab, librarySortOption]);

  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  const getPaletteColorCount = (p: any) =>
    Array.isArray(p?.colors) ? p.colors.length : 0;

  // Average saturation (0..1) across all colors in the palette.
  // Uses HSL saturation as a pragmatic proxy for "intensity".
  const getPaletteAvgSaturation = (p: any) => {
    const colors: unknown = p?.colors;
    if (!Array.isArray(colors) || colors.length === 0) return 0;
    let sum = 0;
    let n = 0;
    for (const c of colors) {
      if (typeof c !== "string") continue;
      const parsed = colord(c);
      if (!parsed.isValid()) continue;
      sum += parsed.toHsl().s;
      n += 1;
    }
    return n > 0 ? sum / n : 0;
  };

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

  const openCreateGroup = () => {
    // Ensure we never leak inline-edit values into create flow.
    setEditingGroupId(null);
    setTempEditData({ name: "", description: "" });
    setNewGroupName("");
    setNewGroupDesc("");
    setIsCreatingGroup(true);
  };

  // Pointer-based organize drag (replaces native HTML5 drag so cursor can stay grabbing)
  // Organize can be enabled in any sort.
  // - Custom: allow reordering within a collection
  // - Non-custom: move-only (between groups/global), no reordering
  const canReorderInCurrentSort = sortOption === "custom";
  const isPointerOrganizeEnabled = isEditingLibrary;
  const isPointerDraggingRef = useRef(false);
  const pointerDragRef = useRef<{
    pointerId: number | null;
    sourceName: string;
    sourceGroupId: string | null;
    paletteColors: string[];
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

      // Same collection => reorder
      if (targetGroupId === st.sourceGroupId) {
        // Move-only mode: do nothing when dropping within the same collection.
        if (!canReorderInCurrentSort) {
          pointerDragRef.current = null;
          window.setTimeout(() => {
            isPointerDraggingRef.current = false;
          }, 0);
          return;
        }
        // Global reorder (uses library.palettes order)
        if (targetGroupId === null && onReorderPalettes) {
          const allPalettes = [...(library?.palettes || [])];
          const sourceIdx = allPalettes.findIndex(
            (p: any) => String(p?.name ?? "") === String(st.sourceName)
          );

          const targetId = st.target.id;
          const targetIdx =
            targetId !== undefined
              ? allPalettes.findIndex(
                  (p: any) => String(p?.name ?? "") === String(targetId)
                )
              : allPalettes.length - 1;

          if (sourceIdx !== -1 && targetIdx !== -1 && sourceIdx !== targetIdx) {
            const [moved] = allPalettes.splice(sourceIdx, 1);
            allPalettes.splice(targetIdx, 0, moved);
            onReorderPalettes(allPalettes);
          }
        }

        // Group reorder (uses group.paletteIds)
        if (targetGroupId !== null && onUpdateGroup) {
          const group = (
            library?.paletteGroups as PaletteGroup[] | undefined
          )?.find((g) => g.id === targetGroupId);
          const ids = [...(group?.paletteIds || [])];
          const sourceIndex = ids.findIndex(
            (pid) => String(pid) === String(st.sourceName)
          );

          const targetId = st.target.id;
          const targetIndex =
            targetId !== undefined
              ? ids.findIndex((pid) => String(pid) === String(targetId))
              : ids.length - 1;

          if (
            sourceIndex !== -1 &&
            targetIndex !== -1 &&
            sourceIndex !== targetIndex
          ) {
            const [moved] = ids.splice(sourceIndex, 1);
            ids.splice(targetIndex, 0, moved);
            onUpdateGroup(targetGroupId, { paletteIds: ids });
          }
        }
      } else {
        // Cross-group move
        if (onMovePalette) {
          onMovePalette(st.sourceName, targetGroupId);
        }
      }
    }

    pointerDragRef.current = null;
    window.setTimeout(() => {
      isPointerDraggingRef.current = false;
    }, 0);
  };

  const startPointerOrganizeDrag = (
    e: React.PointerEvent,
    paletteName: string,
    sourceGroupId: string | null,
    paletteColors: string[]
  ) => {
    if (!isPointerOrganizeEnabled) return;
    if (e.button !== 0) return;

    const target = e.target as HTMLElement | null;
    if (
      target?.closest?.("button, a, input, textarea, select, [role='button']")
    ) {
      return;
    }

    // Prevent text selection / native gestures while we begin an organize drag.
    e.preventDefault();

    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();

    el.setPointerCapture(e.pointerId);

    pointerDragRef.current = {
      pointerId: e.pointerId,
      sourceName: paletteName,
      sourceGroupId,
      paletteColors,
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

        const width = Math.max(160, Math.ceil(rect.width || 260));
        const height = Math.max(56, Math.ceil(rect.height || 56));
        const ghost = createOrganizeDragGhost(
          {
            kind: "palette",
            title: st.sourceName,
            colors: st.paletteColors || [],
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
            groupRaw === undefined || groupRaw === "null" ? null : groupRaw;
          const id = targetEl.dataset.organizeId;
          const isDropzone = targetEl.dataset.organizeDropzone === "1";
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
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUpOrCancel);
      window.removeEventListener("pointercancel", onUpOrCancel);
      endPointerDrag();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUpOrCancel);
    window.addEventListener("pointercancel", onUpOrCancel);
  };

  // Organize is only supported in Favorites.
  useEffect(() => {
    if (activeSubTab !== "favorites" && isEditingLibrary) {
      setIsEditingLibrary(false);
    }
  }, [activeSubTab, isEditingLibrary]);

  // Close the sort menu when switching tabs
  useEffect(() => {
    setIsSortMenuOpen(false);
  }, [activeSubTab]);

  // Close sort menu on outside-click / Escape (polish parity with Color Library)
  useEffect(() => {
    if (!isSortMenuOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const el = sortMenuRef.current;
      if (el && !el.contains(target)) {
        setIsSortMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSortMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isSortMenuOpen]);

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

  type PalettePresetCustom = NonNullable<UiPreferences["palettePresetCustom"]>;

  const updatePalettePresetCustom = (updates: Partial<PalettePresetCustom>) => {
    if (!onUpdateUiPreferences) return;
    onUpdateUiPreferences({
      palettePresetCustom: {
        ...(uiPreferences?.palettePresetCustom || {}),
        ...updates,
      },
    } as Partial<UiPreferences>);
  };

  const normalizeOrder = (base: string[], preferred?: string[]) => {
    const baseSet = new Set(base);
    const preferredList = Array.isArray(preferred) ? preferred : [];
    const next: string[] = [];

    for (const id of preferredList) {
      if (baseSet.has(id) && !next.includes(id)) next.push(id);
    }
    for (const id of base) {
      if (!next.includes(id)) next.push(id);
    }
    return next;
  };

  // --- Palette Grouping Logic ---
  const { unassignedPalettes, groupPalettesMap } = useMemo(() => {
    const palettes: any[] = library?.palettes || [];
    const groups: PaletteGroup[] = library?.paletteGroups || [];

    // Build fast lookup maps for palette objects by name (exact + case-insensitive)
    const paletteByName = new Map<string, any>();
    const paletteByNameCI = new Map<string, any>();
    for (const p of palettes) {
      if (!p?.name) continue;
      paletteByName.set(p.name, p);
      paletteByNameCI.set(String(p.name).toLowerCase(), p);
    }

    // Track which palettes are assigned to any group (case-insensitive)
    const groupedNamesCI = new Set<string>();
    for (const g of groups) {
      for (const pid of g.paletteIds || []) {
        groupedNamesCI.add(String(pid).toLowerCase());
      }
    }

    // Global / unassigned palettes are those not referenced by any group
    const unassigned = palettes.filter(
      (p) => !groupedNamesCI.has(String(p?.name ?? "").toLowerCase())
    );

    // Map groupId -> palettes resolved in EXACT paletteIds order
    const grouped: Record<string, any[]> = {};
    for (const g of groups) {
      grouped[g.id] = (g.paletteIds || [])
        .map((pid) => {
          const exact = paletteByName.get(pid);
          if (exact) return exact;
          return paletteByNameCI.get(String(pid).toLowerCase());
        })
        .filter(Boolean);
    }

    // Optional view sort (does not mutate source arrays)
    if (sortOption !== "custom") {
      const byName = (a: any, b: any) =>
        String(a?.name ?? "").localeCompare(String(b?.name ?? ""));

      const byColorsAsc = (a: any, b: any) => {
        const d = getPaletteColorCount(a) - getPaletteColorCount(b);
        return d !== 0 ? d : byName(a, b);
      };

      const bySatAsc = (a: any, b: any) => {
        const d = getPaletteAvgSaturation(a) - getPaletteAvgSaturation(b);
        return d !== 0 ? d : byName(a, b);
      };

      const compare =
        sortOption === "name"
          ? byName
          : sortOption === "colors-asc"
          ? byColorsAsc
          : bySatAsc;

      const sortedUnassigned = [...unassigned].sort(compare);
      const sortedGrouped: Record<string, any[]> = {};
      for (const gid of Object.keys(grouped)) {
        sortedGrouped[gid] = [...grouped[gid]].sort(compare);
      }

      return {
        unassignedPalettes: sortedUnassigned,
        groupPalettesMap: sortedGrouped,
      };
    }

    return { unassignedPalettes: unassigned, groupPalettesMap: grouped };
  }, [
    library?.palettes,
    library?.paletteGroups,
    sortOption,
    getPaletteColorCount,
    getPaletteAvgSaturation,
  ]);

  const unfavoritePaletteByName = (paletteName: string) => {
    const idx = (library?.palettes || []).findIndex(
      (p: any) => p?.name === paletteName
    );
    if (idx !== -1) onRemovePalette(idx);
  };

  const isPresetLibrariesCustom =
    activeSubTab === "libraries" && librarySortOption === "custom";
  const isCustomizingPresetLibraries =
    isPresetLibrariesCustom && isEditingPresetLibraries;

  const presetCustom = uiPreferences?.palettePresetCustom;
  const basePresetLibraries: any[] = PALETTE_LIBRARIES || [];
  const basePresetLibraryIds = basePresetLibraries.map((l: any) =>
    String(l?.id ?? "")
  );
  const presetLibraryById = new Map<string, any>(
    basePresetLibraries.map((l: any) => [String(l?.id ?? ""), l])
  );
  const orderedPresetLibraryIds =
    librarySortOption === "custom"
      ? normalizeOrder(basePresetLibraryIds, presetCustom?.libraryOrder)
      : basePresetLibraryIds;
  const orderedPresetLibraries = orderedPresetLibraryIds
    .map((id) => presetLibraryById.get(id))
    .filter(Boolean);

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
            {/* Sort + Organize group */}
            <div className="flex items-center gap-2 pb-2 border-l border-white/10 pl-4 ml-2">
              {/* Organize (always visible; disabled in Libraries unless sort is Custom) */}
              <div className="flex items-center">
                {(() => {
                  const isLibraries = activeSubTab === "libraries";
                  const isDisabled =
                    isLibraries && librarySortOption !== "custom";
                  const isActive =
                    activeSubTab === "favorites"
                      ? isEditingLibrary
                      : isEditingPresetLibraries;

                  const label =
                    activeSubTab === "favorites"
                      ? isEditingLibrary
                        ? "Done Organizing"
                        : sortOption === "custom"
                        ? "Organize Palettes and Groups"
                        : "Organize Palettes and Groups (Move only)"
                      : isDisabled
                      ? "Switch Sort to Custom to customize libraries"
                      : isEditingPresetLibraries
                      ? "Done Customizing"
                      : "Customize Libraries";

                  return (
                    <button
                      disabled={isDisabled}
                      onClick={() => {
                        if (isDisabled) return;
                        if (activeSubTab === "favorites") {
                          setIsEditingLibrary((v) => !v);
                        } else {
                          setIsEditingPresetLibraries((v) => !v);
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
                      <ArrowRightLeft size={14} />
                    </button>
                  );
                })()}
              </div>

              <span className="text-[10px] text-gray-500 font-mono uppercase">
                Sort
              </span>
              <div className="relative" ref={sortMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsSortMenuOpen((v) => !v)}
                  className="w-28 appearance-none bg-black/20 border border-white/10 rounded px-2 py-0.5 text-[10px] text-gray-300 font-mono uppercase focus:outline-none focus:border-accent-cyan pr-6 hover:bg-white/5 transition-colors flex items-center gap-2"
                  aria-label="Sort order"
                  aria-haspopup="menu"
                >
                  {activeSubTab === "favorites"
                    ? sortOption === "custom"
                      ? "Custom"
                      : sortOption === "name"
                      ? "Name (A-Z)"
                      : sortOption === "sat-asc"
                      ? "SAT (L-H)"
                      : "SIZE (S-L)"
                    : librarySortOption === "custom"
                    ? "Custom"
                    : librarySortOption === "name"
                    ? "Name (A-Z)"
                    : librarySortOption === "sat-asc"
                    ? "SAT (L-H)"
                    : "SIZE (S-L)"}
                </button>

                {isSortMenuOpen && (
                  <div className="absolute right-0 mt-1 bg-bg-raised border border-glass-stroke rounded shadow-monolith z-50 min-w-max">
                    {activeSubTab === "favorites" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSortOption("custom");
                            setIsSortMenuOpen(false);
                          }}
                          className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 transition-colors"
                        >
                          Custom
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSortOption("name");
                            setIsSortMenuOpen(false);
                          }}
                          className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 transition-colors"
                        >
                          Name (A-Z)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSortOption("sat-asc");
                            setIsSortMenuOpen(false);
                          }}
                          className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 transition-colors"
                        >
                          SAT (L-H)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSortOption("colors-asc");
                            setIsSortMenuOpen(false);
                          }}
                          className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 transition-colors"
                        >
                          SIZE (S-L)
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setLibrarySortOption("custom");
                            setIsSortMenuOpen(false);
                          }}
                          className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 transition-colors"
                        >
                          Custom
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLibrarySortOption("name");
                            setIsSortMenuOpen(false);
                          }}
                          className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 transition-colors"
                        >
                          Name (A-Z)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLibrarySortOption("sat-asc");
                            setIsSortMenuOpen(false);
                          }}
                          className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 transition-colors"
                        >
                          SAT (L-H)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLibrarySortOption("colors-asc");
                            setIsSortMenuOpen(false);
                          }}
                          className="block w-full text-left px-3 py-1.5 text-[10px] text-gray-300 font-mono uppercase hover:bg-white/10 transition-colors"
                        >
                          SIZE (S-L)
                        </button>
                      </>
                    )}
                  </div>
                )}

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
                      // Creating a group usually implies organizing next.
                      setSortOption("custom");
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
                          onClick={openCreateGroup}
                          className="p-1.5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
                          title="Create New Group"
                        >
                          <FolderPlus size={14} />
                        </button>
                      )}
                      {unassignedPalettes.length > 0 && onRemovePalettes && (
                        <button
                          onClick={() => {
                            setConfirmState({
                              isOpen: true,
                              title: "Remove Global Favorites",
                              message: (
                                <span className="text-gray-300">
                                  Are you sure you want to remove all palettes
                                  saved to Global from Favorites?
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
                  className={`grid gap-3 min-h-[40px] relative z-10 ${densityClass}`}
                  data-organize-dropzone={
                    isPointerOrganizeEnabled ? "1" : undefined
                  }
                  data-organize-group={
                    isPointerOrganizeEnabled ? "null" : undefined
                  }
                >
                  {unassignedPalettes.map((p: any) => (
                    <div
                      key={p.name}
                      className={
                        isPointerOrganizeEnabled
                          ? "cursor-grab active:cursor-grabbing touch-none"
                          : undefined
                      }
                      data-organize-drop={
                        isPointerOrganizeEnabled ? "1" : undefined
                      }
                      data-organize-group={
                        isPointerOrganizeEnabled ? "null" : undefined
                      }
                      data-organize-id={
                        isPointerOrganizeEnabled ? String(p.name) : undefined
                      }
                      onPointerDown={
                        isPointerOrganizeEnabled
                          ? (e) =>
                              startPointerOrganizeDrag(
                                e,
                                p.name,
                                null,
                                p.colors
                              )
                          : undefined
                      }
                      onClickCapture={(e) => {
                        if (isPointerDraggingRef.current) {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                    >
                      <PaletteCard
                        name={p.name}
                        colors={p.colors}
                        onLoad={() => onInspectPalette(p)}
                        isOrganizing={isPointerOrganizeEnabled}
                        isFavorite={true}
                        onToggleFavorite={() => unfavoritePaletteByName(p.name)}
                        onMoveRequest={() =>
                          setPaletteToMove({
                            name: p.name,
                            groupId: null,
                          })
                        }
                      />
                    </div>
                  ))}
                  {unassignedPalettes.length === 0 &&
                    (isEditingLibrary ? (
                      <div
                        className="col-span-full border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 gap-2 bg-black/5 relative z-10 transition-colors hover:border-accent-cyan/30 hover:text-accent-cyan/70"
                        data-organize-dropzone={
                          isPointerOrganizeEnabled ? "1" : undefined
                        }
                        data-organize-group={
                          isPointerOrganizeEnabled ? "null" : undefined
                        }
                      >
                        <Globe size={24} className="opacity-50" />
                        <span className="text-xs font-mono uppercase tracking-wider">
                          Drop Palettes Here
                        </span>
                      </div>
                    ) : (
                      <p className="col-span-full text-gray-600 text-xs italic">
                        No global favorites.
                      </p>
                    ))}
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
                        group.isHidden ? "opacity-50" : ""
                      } ${
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
                          <div className="flex items-start gap-2 flex-1 relative">
                            {editingGroupId === group.id ? (
                              // Edit Mode
                              (() => {
                                const currentName = tempEditData.name;
                                const isDuplicateName = (
                                  (library?.paletteGroups ||
                                    []) as PaletteGroup[]
                                ).some(
                                  (g) =>
                                    g.id !== group.id &&
                                    g.name.trim().toLowerCase() ===
                                      currentName.trim().toLowerCase()
                                );
                                const isValid =
                                  currentName.trim().length > 0 &&
                                  !isDuplicateName;

                                return (
                                  <>
                                    <div className="fixed inset-0 z-40 bg-transparent cursor-default" />
                                    <div className="relative z-50 flex flex-col gap-1 flex-1">
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
                                          className={`bg-black/20 text-white text-sm font-sans px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 w-full shadow-lg transition-colors ${
                                            isValid
                                              ? "border-white/10 focus:border-accent-cyan focus:ring-accent-cyan/20"
                                              : "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                                          }`}
                                          placeholder="Group Name"
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              e.preventDefault();
                                              if (isValid && onUpdateGroup) {
                                                onUpdateGroup(
                                                  group.id,
                                                  tempEditData
                                                );
                                                setEditingGroupId(null);
                                              }
                                            } else if (e.key === "Escape") {
                                              e.preventDefault();
                                              setEditingGroupId(null);
                                            }
                                          }}
                                        />
                                        {!isValid && (
                                          <div className="absolute top-full left-0 mt-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded shadow-lg z-[60]">
                                            {tempEditData.name.trim().length ===
                                            0
                                              ? "Name is required."
                                              : "Group name must be unique."}
                                          </div>
                                        )}
                                      </div>

                                      <textarea
                                        className="w-full bg-black/20 text-xs text-gray-400 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 resize-none shadow-inner font-sans leading-relaxed mt-2"
                                        value={tempEditData.description}
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
                                          } else if (e.key === "Escape") {
                                            e.preventDefault();
                                            setEditingGroupId(null);
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
                                        title={
                                          !isValid
                                            ? isDuplicateName
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
                                  <h4 className="text-sm font-bold text-white tracking-wide truncate">
                                    {group.name}
                                  </h4>
                                  <span className="text-xs text-gray-500 font-mono">
                                    ({(groupPalettesMap[group.id] || []).length}
                                    )
                                  </span>
                                </div>
                              </>
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
                                      <EyeOff size={14} />
                                    ) : (
                                      <Eye size={14} />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingGroupId(group.id);
                                      setTempEditData({
                                        name: group.name,
                                        description: group.description || "",
                                      });
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-accent-cyan"
                                    title="Edit Group Name and Description"
                                    disabled={editingGroupId === group.id}
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
                                      message: (
                                        <span className="text-gray-300">
                                          Are you sure you want to delete this
                                          group? Palettes assigned to this group
                                          will be returned to{" "}
                                          <strong className="text-white">
                                            Global
                                          </strong>
                                          .
                                        </span>
                                      ),
                                      variant: "danger",
                                      confirmLabel: "Delete Group",
                                      onConfirm: () => {
                                        onDeleteGroup(group.id);
                                        closeConfirm();
                                      },
                                    });
                                  }}
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
                                        title: "Unfavorite All in Group",
                                        message: (
                                          <span className="text-gray-300">
                                            Are you sure you want to remove all
                                            palettes assigned to{" "}
                                            <strong className="text-white">
                                              {group.name}
                                            </strong>{" "}
                                            from Favorites?
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
                                      ? "No Palettes to Remove"
                                      : "Unfavorite All in Group"
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
                          className={`grid gap-3 min-h-[40px] relative z-10 ${densityClass}`}
                          data-organize-dropzone={
                            isPointerOrganizeEnabled ? "1" : undefined
                          }
                          data-organize-group={
                            isPointerOrganizeEnabled ? group.id : undefined
                          }
                        >
                          {groupPalettes.map((p: any) => (
                            <div
                              key={p.name}
                              className={
                                isPointerOrganizeEnabled
                                  ? "cursor-grab active:cursor-grabbing touch-none"
                                  : undefined
                              }
                              data-organize-drop={
                                isPointerOrganizeEnabled ? "1" : undefined
                              }
                              data-organize-group={
                                isPointerOrganizeEnabled ? group.id : undefined
                              }
                              data-organize-id={
                                isPointerOrganizeEnabled
                                  ? String(p.name)
                                  : undefined
                              }
                              onPointerDown={
                                isPointerOrganizeEnabled
                                  ? (e) =>
                                      startPointerOrganizeDrag(
                                        e,
                                        p.name,
                                        group.id,
                                        p.colors
                                      )
                                  : undefined
                              }
                              onClickCapture={(e) => {
                                if (isPointerDraggingRef.current) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }
                              }}
                            >
                              <PaletteCard
                                name={p.name}
                                colors={p.colors}
                                onLoad={() => onInspectPalette(p)}
                                isOrganizing={isPointerOrganizeEnabled}
                                isFavorite={true}
                                onToggleFavorite={() =>
                                  unfavoritePaletteByName(p.name)
                                }
                                onMoveRequest={() =>
                                  setPaletteToMove({
                                    name: p.name,
                                    groupId: group.id,
                                  })
                                }
                              />
                            </div>
                          ))}

                          {groupPalettes.length === 0 && !isEditingLibrary && (
                            <p className="col-span-full text-gray-600 text-xs italic">
                              No palettes in this group.
                            </p>
                          )}
                          {isEditingLibrary && groupPalettes.length === 0 && (
                            <div
                              className="col-span-full border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 gap-2 bg-black/5 relative z-10 transition-colors hover:border-accent-cyan/30 hover:text-accent-cyan/70"
                              data-organize-dropzone={
                                isPointerOrganizeEnabled ? "1" : undefined
                              }
                              data-organize-group={
                                isPointerOrganizeEnabled ? group.id : undefined
                              }
                            >
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
              {orderedPresetLibraries.map((lib: any, libIdx: number) => {
                const libId = String(lib?.id ?? "");
                const isLibHidden = Boolean(
                  presetCustom?.hiddenLibraries?.[libId]
                );
                if (
                  isPresetLibrariesCustom &&
                  !isCustomizingPresetLibraries &&
                  isLibHidden
                ) {
                  return null;
                }

                const basePalettes: any[] = lib?.palettes || [];

                const paletteHiddenKey = (paletteName: string) =>
                  `${libId}::${paletteName}`;

                const palettesForView: any[] = (() => {
                  if (librarySortOption === "custom") {
                    const ordered = [...basePalettes];
                    if (!isPresetLibrariesCustom) return ordered;
                    if (isCustomizingPresetLibraries) return ordered;
                    return ordered.filter(
                      (p: any) =>
                        !presetCustom?.hiddenItems?.[
                          paletteHiddenKey(String(p?.name ?? ""))
                        ]
                    );
                  }

                  const byName = (x: any, y: any) =>
                    String(x?.name ?? "").localeCompare(String(y?.name ?? ""));

                  const bySize = (x: any, y: any) => {
                    const d = getPaletteColorCount(x) - getPaletteColorCount(y);
                    return d !== 0 ? d : byName(x, y);
                  };

                  const bySat = (x: any, y: any) => {
                    const d =
                      getPaletteAvgSaturation(x) - getPaletteAvgSaturation(y);
                    return d !== 0 ? d : byName(x, y);
                  };

                  const compare =
                    librarySortOption === "name"
                      ? byName
                      : librarySortOption === "sat-asc"
                      ? bySat
                      : bySize;

                  return [...basePalettes].sort(compare);
                })();

                const movePresetLibrary = (direction: -1 | 1) => {
                  const order = normalizeOrder(
                    basePresetLibraryIds,
                    presetCustom?.libraryOrder
                  );
                  const idx = order.findIndex((id) => id === libId);
                  const nextIdx = idx + direction;
                  if (idx === -1 || nextIdx < 0 || nextIdx >= order.length)
                    return;
                  const next = [...order];
                  const tmp = next[idx];
                  next[idx] = next[nextIdx];
                  next[nextIdx] = tmp;
                  updatePalettePresetCustom({ libraryOrder: next });
                };

                const movePresetLibraryToTop = () => {
                  const order = normalizeOrder(
                    basePresetLibraryIds,
                    presetCustom?.libraryOrder
                  );
                  const idx = order.findIndex((id) => id === libId);
                  if (idx <= 0) return;
                  const next = [...order];
                  const [moved] = next.splice(idx, 1);
                  next.unshift(moved);
                  updatePalettePresetCustom({ libraryOrder: next });
                };

                const movePresetLibraryToBottom = () => {
                  const order = normalizeOrder(
                    basePresetLibraryIds,
                    presetCustom?.libraryOrder
                  );
                  const idx = order.findIndex((id) => id === libId);
                  if (idx === -1 || idx >= order.length - 1) return;
                  const next = [...order];
                  const [moved] = next.splice(idx, 1);
                  next.push(moved);
                  updatePalettePresetCustom({ libraryOrder: next });
                };

                const togglePresetLibraryHidden = () => {
                  updatePalettePresetCustom({
                    hiddenLibraries: {
                      ...(presetCustom?.hiddenLibraries || {}),
                      [libId]: !isLibHidden,
                    },
                  });
                };

                const togglePresetPaletteHidden = (
                  paletteName: string,
                  isHidden: boolean
                ) => {
                  const key = paletteHiddenKey(paletteName);
                  updatePalettePresetCustom({
                    hiddenItems: {
                      ...(presetCustom?.hiddenItems || {}),
                      [key]: !isHidden,
                    },
                  });
                };

                return (
                  <div
                    key={libId}
                    className={`space-y-4 ${
                      isPresetLibrariesCustom && isLibHidden ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between group/header">
                      <div className="flex items-center gap-2">
                        <FolderOpen size={14} className="text-accent-purple" />
                        <h3 className="text-sm font-bold text-white tracking-wide">
                          {lib.name}
                        </h3>
                        <span className="text-xs text-gray-500 font-mono ml-1">
                          ({(lib.palettes || []).length})
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {isCustomizingPresetLibraries && (
                          <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-white/10">
                            {libIdx > 0 && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    movePresetLibraryToTop();
                                  }}
                                  className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                                  title="Move to Top"
                                  aria-label="Move to Top"
                                >
                                  <ChevronsUp size={12} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    movePresetLibrary(-1);
                                  }}
                                  className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                                  title="Move Up"
                                  aria-label="Move Up"
                                >
                                  <ChevronUp size={12} />
                                </button>
                              </>
                            )}
                            {libIdx < orderedPresetLibraries.length - 1 && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    movePresetLibrary(1);
                                  }}
                                  className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                                  title="Move Down"
                                  aria-label="Move Down"
                                >
                                  <ChevronDown size={12} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    movePresetLibraryToBottom();
                                  }}
                                  className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                                  title="Move to Bottom"
                                  aria-label="Move to Bottom"
                                >
                                  <ChevronsDown size={12} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePresetLibraryHidden();
                              }}
                              className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                              title={isLibHidden ? "Show" : "Hide"}
                              aria-label={isLibHidden ? "Show" : "Hide"}
                            >
                              {isLibHidden ? (
                                <EyeOff size={12} />
                              ) : (
                                <Eye size={12} />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Bulk Action */}
                        {onAddPalettes &&
                          onRemovePalettes &&
                          (() => {
                            const allFav = (lib.palettes || []).every(
                              (p: any) =>
                                library?.palettes?.some(
                                  (saved: any) => saved.name === p.name
                                )
                            );

                            return (
                              <HeartToggle
                                isFavorite={allFav}
                                onToggle={() => {
                                  if (allFav) {
                                    // Remove All Logic
                                    const toRemove = (
                                      library?.palettes || []
                                    ).filter((saved: any) =>
                                      (lib.palettes || []).some(
                                        (p: any) => p.name === saved.name
                                      )
                                    );
                                    if (onRemovePalettes)
                                      onRemovePalettes(toRemove);
                                  } else {
                                    // Add Logic
                                    const toAdd = (lib.palettes || []).filter(
                                      (p: any) =>
                                        !library?.palettes?.some(
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
                    </div>
                    <p className="text-xs text-gray-400">{lib.description}</p>

                    <div className={`grid gap-4 ${densityClass}`}>
                      {palettesForView.map((p: any, idx: number) => {
                        const paletteName = String(p?.name ?? "");
                        const hiddenKey = paletteHiddenKey(paletteName);
                        const isHidden = Boolean(
                          presetCustom?.hiddenItems?.[hiddenKey]
                        );
                        if (
                          isPresetLibrariesCustom &&
                          !isCustomizingPresetLibraries &&
                          isHidden
                        ) {
                          return null;
                        }
                        const isFav =
                          library?.palettes?.some(
                            (saved: any) => saved.name === p.name
                          ) || false;

                        return (
                          <PaletteCard
                            key={`${libId}::${paletteName}-${idx}`}
                            name={paletteName}
                            colors={p.colors}
                            onLoad={() => {
                              onInspectPalette(p);
                            }}
                            isFavorite={isFav}
                            onToggleFavorite={() => {
                              if (onToggleFavorite) {
                                onToggleFavorite(p.colors, paletteName);
                              }
                            }}
                            isCustomizing={isCustomizingPresetLibraries}
                            isHidden={
                              isPresetLibrariesCustom ? isHidden : false
                            }
                            onToggleHidden={
                              isCustomizingPresetLibraries
                                ? () =>
                                    togglePresetPaletteHidden(
                                      paletteName,
                                      isHidden
                                    )
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
  onMoveRequest?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isOrganizing?: boolean;
  isCustomizing?: boolean;
  isHidden?: boolean;
  onToggleHidden?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const PaletteCard = ({
  name,
  colors,
  onLoad,
  onMoveRequest,
  isFavorite = false,
  onToggleFavorite,
  isOrganizing = false,
  isCustomizing,
  isHidden,
  onToggleHidden,
  onMoveUp,
  onMoveDown,
}: PaletteCardProps) => {
  const { isCopied, copy } = useCopyFeedback();

  // Use the first color for contrast logic of the name if helpful,
  // or just use a strong default since it spans multiple.
  const isFirstDark = colord(colors[0] || "#000").isDark();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = (colors || []).map((c) => String(c).toUpperCase()).join(", ");
    copy(text, text);
  };

  return (
    <div
      className={`group relative h-14 rounded-lg overflow-hidden border shadow-sm transition-all hover:shadow-lg bg-bg-surface ${
        isFirstDark ? "border-white/40" : "border-black/20"
      } ${
        isOrganizing ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      } ${isHidden ? "opacity-50" : ""}`}
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
          className={`absolute top-1 right-1 flex items-center gap-0.5 pointer-events-auto transition-opacity duration-200 ${
            isCustomizing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } ${
            colord(colors[colors.length - 1] || "#000").isDark()
              ? "text-white"
              : "text-black/60"
          }`}
        >
          {/* Customization Controls */}
          {(isCustomizing || onToggleHidden || onMoveUp || onMoveDown) && (
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
                  {isHidden ? <EyeOff size={10} /> : <Eye size={10} />}
                </button>
              )}
            </div>
          )}

          {/* Move/Folder Icon - Only if onMoveRequest exists */}
          {onMoveRequest && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveRequest();
              }}
              className="p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
              title="Move to Group"
              aria-label="Move to Group"
            >
              <ArrowRight size={10} />
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
            title={isCopied ? "Copied" : "Copy Palette"}
            aria-label="Copy Palette"
          >
            {isCopied ? (
              <Check size={10} className="text-green-500" />
            ) : (
              <Copy size={10} />
            )}
          </button>

          {/* Heart/Favorite Toggle */}
          {onToggleFavorite && (
            <HeartToggle
              isFavorite={isFavorite}
              onToggle={onToggleFavorite}
              className={`p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer ${
                isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-400"
              }`}
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
