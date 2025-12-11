import { useState } from "react";
import { ExploreView } from "./components/ExploreView";
import { AssistantPanel } from "./components/AssistantPanel";
import { useSoloist } from "./context/SoloistContext";
import { PresetColor } from "./data/colorPresets";

const App = () => {
	// Keep context for settings/state persistence
	const {} = useSoloist();

	// --- Local UI State for ExploreView ---
	const [exploreTab, setExploreTab] = useState<
		"colors" | "palettes" | "studio" | "remix"
	>("studio");
	const [inspectedColor, setInspectedColor] = useState<PresetColor | null>(
		null
	);

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
							// Clear inspected color on tab change for clean slate
							setInspectedColor(null);
						}}
						onInspectColor={setInspectedColor}
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
				/>
			</div>
		</div>
	);
};

export default App;
