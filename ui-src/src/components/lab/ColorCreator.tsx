import { useState, useEffect, useRef, useMemo } from "react";
import { colord } from "colord";
import "./ColorCreator.css";

// SONAR: Interactive color picker requires inline styles for dynamic values:
// - Computed positioning (left, top) based on HSL values
// - Dynamic gradients (lightness slider background)
// - Dynamic colors (color wheel, handles)
// - Dynamic transforms (translate, scale)
// These cannot be static Tailwind classes and are documented exceptions.

interface ColorCreatorProps {
  seedColor: string;
  setSeedColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  tertiaryColor: string;
  setTertiaryColor: (color: string) => void;
  harmonyMode?: "complementary" | "analogous" | "triadic" | "manual";
  setHarmonyMode?: (
    mode: "complementary" | "analogous" | "triadic" | "manual"
  ) => void;
  activeColorSlot?: "primary" | "secondary" | "tertiary";
}

export const ColorCreator = ({
  seedColor,
  setSeedColor,
  secondaryColor,
  tertiaryColor,
  setSecondaryColor,
  setTertiaryColor,
  harmonyMode = "complementary",
  setHarmonyMode = () => {},
  activeColorSlot = "primary",
}: ColorCreatorProps) => {
  // 1. Calculate Harmonies Instantly (Visual Feedack)
  const harmonies = useMemo(() => {
    const c = colord(seedColor);
    if (harmonyMode === "complementary") {
      return {
        sec: c.rotate(180).toHex(),
        tert: c.rotate(-30).toHex(),
      };
    } else if (harmonyMode === "analogous") {
      return {
        sec: c.rotate(-30).toHex(),
        tert: c.rotate(30).toHex(),
      };
    } else if (harmonyMode === "triadic") {
      return {
        sec: c.rotate(120).toHex(),
        tert: c.rotate(240).toHex(),
      };
    }
    return { sec: null, tert: null };
  }, [seedColor, harmonyMode]);

  // 2. Sync Global State (Side Effect)
  useEffect(() => {
    if (harmonyMode === "manual") return;

    // Only update if value is different to prevent infinite loops
    if (
      harmonies.sec &&
      setSecondaryColor &&
      harmonies.sec !== secondaryColor
    ) {
      setSecondaryColor(harmonies.sec);
    }
    if (
      harmonies.tert &&
      setTertiaryColor &&
      harmonies.tert !== tertiaryColor
    ) {
      setTertiaryColor(harmonies.tert);
    }
  }, [
    harmonies,
    harmonyMode,
    setSecondaryColor,
    setTertiaryColor,
    secondaryColor,
    tertiaryColor,
  ]);

  // 3. Determine Display Colors
  // If Manual Mode:
  // - activeColor is whatever slot is selected (Primary, Secondary, or Tertiary)
  // - "Secondary" prop passed to Wheel becomes one of the NON-selected colors
  // - "Tertiary" prop passed to Wheel becomes the other NON-selected color
  // This essentially rotates the wheel's focus.

  let activeColor = seedColor;
  let activeSecondary =
    harmonyMode !== "manual" ? harmonies.sec || secondaryColor : secondaryColor;
  let activeTertiary =
    harmonyMode !== "manual" ? harmonies.tert || tertiaryColor : tertiaryColor;

  if (harmonyMode === "manual") {
    if (activeColorSlot === "secondary") {
      activeColor = secondaryColor;
      activeSecondary = seedColor; // Show Primary as marker
      activeTertiary = tertiaryColor; // Show Tertiary as marker
    } else if (activeColorSlot === "tertiary") {
      activeColor = tertiaryColor;
      activeSecondary = seedColor; // Show Primary as marker
      activeTertiary = secondaryColor; // Show Secondary as marker
    }
    // if Primary, simple default logic applies (Active=Primary, Sec=Sec, Tert=Tert)
  }

  // Parse Colors
  const color = colord(activeColor);
  const hsla = color.toHsl();

  // Handle Main Change
  const handleColorChange = (h: number, s: number, l?: number) => {
    const newColor = colord({
      h,
      s,
      l: l !== undefined ? l : hsla.l,
    }).toHex();

    if (harmonyMode === "manual") {
      if (activeColorSlot === "secondary") setSecondaryColor(newColor);
      else if (activeColorSlot === "tertiary") setTertiaryColor(newColor);
      else setSeedColor(newColor);
    } else {
      setSeedColor(newColor); // Always drive primary in harmony modes
    }
  };

  return (
    <div className="h-full flex flex-col items-center gap-6 p-6 overflow-y-auto custom-scrollbar bg-bg-surface/30 backdrop-blur-sm">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Top Controls: Harmony Mode */}
      <div className="relative z-20">
        <div className="flex p-1 gap-1 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl opacity-50 hover:opacity-100 transition-opacity duration-300">
          {["manual", "complementary", "analogous", "triadic"].map((m) => (
            <button
              key={m}
              onClick={() => setHarmonyMode(m as any)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all uppercase ${
                harmonyMode === m
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl relative z-10">
        {/* The Wheel */}
        <div className="relative group">
          <ColorWheel
            size={420}
            hue={hsla.h}
            saturation={hsla.s}
            onChange={(h, s) => handleColorChange(h, s)}
            secondaryColor={activeSecondary}
            tertiaryColor={activeTertiary}
            harmonyMode={harmonyMode}
            lightness={hsla.l}
            // In manual mode, we always want to see markers for context
            showMarkers={true}
          />
        </div>
      </div>

      {/* Brightness Control - Floating Pill */}
      <div className="relative z-20 flex items-center gap-3 p-1 pr-4 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl w-80 opacity-50 hover:opacity-100 transition-opacity duration-300">
        <div className="px-3 py-1.5 rounded-full bg-white/5 text-[10px] uppercase font-bold tracking-wider text-gray-400 pointer-events-none select-none">
          Lightness
        </div>

        <div className="relative flex-1 h-3 rounded-full overflow-hidden shadow-inner border border-white/10 group cursor-pointer brightness-gradient">
          <div
            className="absolute inset-0 z-0 opacity-80 brightness-gradient-fill"
            style={{
              background: `linear-gradient(to right, #000 0%, ${colord({
                h: hsla.h,
                s: hsla.s,
                l: 50,
              }).toHex()} 50%, #fff 100%)`,
            }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={hsla.l}
            onChange={(e) =>
              setSeedColor(
                colord({
                  ...hsla,
                  l: parseInt(e.target.value),
                }).toHex()
              )
            }
            title="Adjust Lightness"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {/* Thumb Indicator */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none transition-transform duration-75"
            style={{
              left: `${hsla.l}%`,
              transform: "translateX(-50%)",
            }}
          />
        </div>

        <div className="w-8 text-right text-[10px] uppercase font-bold tracking-wider text-white select-none">
          {Math.round(hsla.l)}%
        </div>
      </div>
    </div>
  );
};

// ---------------------------
// Color Wheel Component
// ---------------------------

interface ColorWheelProps {
  size: number;
  hue: number;
  saturation: number;
  onChange: (h: number, s: number) => void;
  secondaryColor?: string;
  tertiaryColor?: string;
  harmonyMode: string;
  showMarkers?: boolean;
}

const ColorWheel = ({
  size,
  hue,
  saturation,
  onChange,
  secondaryColor,
  tertiaryColor,
  harmonyMode,
  lightness = 50, // Default to 50 if not provided
  showMarkers = false,
}: ColorWheelProps & { lightness?: number }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const radius = size / 2;

  // Helper to get XY from HS
  const getPosition = (h: number, s: number) => {
    const angleRad = (h - 90) * (Math.PI / 180); // -90 because 0deg is top in CSS conic, but right in math
    // Map saturation 0-100 to distance 0-radius
    const dist = (s / 100) * radius;
    const x = radius + Math.cos(angleRad) * dist;
    const y = radius + Math.sin(angleRad) * dist;
    return { x, y };
  };

  // Calculate main handle position
  const mainPos = getPosition(hue, saturation);

  // Interaction handler
  const handleMove = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.left + radius;
    const cy = rect.top + radius;

    const dx = clientX - cx;
    const dy = clientY - cy;

    // Calculate Angle (Hue)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    // Calculate Distance (Saturation)
    const dist = Math.sqrt(dx * dx + dy * dy);
    const s = Math.min(100, (dist / radius) * 100);

    onChange(angle, s);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX, e.clientY);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  // Calculate Harmony Positions
  const getHarmonyPos = (cStr?: string) => {
    if (!cStr) return null;
    const c = colord(cStr);
    const h = c.hue();
    const s = c.toHsl().s;
    return getPosition(h, s);
  };

  const secPos = getHarmonyPos(secondaryColor);
  const tertPos = getHarmonyPos(tertiaryColor);

  // Dynamic Gradient Stops
  const stops = [
    { d: 0, h: 0 },
    { d: 60, h: 60 },
    { d: 120, h: 120 },
    { d: 180, h: 180 },
    { d: 240, h: 240 },
    { d: 300, h: 300 },
    { d: 360, h: 360 }, // Loop back to 0 (Red)
    // Note: Hue 0 and 360 are Red.
    // We need specific hues: Red, Yellow, Lime, Cyan, Blue, Magenta, Red
  ];

  // Construct conic gradient string
  // We use colord to generate the hex for each hue at 100% Saturation and CURRENT Lightness
  // Center is White/Grey/Black based on lightness (Sat 0)
  // Actually, center is Saturation 0.

  const centerColor = colord({ h: 0, s: 0, l: lightness }).toHex();

  const conicStops = stops
    .map((s) => {
      const hex = colord({ h: s.h, s: 100, l: lightness }).toHex();
      return `${hex} ${s.d}deg`;
    })
    .join(", ");

  return (
    <div
      ref={wheelRef}
      className="rounded-full relative shadow-2xl shadow-black/50 cursor-pointer"
      style={{
        width: size,
        height: size,
        background: `
                    radial-gradient(circle, ${centerColor} 0%, transparent 70%),
                    conic-gradient(from 0deg, ${conicStops})
                `,
      }}
      onMouseDown={onMouseDown}
    >
      {/* Overlay for Saturation/Lightness nuance */}
      <div className="absolute inset-0 rounded-full saturation-overlay pointer-events-none" />

      {/* Harmony Handles (Non-interactive for now, just visual indicators) */}
      {(harmonyMode !== "manual" || showMarkers) && secPos && (
        <svg
          className="absolute w-5 h-5 pointer-events-none drop-shadow-lg"
          style={{
            left: secPos.x,
            top: secPos.y,
            transform: "translate(-50%, -50%)",
            zIndex: 5,
          }}
          viewBox="0 0 16 16"
        >
          <circle
            cx="8"
            cy="8"
            r="7"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.8"
          />
          <circle cx="8" cy="8" r="4" fill={secondaryColor} opacity="0.95" />
        </svg>
      )}
      {(harmonyMode !== "manual" || showMarkers) && tertPos && (
        <svg
          className="absolute w-5 h-5 pointer-events-none drop-shadow-lg"
          style={{
            left: tertPos.x,
            top: tertPos.y,
            transform: "translate(-50%, -50%)",
            zIndex: 5,
          }}
          viewBox="0 0 16 16"
        >
          <circle
            cx="8"
            cy="8"
            r="7"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.8"
          />
          <circle cx="8" cy="8" r="4" fill={tertiaryColor} opacity="0.95" />
        </svg>
      )}

      {/* Main Handle */}
      <div
        className="absolute w-6 h-6 rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
        style={{
          left: mainPos.x,
          top: mainPos.y,
          backgroundColor: colord({
            h: hue,
            s: saturation,
            l: 50,
          }).toHex(),
          transform: "translate(-50%, -50%)",
          zIndex: 10,
        }}
      />
    </div>
  );
};
