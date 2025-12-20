import { useState } from "react";
import { ExploreView } from "./components/ExploreView";
import { AssistantPanel } from "./components/AssistantPanel";
import { useSoloist } from "./context/SoloistContext";
import { useToast } from "./context/ToastContext";
import { PresetColor } from "./data/colorPresets";

const App = () => {
  const { setSeedColor, setHarmonyMode } = useSoloist();
  const { showToast } = useToast();

  // --- Local UI State for ExploreView ---
  const [exploreTab, setExploreTab] = useState<
    "colors" | "palettes" | "studio" | "remix"
  >("studio");
  const [inspectedColor, setInspectedColor] = useState<PresetColor | null>(
    null
  );

  const [inspectedPalette, setInspectedPalette] = useState<any | null>(null);
  const [inspectedRemixIndex, setInspectedRemixIndex] = useState<number | null>(
    null
  );
  const [generatorColors, setGeneratorColors] = useState<string[]>(["#FFBE0B"]);

  // Active Slot State for Manual Mode
  const [activeColorSlot, setActiveColorSlot] = useState<
    "primary" | "secondary" | "tertiary"
  >("primary");

  const handleLoadRemix = (colors: string[]) => {
    setGeneratorColors(colors);
    setExploreTab("remix");
  };

  const handleAddToRemix = (color: string) => {
    if (generatorColors.length >= 10) {
      showToast(
        <div className="flex flex-col">
          <span className="font-bold text-red-400">Remix Palette Full</span>
          <span className="text-[10px] opacity-70">
            Free up a slot to add more colors.
          </span>
        </div>
      );
      // Still navigate to remix so they can see the full palette to free up slots
      setExploreTab("remix");
      return;
    }

    setGeneratorColors((prev) => {
      if (prev.includes(color)) return prev;
      return [...prev, color];
    });
    setExploreTab("remix");
  };

  const handleUpdateRemixColor = (index: number, color: string) => {
    setGeneratorColors((prev) => {
      const next = [...prev];
      next[index] = color;
      return next;
    });
  };

  const handleLoadStudio = (color: string) => {
    setSeedColor(color);
    setHarmonyMode("manual");
    setExploreTab("studio");
    setActiveColorSlot("primary");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-bg-void overflow-hidden text-sm relative">
      {/* Header / Brand - Minimal */}
      <header className="h-12 flex-shrink-0 border-b border-glass-stroke bg-bg-surface/50 backdrop-blur-md flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          <span className="font-brand font-bold text-white tracking-widest text-xs">
            SOLOIST
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex">
        {/* Main View */}
        <div className="flex-1 h-full overflow-hidden relative">
          <ExploreView
            activeTab={exploreTab}
            setActiveTab={(tab) => {
              setExploreTab(tab);
              // Preserve inspector session state across tool switches.
            }}
            onInspectColor={setInspectedColor}
            onInspectPalette={setInspectedPalette}
            inspectedRemixIndex={inspectedRemixIndex}
            onInspectRemixColor={setInspectedRemixIndex}
            generatorColors={generatorColors}
            setGeneratorColors={setGeneratorColors}
            activeColorSlot={activeColorSlot}
            setActiveColorSlot={setActiveColorSlot}
          />
        </div>

        {/* Right Sidebar (AssistantPanel)
				    Note: AssistantPanel logic relies on 'activeView' from context being 'explore'.
				    Since default SoloistContext activeView is 'explore', this should work correctly
				    to show the Color Control Panel when exploreTab is 'create'.
				*/}
        <AssistantPanel
          activeExploreTab={exploreTab}
          selectedInsightColor={inspectedColor}
          selectedInsightPalette={inspectedPalette}
          inspectedRemixIndex={inspectedRemixIndex}
          generatorColors={generatorColors}
          onUpdateRemixColor={handleUpdateRemixColor}
          onLoadPalette={handleLoadRemix}
          onAddToRemix={handleAddToRemix}
          onLoadStudio={handleLoadStudio}
          activeColorSlot={activeColorSlot}
          setActiveColorSlot={setActiveColorSlot}
        />
      </div>
    </div>
  );
};

export default App;
