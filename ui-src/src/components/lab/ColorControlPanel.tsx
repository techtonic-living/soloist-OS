import { useState, useEffect } from "react";
import { colord } from "colord";
import {
  Copy,
  Check,
  ArrowUpDown,
  X,
  ArrowLeftRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { HeartToggle } from "../common/HeartToggle";
import { useCopyFeedback } from "../../hooks/useCopyFeedback";
import { useAsyncToggle } from "../../hooks/useAsyncToggle";
import { useToast } from "../../context/ToastContext";

interface ColorControlPanelProps {
  seedColor: string;
  setSeedColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor?: (color: string) => void;
  tertiaryColor: string;
  setTertiaryColor?: (color: string) => void;
  harmonyMode?: string;
  activeColorSlot?: "primary" | "secondary" | "tertiary";
  setActiveColorSlot?: (slot: "primary" | "secondary" | "tertiary") => void;
  settings?: any;
  updateSettings?: (settings: any) => void;
  toggleFavorite?: (color: string) => Promise<void>;
  togglePalette?: (colors: string[]) => Promise<void>;
}

export const ColorControlPanel = ({
  seedColor,
  setSeedColor,
  secondaryColor,
  setSecondaryColor,
  tertiaryColor,
  setTertiaryColor,
  harmonyMode,
  activeColorSlot,
  setActiveColorSlot,
  settings = { library: { colors: [], palettes: [] } },
  updateSettings = () => {},
  toggleFavorite: toggleFavoriteProp,
  togglePalette: togglePaletteProp,
}: ColorControlPanelProps) => {
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<1 | 2 | 3>(3);

  // Hooks
  const { isCopied: isHexCopied, copy: copyHex } = useCopyFeedback();
  const { isCopied: isRgbCopied, copy: copyRgb } = useCopyFeedback();
  const { isCopied: isHslCopied, copy: copyHsl } = useCopyFeedback();
  const { isCopied: isHsbCopied, copy: copyHsb } = useCopyFeedback();

  // Global Toast
  const { showToast } = useToast();

  // Async Toggle for Favorites
  const { status: primaryStatus, toggle: togglePrimary } = useAsyncToggle();
  const { status: paletteStatus, toggle: togglePaletteAsync } =
    useAsyncToggle();

  // Parse Colors
  const color = colord(seedColor);
  const isDark = color.isDark();
  const rgba = color.toRgb();
  const hsla = color.toHsl();
  const hsva = color.toHsv(); // HSB is essentially HSV

  // Toggle Favorite With Async Feedback
  const handleFavoriteToggle = async (colorHex: string) => {
    await togglePrimary(async () => {
      // Use the prop function if provided (with AI metadata), fallback to simple toggle
      if (toggleFavoriteProp) {
        await toggleFavoriteProp(colorHex);
        return;
      }

      // Fallback for when prop not provided
      const currentLib = settings.library || { colors: [], palettes: [] };
      const isFav = currentLib.colors.some((c: any) =>
        typeof c === "string" ? c === colorHex : c.value === colorHex
      );

      if (isFav) {
        // Remove
        updateSettings({
          library: {
            ...currentLib,
            colors: currentLib.colors.filter((c: any) =>
              typeof c === "string" ? c !== colorHex : c.value !== colorHex
            ),
          },
        });
        showToast("Removed from Favorites");
      } else {
        // Add as simple string (no metadata generation in fallback)
        updateSettings({
          library: {
            ...currentLib,
            colors: [...currentLib.colors, colorHex],
          },
        });
        showToast("Saved to Favorites");
      }
    });
  };

  const handleManualInput = (val: string, type: string) => {
    let newColor;
    if (type === "rgb") {
      newColor = colord(`rgb(${val})`);
    } else if (type === "hsl") {
      newColor = colord(`hsl(${val})`);
    } else if (type === "hsb") {
      // Colord reads hsv as hsb
      const parts = val
        .split(",")
        .map((p) => parseFloat(p.trim().replace("%", "")));
      newColor = colord({ h: parts[0], s: parts[1], v: parts[2] });
    } else {
      newColor = colord(val);
    }

    if (newColor.isValid()) {
      setSeedColor(newColor.toHex());
    }
  };

  // Swap Logic for Manual Mode
  const handleSwap = (
    slotA: "primary" | "secondary" | "tertiary",
    slotB: "primary" | "secondary" | "tertiary"
  ) => {
    // Only allow if we have setters
    if (!setSecondaryColor || !setTertiaryColor) return;

    const colors = {
      primary: seedColor,
      secondary: secondaryColor,
      tertiary: tertiaryColor,
    };

    const setters = {
      primary: setSeedColor,
      secondary: setSecondaryColor,
      tertiary: setTertiaryColor,
    };

    // Swap values
    const valA = colors[slotA];
    const valB = colors[slotB];

    // Apply
    setters[slotA](valB);
    setters[slotB](valA);
  };

  // Check if current palette exists (respecting visible count)
  const currentColors = [
    seedColor.toUpperCase(),
    secondaryColor.toUpperCase(),
    tertiaryColor.toUpperCase(),
  ].slice(0, visibleCount);

  const isPaletteFavorite = settings.library?.palettes.some(
    (p: any) =>
      p.colors.length === currentColors.length &&
      p.colors.every(
        (c: string, i: number) => c.toUpperCase() === currentColors[i]
      )
  );

  const savePalette = async () => {
    // If prop provided (with AI logic), use it
    if (togglePaletteProp) {
      await togglePaletteAsync(async () => {
        await togglePaletteProp(currentColors);
      });
      return;
    }

    // Fallback Local Logic
    const currentLib = settings.library || { colors: [], palettes: [] };

    if (isPaletteFavorite) {
      // Remove
      updateSettings({
        library: {
          ...currentLib,
          palettes: currentLib.palettes.filter(
            (p: any) =>
              !(
                p.colors.length === currentColors.length &&
                p.colors.every(
                  (c: string, i: number) => c.toUpperCase() === currentColors[i]
                )
              )
          ),
        },
      });
      showToast("Removed from Favorites");
    } else {
      // Add
      const palette = {
        name: `Palette ${currentLib.palettes.length + 1}`,
        description: "Custom palette",
        colors: currentColors,
        createdAt: new Date().toISOString(),
      };
      updateSettings({
        library: {
          ...currentLib,
          palettes: [...currentLib.palettes, palette],
        },
      });
      showToast("Saved to Favorites");
    }
  };

  // Helper to check if a color is in favorites (handles both strings and objects)
  const checkIsFavorite = (colorHex: string) => {
    return settings.library?.colors.some((c: any) => {
      const storedHex = typeof c === "string" ? c : c.value;
      return storedHex.toUpperCase() === colorHex.toUpperCase();
    });
  };

  const isPrimaryFavorite = checkIsFavorite(seedColor);
  const isSecondaryFavorite = checkIsFavorite(secondaryColor);
  const isTertiaryFavorite = checkIsFavorite(tertiaryColor);

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Centralized Interaction Locks */}
      {activeEditorId !== null && (
        <>
          {/* Global Lock (Main App) */}
          <div className="fixed inset-0 z-[50] bg-black/20 cursor-default" />
          {/* Local Lock (Panel Content) */}
          <div className="absolute inset-0 z-[90] bg-transparent cursor-default" />
        </>
      )}

      {/* Toast moved to Global Context */}

      {/* PRIMARY COLOR CONTROLS */}
      <div className="relative">
        {/* PRIMARY SWATCH CONTAINER */}
        <div
          className={`relative group w-full aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden transition-transform active:scale-[0.98] ${
            isDark ? "border border-white/40" : "border border-black/20"
          } ${activeEditorId ? "z-[100]" : ""}`}
        >
          {/* Background */}
          <svg className="absolute inset-0 z-0 w-full h-full">
            <rect width="100%" height="100%" fill={seedColor} />
          </svg>
          {/* Overlay Content */}
          <div
            className={`absolute inset-0 z-10 p-4 flex flex-col justify-between pointer-events-none ${
              isDark ? "text-white" : "text-black/80"
            } ${harmonyMode === "manual" ? "cursor-pointer" : ""}`}
            onClick={
              harmonyMode === "manual" && setActiveColorSlot
                ? (e) => {
                    // Only trigger if clicking background, not buttons/inputs
                    if (e.target === e.currentTarget) {
                      setActiveColorSlot("primary");
                    }
                  }
                : undefined
            }
            style={{
              pointerEvents: harmonyMode === "manual" ? "auto" : "none",
            }}
          >
            {/* Active Ring for Primary */}
            {harmonyMode === "manual" && activeColorSlot === "primary" && (
              <div className="absolute inset-0 border-4 border-accent-cyan rounded-2xl pointer-events-none z-50 animate-pulse" />
            )}
            <div
              className={`flex justify-between items-start transition-opacity duration-300 pointer-events-auto ${
                activeEditorId
                  ? "pointer-events-none opacity-20"
                  : "pointer-events-auto"
              }`}
            >
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-60">
                Primary
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyHex(seedColor.toUpperCase(), seedColor.toUpperCase());
                  }}
                  className="p-1.5 hover:bg-black/10 rounded-full transition-colors"
                  title="Copy Hex"
                >
                  {isHexCopied ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
                <HeartToggle
                  isFavorite={!!isPrimaryFavorite}
                  onToggle={() => handleFavoriteToggle(seedColor.toUpperCase())}
                  showPending={primaryStatus === "pending"}
                  className={
                    isPrimaryFavorite
                      ? isDark
                        ? "text-white hover:bg-white/20"
                        : "text-black/80 hover:bg-black/10"
                      : isDark
                      ? "text-white hover:bg-white/20"
                      : "text-black/80 hover:bg-black/10"
                  }
                  size={14}
                />
              </div>
            </div>

            {/* Center: Stacked Editable Inputs */}
            <div
              className={`space-y-1 w-full flex flex-col items-center relative pointer-events-auto transition-all ${
                activeEditorId ? "z-[100]" : "z-20"
              }`}
            >
              {/* HEX Input */}
              <SmartColorInput
                id="hex"
                value={seedColor.toUpperCase()}
                type="hex"
                editable={true}
                disabled={activeEditorId !== null && activeEditorId !== "hex"}
                onEditStart={(id) => setActiveEditorId(id)}
                onEditEnd={() => setActiveEditorId(null)}
                onCommit={(val) => {
                  if (colord(val).isValid()) setSeedColor(val);
                }}
                onCopy={() =>
                  copyHex(seedColor.toUpperCase(), seedColor.toUpperCase())
                }
                isCopied={isHexCopied}
                hideCopy={true}
                isDark={isDark}
              />

              {/* RGB Input */}
              <SmartColorInput
                id="rgb"
                value={`${rgba.r}, ${rgba.g}, ${rgba.b}`}
                type="rgb"
                label="RGB"
                editable={true}
                disabled={activeEditorId !== null && activeEditorId !== "rgb"}
                onEditStart={(id) => setActiveEditorId(id)}
                onEditEnd={() => setActiveEditorId(null)}
                onCommit={(val) => handleManualInput(val, "rgb")}
                onCopy={() =>
                  copyRgb(
                    `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`,
                    `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`
                  )
                }
                isCopied={isRgbCopied}
              />

              {/* HSL Input */}
              <SmartColorInput
                id="hsl"
                value={`${Math.round(hsla.h)}, ${Math.round(
                  hsla.s
                )}%, ${Math.round(hsla.l)}%`}
                type="hsl"
                label="HSL"
                editable={true}
                disabled={activeEditorId !== null && activeEditorId !== "hsl"}
                onEditStart={(id) => setActiveEditorId(id)}
                onEditEnd={() => setActiveEditorId(null)}
                onCommit={(val) => handleManualInput(val, "hsl")}
                onCopy={() =>
                  copyHsl(
                    `hsl(${Math.round(hsla.h)}, ${Math.round(
                      hsla.s
                    )}%, ${Math.round(hsla.l)}%)`,
                    `hsl(${Math.round(hsla.h)}, ...)`
                  )
                }
                isCopied={isHslCopied}
              />

              {/* HSB Input (New) */}
              <SmartColorInput
                id="hsb"
                value={`${Math.round(hsva.h)}, ${Math.round(
                  hsva.s
                )}%, ${Math.round(hsva.v)}%`}
                type="hsb"
                label="HSB"
                editable={true}
                disabled={activeEditorId !== null && activeEditorId !== "hsb"}
                onEditStart={(id) => setActiveEditorId(id)}
                onEditEnd={() => setActiveEditorId(null)}
                onCommit={(val) => handleManualInput(val, "hsb")}
                onCopy={() =>
                  copyHsb(
                    `hsb(${Math.round(hsva.h)}, ${Math.round(
                      hsva.s
                    )}%, ${Math.round(hsla.l)}%)`,
                    `hsb(${Math.round(hsva.h)}, ...)`
                  )
                }
                isCopied={isHsbCopied}
              />
            </div>

            {/* Spacer to balance layout since we removed footer */}
            <div className="h-4"></div>
          </div>
        </div>
      </div>

      {/* SECONDARY & TERTIARY CARDS (Rendered Always, Editable if Manual) */}
      <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
        <MiniColorCard
          label="Secondary"
          color={secondaryColor}
          isFavorite={isSecondaryFavorite}
          isActive={harmonyMode === "manual" && activeColorSlot === "secondary"}
          onMakePrimary={
            harmonyMode === "manual"
              ? () => handleSwap("secondary", "primary")
              : () => setSeedColor(secondaryColor)
          }
          onAction={
            harmonyMode === "manual"
              ? () => {
                  if (visibleCount === 3) handleSwap("secondary", "tertiary");
                  else if (visibleCount === 2) setVisibleCount(1);
                  else setVisibleCount(2);
                }
              : undefined
          }
          ActionIcon={
            visibleCount === 3
              ? ArrowLeftRight
              : visibleCount === 2
              ? Eye
              : EyeOff
          }
          actionTitle={
            visibleCount === 3
              ? "Swap with Tertiary"
              : visibleCount === 2
              ? "Hide"
              : "Show"
          }
          isHidden={visibleCount === 1}
          onToggleFavorite={() =>
            handleFavoriteToggle(secondaryColor.toUpperCase())
          }
          onClick={
            harmonyMode === "manual" && setActiveColorSlot
              ? () => setActiveColorSlot("secondary")
              : undefined
          }
          isHoverEnabled={harmonyMode === "manual"}
        />
        <MiniColorCard
          label="Tertiary"
          color={tertiaryColor}
          isFavorite={isTertiaryFavorite}
          isActive={harmonyMode === "manual" && activeColorSlot === "tertiary"}
          onMakePrimary={
            harmonyMode === "manual"
              ? () => handleSwap("tertiary", "primary")
              : () => setSeedColor(tertiaryColor)
          }
          onAction={
            harmonyMode === "manual"
              ? () => {
                  if (visibleCount === 3) setVisibleCount(2);
                  else setVisibleCount(3);
                }
              : undefined
          }
          ActionIcon={visibleCount === 3 ? Eye : EyeOff}
          actionTitle={visibleCount === 3 ? "Hide" : "Show"}
          actionDisabled={visibleCount === 1}
          isHidden={visibleCount < 3}
          onToggleFavorite={() =>
            handleFavoriteToggle(tertiaryColor.toUpperCase())
          }
          onClick={
            harmonyMode === "manual" && setActiveColorSlot
              ? () => setActiveColorSlot("tertiary")
              : undefined
          }
          isHoverEnabled={harmonyMode === "manual"}
        />
      </div>

      {/* PALETTE ACTION - Only show if > 1 color visible */}
      {visibleCount > 1 && (
        <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          <div className="w-full relative aspect-[8/3] rounded-xl overflow-hidden border border-white/30 shadow-sm transition-all hover:shadow-lg group">
            {/* Color Bars */}
            <div className="absolute inset-0 flex">
              {[
                { color: seedColor, label: "Primary" },
                {
                  color: secondaryColor,
                  label: "Secondary",
                },
                { color: tertiaryColor, label: "Tertiary" },
              ]
                .slice(0, visibleCount)
                .map((item, idx) => {
                  const isItemDark = colord(item.color).isDark();
                  return (
                    <div
                      key={idx}
                      className="flex-1 h-full relative overflow-hidden"
                    >
                      <svg className="absolute inset-0 w-full h-full">
                        <rect width="100%" height="100%" fill={item.color} />
                      </svg>
                      {/* Divider (except after last item) */}
                      {idx < 2 && (
                        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/20 z-10" />
                      )}
                      <div
                        className={`absolute inset-0 p-2 flex flex-col justify-end ${
                          isItemDark ? "text-white/90" : "text-black/80"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider mb-0.5">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-mono opacity-90">
                          {item.color.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Save Toggle */}
            {/* Save Toggle */}
            <div className="absolute top-1 right-1 z-10">
              <HeartToggle
                isFavorite={!!isPaletteFavorite}
                onToggle={() => savePalette()}
                showPending={paletteStatus === "pending"}
                className={`p-2 rounded-full hover:bg-black/10 transition-colors ${
                  colord(tertiaryColor).isDark()
                    ? "text-white"
                    : "text-black/60"
                } ${isPaletteFavorite ? "text-red-500" : ""}`}
                size={14}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Subcomponents ---

const MiniColorCard = ({
  label,
  color,
  isFavorite,
  onMakePrimary,
  onToggleFavorite,
  onColorChange,
  onClick,
  isActive,
  ActionIcon,
  onAction,
  actionTitle,
  actionDisabled = false,
  isHidden = false,
  isHoverEnabled = true,
}: {
  label: string;
  color: string;
  isFavorite?: boolean;
  isActive?: boolean;
  onMakePrimary: () => void;
  onToggleFavorite: () => void;
  onColorChange?: (color: string) => void;
  onClick?: () => void;
  ActionIcon?: React.ElementType;
  onAction?: () => void;
  actionTitle?: string;
  actionDisabled?: boolean;
  isHidden?: boolean;
  isHoverEnabled?: boolean;
}) => {
  const { isCopied, copy } = useCopyFeedback();
  const isDark = colord(color).isDark();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(color.toUpperCase(), color.toUpperCase());
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden aspect-[4/3] shadow-sm transition-all group/minicard ${
        isActive
          ? "ring-4 ring-accent-cyan transform scale-[1.02] z-10 shadow-xl"
          : isHoverEnabled && !isHidden
          ? "hover:shadow-lg hover:scale-[1.02]"
          : ""
      } ${isDark ? "border border-white/40" : "border border-black/20"} ${
        onClick ? "cursor-pointer" : ""
      } ${isHidden ? "opacity-40 grayscale" : ""}`}
    >
      {/* Interactive Color Area */}
      <div className={`absolute inset-0 ${onClick ? "cursor-pointer" : ""}`}>
        <svg className="absolute inset-0 z-0 w-full h-full">
          <rect width="100%" height="100%" fill={color} />
        </svg>

        <div
          className={`absolute top-1 right-1 flex items-center gap-0.5 z-10 ${
            isDark ? "text-white" : "text-black/60"
          }`}
        >
          {onAction && ActionIcon && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!actionDisabled) onAction();
              }}
              className={`p-1.5 rounded-full transition-colors ${
                actionDisabled
                  ? "opacity-50 cursor-default"
                  : "hover:bg-black/10"
              }`}
              title={actionTitle}
              disabled={actionDisabled}
            >
              <ActionIcon size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMakePrimary();
            }}
            className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
            title={onAction ? "Swap with Primary" : "Make Primary"}
          >
            <ArrowUpDown size={14} />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
            title="Copy Hex"
          >
            {isCopied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
          <HeartToggle
            isFavorite={!!isFavorite}
            onToggle={onToggleFavorite}
            size={14}
            className={
              isDark
                ? "text-white hover:bg-white/20"
                : "text-black/80 hover:bg-black/10"
            }
          />
        </div>

        {/* Manual Color Input Trigger (Only if onColorChange provided) */}
        {onColorChange && (
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
            title="Change Color"
          />
        )}
      </div>

      {/* Static Label (Always Visible) */}
      <div
        className={`absolute inset-0 p-2 flex flex-col justify-end pointer-events-none ${
          isDark ? "text-white/90" : "text-black/80"
        }`}
      >
        <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider mb-0.5 flex items-center gap-1">
          {label}
          {onColorChange && (
            <span className="opacity-50 text-[8px]">(Edit)</span>
          )}
        </span>
        <span className="text-[10px] font-mono opacity-90">
          {color.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

const SmartColorInput = ({
  id,
  value,
  type,
  label,
  onCommit,
  onCopy,
  isCopied,
  editable = false,
  disabled = false,
  onEditStart,
  onEditEnd,
  hideCopy = false,
  isDark,
}: {
  id: string;
  value: string;
  type: "hex" | "rgb" | "hsl" | "hsb";
  label?: string;
  onCommit?: (val: string) => void;
  onCopy: () => void;
  isCopied: boolean;
  editable?: boolean;
  disabled?: boolean;
  onEditStart: (id: string) => void;
  onEditEnd: () => void;
  hideCopy?: boolean;
  isDark?: boolean;
}) => {
  // Local state
  const [localValue, setLocalValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [initialHexValue, setInitialHexValue] = useState<string | null>(null);

  // Slider State
  const [activeComponent, setActiveComponent] = useState<number | null>(null);
  const [initialValue, setInitialValue] = useState<string | null>(null);

  // Sync local value when prop changes (if not editing)
  useEffect(() => {
    if (!isEditing && activeComponent === null) {
      setLocalValue(value);
    }
  }, [value, isEditing, activeComponent]);

  // ---------------------------
  // Slider Logic
  // ---------------------------
  const getComponentValues = () => {
    if (type === "hex") return [];
    return localValue
      .replace(/%/g, "")
      .split(",")
      .map((p) => parseInt(p.trim()));
  };

  const componentValues = getComponentValues();

  const getSliderConfig = (index: number) => {
    if (type === "rgb") return { min: 0, max: 255 };
    if (type === "hsl" || type === "hsb")
      return { min: 0, max: index === 0 ? 360 : 100 };
    return { min: 0, max: 100 };
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeComponent === null) return;
    const newVal = parseInt(e.target.value);
    const newComponents = [...componentValues];
    newComponents[activeComponent] = newVal;

    let formattedString = "";
    if (type === "rgb") {
      formattedString = newComponents.join(", ");
    } else {
      formattedString = `${newComponents[0]}, ${newComponents[1]}%, ${newComponents[2]}%`;
    }

    setLocalValue(formattedString);
    // Real-time update
    if (onCommit) onCommit(formattedString);
  };

  const startSlider = (idx: number) => {
    if (disabled) return;
    setInitialValue(value);
    setActiveComponent(idx);
    onEditStart(id);
  };

  const commitSlider = () => {
    setActiveComponent(null);
    setInitialValue(null);
    onEditEnd();
  };

  const revertSlider = () => {
    if (initialValue && onCommit) {
      onCommit(initialValue);
      setLocalValue(initialValue);
    }
    setActiveComponent(null);
    setInitialValue(null);
    onEditEnd();
  };

  // ---------------------------
  // Text Input Logic (Hex)
  // ---------------------------
  const handleSave = () => {
    let commitValue = localValue;

    if (type === "hex") {
      const hexPattern = /^[A-Fa-f0-9]{6}$/;
      const normalizedValue = `#${localValue.replace(/^#/, "")}`;

      if (!hexPattern.test(localValue) || !colord(normalizedValue).isValid()) {
        return;
      }

      commitValue = normalizedValue;
    }

    if (onCommit) {
      onCommit(commitValue);
    }
    setInitialHexValue(null);
    setIsEditing(false);
    onEditEnd();
  };

  const handleCancel = () => {
    if (type === "hex" && initialHexValue) {
      setLocalValue(initialHexValue);
      if (onCommit) onCommit(initialHexValue);
    } else {
      setLocalValue(value);
    }
    setInitialHexValue(null);
    setIsEditing(false);
    onEditEnd();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  // ---------------------------
  // Render
  // ---------------------------
  const renderContent = () => {
    // HEX Mode: Text Input (Keep the unified style for Hex)
    if (type === "hex") {
      if (isEditing) {
        const hexPattern = /^[A-Fa-f0-9]{6}$/;
        const normalizedValue = `#${localValue.replace(/^#/, "")}`;
        const isInvalid =
          !hexPattern.test(localValue) || !colord(normalizedValue).isValid();

        return (
          <div className="relative z-[100] flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                autoFocus
                type="text"
                value={localValue.toUpperCase()}
                onChange={(e) => {
                  const nextVal = e.target.value.replace(/^#/, "");
                  setLocalValue(nextVal);

                  if (
                    hexPattern.test(nextVal) &&
                    colord(`#${nextVal}`).isValid()
                  ) {
                    if (onCommit) onCommit(`#${nextVal}`);
                  }
                }}
                onKeyDown={handleKeyDown}
                className={`flex-1 min-w-0 bg-black/40 backdrop-blur-md border rounded px-2 py-1 text-xs font-bold font-mono text-white text-center focus:outline-none transition-colors ${
                  isInvalid
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/20 focus:border-accent-cyan"
                }`}
                title="Hex Value"
                placeholder="000000"
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleCancel}
                  className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors backdrop-blur-sm"
                  title="Cancel"
                >
                  <X size={12} />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isInvalid}
                  className={`p-1.5 rounded-full text-white transition-colors backdrop-blur-sm ${
                    isInvalid
                      ? "bg-gray-500 opacity-50"
                      : "bg-green-500/80 hover:bg-green-500"
                  }`}
                  title={isInvalid ? "Invalid Hex Color Format" : "Save"}
                >
                  <Check size={12} />
                </button>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <button
            onClick={() => {
              if (editable && !disabled) {
                setInitialHexValue(value);
                setLocalValue(value.replace(/^#/, ""));
                setIsEditing(true);
                onEditStart(id);
              }
            }}
            disabled={!editable || disabled}
            className={`
                            flex-1 text-center transition-all duration-300 font-bold text-3xl font-brand
                            ${
                              editable && !disabled
                                ? "cursor-pointer hover:text-white"
                                : "cursor-default select-none"
                            }
                            ${
                              disabled
                                ? "opacity-30 blur-[1px]"
                                : isDark
                                ? "opacity-90 text-white"
                                : "opacity-90 text-black/80"
                            }
                        `}
          >
            {value.toUpperCase()}
          </button>
        );
      }
    }

    // SLIDER Mode (Active)
    if (activeComponent !== null) {
      const config = getSliderConfig(activeComponent);
      return (
        <div className="relative z-[100] flex items-center gap-2 flex-1 min-w-0">
          <div
            className="flex items-center gap-1.5 w-[120px] bg-black/40 rounded px-2 py-0.5 animate-in fade-in zoom-in-95 duration-200 border border-accent-cyan backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Component Label */}
            <span className="text-[10px] font-mono opacity-60 w-3 text-right shrink-0">
              {activeComponent === 0
                ? type === "rgb"
                  ? "R"
                  : "H"
                : activeComponent === 1
                ? type === "rgb"
                  ? "G"
                  : "S"
                : type === "rgb"
                ? "B"
                : type === "hsl"
                ? "L"
                : "B"}
            </span>

            {/* Slider */}
            <input
              type="range"
              min={config.min}
              max={config.max}
              value={componentValues[activeComponent]}
              onChange={handleSliderChange}
              autoFocus
              className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-accent-cyan hover:accent-accent-cyan/80 min-w-0"
              title="Adjust Value"
            />

            {/* Value Readout */}
            <span className="text-[10px] font-mono font-bold w-6 text-left shrink-0">
              {componentValues[activeComponent]}
            </span>
          </div>

          {/* Actions: Revert & Commit (Outside, aligned with Hex) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                revertSlider();
              }}
              className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors backdrop-blur-sm"
              title="Cancel"
            >
              <X size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                commitSlider();
              }}
              className="p-1.5 rounded-full bg-green-500/80 hover:bg-green-500 text-white transition-colors backdrop-blur-sm"
              title="Commit"
            >
              <Check size={12} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`grid grid-cols-3 gap-3 flex-1 text-xs font-mono transition-all duration-300 ${
          disabled
            ? "opacity-30 blur-[1px] pointer-events-none"
            : `opacity-90 cursor-default ${
                isDark ? "text-white" : "text-black/80"
              }`
        }`}
      >
        {componentValues.map((val, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              startSlider(idx);
            }}
            className={`px-0.5 rounded transition-colors w-full ${
              idx === 2 ? "text-left pl-2" : "text-right"
            } ${
              isDark
                ? "hover:bg-white/10 hover:text-white"
                : "hover:bg-black/10 hover:text-black"
            }`}
            title={`Adjust ${type.toUpperCase()} value`}
            disabled={disabled}
          >
            {val}
            {type !== "rgb" && idx > 0 ? "%" : ""}
            {idx < 2 && (
              <span
                className={`opacity-30 ml-px ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                ,
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`flex items-center ${
        type === "hex" || isEditing || activeComponent !== null
          ? "justify-center"
          : "justify-between"
      } px-12 gap-1 group/field w-full relative h-7 ${
        disabled ? "pointer-events-none" : ""
      } ${isEditing || activeComponent !== null ? "z-[100]" : "z-auto"}`}
    >
      {label && (
        <span
          className={`text-[9px] font-mono w-8 text-left transition-all duration-300 ${
            disabled
              ? "opacity-10"
              : isDark
              ? "text-white opacity-40"
              : "text-black opacity-50"
          } ${isEditing || activeComponent !== null ? "absolute left-2" : ""}`}
        >
          {label}
        </span>
      )}

      {renderContent()}

      {/* Copy Button (Only if NOT active slider/editing AND not hidden) */}
      {!isEditing && activeComponent === null && !hideCopy && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onCopy();
          }}
          disabled={disabled}
          className={`
                        p-1.5 rounded-lg transition-all absolute right-2
                        ${
                          isCopied
                            ? "opacity-100"
                            : "opacity-0 group-hover/field:opacity-100"
                        }
                        ${
                          isDark
                            ? "text-white hover:bg-white/10"
                            : "text-black hover:bg-black/10"
                        }
                        ${disabled ? "hidden" : ""}
                    `}
          title={`Copy ${type.toUpperCase()}`}
        >
          {isCopied ? (
            <Check size={type === "hex" ? 14 : 12} className="text-green-500" />
          ) : (
            <Copy
              size={type === "hex" ? 14 : 12}
              className={isDark ? "text-white" : "text-black"}
            />
          )}
        </button>
      )}
    </div>
  );
};
