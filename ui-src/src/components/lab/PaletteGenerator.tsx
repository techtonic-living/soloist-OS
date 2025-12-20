import { useState, useCallback, useEffect } from "react";
import { colord } from "colord";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Copy, Plus, RefreshCw, Trash2 } from "lucide-react";
import { HeartToggle } from "../common/HeartToggle";
import { PresetColor } from "../../data/colorPresets";

interface PaletteGeneratorProps {
  onSavePalette: (colors: string[]) => void;
  colors: string[];
  setColors: (colors: string[] | ((prev: string[]) => string[])) => void;
  favoriteColors: string[];
  onToggleFavoriteColor: (
    color: string,
    existingMetadata?: PresetColor
  ) => void;
}

export const PaletteGenerator = ({
  onSavePalette,
  colors,
  setColors,
  favoriteColors = [],
  onToggleFavoriteColor,
}: PaletteGeneratorProps) => {
  // We need to track locked state locally.
  // When colors array changes length externally (if ever), we might desync, but since we control it here mostly:
  // We will sync locked state whenever we add/remove.
  const [locked, setLocked] = useState<boolean[]>(
    new Array(colors.length).fill(false)
  );

  // Ensure locked array matches colors length (visual safety)
  useEffect(() => {
    if (locked.length !== colors.length) {
      setLocked((prev) => {
        const diff = colors.length - prev.length;
        if (diff > 0) return [...prev, ...new Array(diff).fill(false)];
        return prev.slice(0, colors.length);
      });
    }
  }, [colors.length]);

  const generate = useCallback(() => {
    setColors((prev) =>
      prev.map((c, i) => {
        if (locked[i]) return c;
        // Cinematic Random: Avoid extreme mud/neons sometimes?
        // For now standard random with some saturation/lightness constraints for better looks
        return colord({
          h: Math.floor(Math.random() * 360),
          s: 40 + Math.random() * 60, // 40-100% saturation
          l: 20 + Math.random() * 60, // 20-80% lightness
        }).toHex();
      })
    );
  }, [locked, setColors]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not editing an input
      if (e.code === "Space" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generate]);

  const toggleLock = (index: number) => {
    const newLocked = [...locked];
    newLocked[index] = !newLocked[index];
    setLocked(newLocked);
  };

  const updateColor = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
  };

  const addSlot = () => {
    if (colors.length >= 10) return; // Max limit
    setColors((prev) => [
      ...prev,
      colord({
        h: Math.random() * 360,
        s: 70,
        l: 50,
      }).toHex(),
    ]);
    // Locked state updates via useEffect, but let's be explicit for immediate UI feedback if needed
    // standardizing on the effect is safer.
  };

  const removeSlot = (index: number) => {
    if (colors.length <= 2) return; // Min limit
    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
    // Locked state will sync via Effect
  };

  return (
    <div className="h-full w-full flex flex-col gap-4 relative">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-brand text-white tracking-wide">Remix</h2>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <button
              onClick={generate}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all text-xs font-mono"
            >
              <RefreshCw size={12} />
              <span>Randomize</span>
            </button>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider hidden md:block">
              [Space]
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={addSlot}
            disabled={colors.length >= 10}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-mono ${
              colors.length >= 10
                ? "opacity-50 cursor-not-allowed border-transparent text-gray-500"
                : "bg-white/5 hover:bg-white/10 text-accent-cyan border-accent-cyan/20 shadow-glow"
            }`}
          >
            <Plus size={12} />
            <span>Add Color</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-2" />

          {/* Palette "Save" replaced with Heart Action */}
          {/* Note: Ideally we'd track if the palette itself is favorited, but for now we treat this action as "Save Palette" with a Heart UI */}
          <button
            onClick={() => onSavePalette(colors)}
            className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 text-pink-500 border border-pink-500/30 hover:border-pink-500/50 rounded-lg font-mono text-xs shadow-lg transition-all group"
          >
            <HeartToggle
              isFavorite={false} // Palette level state not fully tracked in this view, acting as trigger
              onToggle={() => onSavePalette(colors)}
              size={16}
              className="text-pink-500"
            />
            <span className="group-hover:text-pink-400 transition-colors">
              Save Palette
            </span>
          </button>
        </div>
      </div>

      {/* Palette Area */}
      <div className="flex-1 rounded-2xl border border-glass-stroke overflow-hidden flex shadow-monolith bg-bg-void relative group/container">
        <AnimatePresence mode="popLayout">
          {colors.map((color, i) => (
            <motion.div
              key={i} // Use just index to allow existing items to animate their layout change
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, width: 0 }}
              transition={{ duration: 0.3, ease: "backOut" }}
              className="flex-1 h-full relative group flex flex-col items-center justify-center border-r border-white/5 last:border-0 hover:flex-[1.5] transition-all duration-500 ease-[cubic-bezier(0.32,0.12,0.0,1)] min-w-0"
              style={{ backgroundColor: color }}
            >
              {/* Controls Overlay */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                {/* Actions Cluster */}
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-bg-surface/90 backdrop-blur-md border border-glass-stroke shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                  <div className="flex items-center justify-between gap-2">
                    {/* Color Favorite Toggle */}
                    <HeartToggle
                      isFavorite={favoriteColors.some(
                        (c) => c.toUpperCase() === color.toUpperCase()
                      )}
                      onToggle={() => onToggleFavoriteColor(color)}
                      size={16}
                    />

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(color.toUpperCase());
                      }}
                      className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                      title="Copy"
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  <div className="w-full h-px bg-white/10 my-1" />

                  <div className="relative group/input mb-1">
                    <input
                      type="text"
                      value={color.replace("#", "")}
                      onChange={(e) => {
                        // Basic Hex Validation
                        const val = e.target.value;
                        if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                          updateColor(i, `#${val}`);
                        }
                      }}
                      className="w-20 bg-black/20 border border-white/10 rounded px-2 py-1 text-center font-mono text-sm font-bold text-white focus:outline-none focus:border-accent-cyan transition-colors uppercase"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 font-mono text-sm pointer-events-none">
                      #
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleLock(i)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all ${
                        locked[i]
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "hover:bg-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      {locked[i] ? (
                        <>
                          <Lock size={10} />
                          LOCKED
                        </>
                      ) : (
                        <>
                          <Unlock size={10} />
                          LOCK
                        </>
                      )}
                    </button>

                    {colors.length > 2 && (
                      <button
                        onClick={() => removeSlot(i)}
                        className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                        title="Remove Slot"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Fixed Label if Locked (Visible when not hovering/active) */}
              <AnimatePresence>
                {locked[i] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute bottom-6 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 group-hover:opacity-0 transition-opacity"
                  >
                    <HeartToggle
                      isFavorite={favoriteColors.some(
                        (c) => c.toUpperCase() === color.toUpperCase()
                      )}
                      onToggle={() => onToggleFavoriteColor(color)}
                      size={12}
                    />
                    {/* Lock icon moved to right of text or removed if redundant? keeping logic simple */}
                    <div className="h-3 w-px bg-white/20" />
                    <span className="text-white/90 font-mono text-xs uppercase">
                      {color}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
