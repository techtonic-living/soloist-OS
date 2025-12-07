import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Layers,
	BookOpen,
	Settings,
	Terminal,
	Activity,
	ChevronRight,
} from "lucide-react";
import { ColorMatrix } from "./components/ColorMatrix";
import { KnowledgeBase } from "./components/KnowledgeBase";
import { ExportTerminal } from "./components/ExportTerminal";
import { useSoloistSystem, AILevel } from "./hooks/useSoloistSystem";

type View = "tokens" | "knowledge" | "settings" | "export";

const App = () => {
	const [activeView, setActiveView] = useState<View>("tokens");
	const { settings, updateSettings } = useSoloistSystem();

	return (
		<div className="flex h-screen w-full bg-bg-void overflow-hidden text-sm">
			{/* SIDEBAR */}
			<nav className="w-16 flex-shrink-0 flex flex-col items-center py-6 border-r border-glass-stroke bg-bg-void/50 backdrop-blur-md z-50">
				<div className="mb-8 font-brand text-2xl text-primary tracking-widest text-shadow-glow">
					OS
				</div>

				<div className="space-y-6 flex flex-col w-full items-center">
					<NavIcon
						icon={Layers}
						active={activeView === "tokens"}
						onClick={() => setActiveView("tokens")}
					/>
					<NavIcon
						icon={BookOpen}
						active={activeView === "knowledge"}
						onClick={() => setActiveView("knowledge")}
					/>
					<NavIcon
						icon={Terminal}
						active={activeView === "export"}
						onClick={() => setActiveView("export")}
					/>
				</div>

				<div className="mt-auto space-y-6 flex flex-col w-full items-center">
					{/* AI Toggle Indicator */}
					<div className="h-24 w-1 bg-glass-stroke rounded-full relative group">
						<motion.div
							className="w-full bg-accent-cyan rounded-full absolute bottom-0 shadow-neon-glow"
							animate={{
								height:
									settings.aiLevel === "silent"
										? "10%"
										: settings.aiLevel === "guide"
										? "50%"
										: "100%",
							}}
						/>
						<div className="absolute left-4 bottom-0 hidden group-hover:block w-32 bg-bg-surface border border-glass-stroke p-3 z-50 rounded-lg shadow-monolith">
							<p className="text-xs text-accent-cyan mb-2 font-brand uppercase tracking-widest">
								AI Assistance
							</p>
							<div className="space-y-2">
								<button
									onClick={() =>
										updateSettings({ aiLevel: "teacher" })
									}
									className={`w-full text-left text-xs ${
										settings.aiLevel === "teacher"
											? "text-white"
											: "text-gray-500"
									}`}
								>
									Teacher Mode
								</button>
								<button
									onClick={() =>
										updateSettings({ aiLevel: "guide" })
									}
									className={`w-full text-left text-xs ${
										settings.aiLevel === "guide"
											? "text-white"
											: "text-gray-500"
									}`}
								>
									Co-Pilot
								</button>
								<button
									onClick={() =>
										updateSettings({ aiLevel: "silent" })
									}
									className={`w-full text-left text-xs ${
										settings.aiLevel === "silent"
											? "text-white"
											: "text-gray-500"
									}`}
								>
									Silent
								</button>
							</div>
						</div>
					</div>
					<NavIcon
						icon={Settings}
						active={activeView === "settings"}
						onClick={() => setActiveView("settings")}
					/>
				</div>
			</nav>

			{/* MAIN CONTENT AREA */}
			<main className="flex-1 relative overflow-hidden flex flex-col">
				<header className="h-16 flex items-center justify-between px-8 border-b border-glass-stroke bg-bg-void/30 backdrop-blur-sm z-20">
					<div className="flex items-center gap-3">
						<h1 className="font-brand text-3xl text-white tracking-wide">
							Soloist
						</h1>
						<span className="text-gray-600 font-light text-xl">
							/
						</span>
						<h2 className="text-gray-400 font-display tracking-wide uppercase text-xs">
							Workbench
						</h2>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-glass-subtle border border-glass-stroke">
							<Activity
								size={14}
								className="text-accent-cyan animate-pulse"
							/>
							<span className="text-xs text-gray-400 font-mono">
								SYSTEM: ONLINE
							</span>
						</div>
					</div>
				</header>

				<div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
					{/* Ambient Background */}
					{settings.visualFidelity === "high" && (
						<div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
					)}

					<AnimatePresence mode="wait">
						<motion.div
							key={activeView}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.4 }}
							className="w-full h-full max-w-6xl mx-auto"
						>
							{activeView === "tokens" && (
								<TokensView aiLevel={settings.aiLevel} />
							)}
							{activeView === "knowledge" && <KnowledgeBase />}
							{activeView === "export" && <ExportTerminal />}
						</motion.div>
					</AnimatePresence>
				</div>
			</main>
		</div>
	);
};

const TokensView = ({ aiLevel }: { aiLevel: AILevel }) => {
	const handleSync = () => {
		// Current hardcoded mock for syncing.
		// In next phase, this comes from state.
		const currentRamp = [
			{ name: "void/900", hex: "#0B0D12" },
			{ name: "void/800", hex: "#1A1D24" },
			{ name: "primary/500", hex: "#3D8BFF" },
		];
		parent.postMessage(
			{
				pluginMessage: {
					type: "create-variables",
					payload: { colors: currentRamp },
				},
			},
			"*"
		);
	};

	return (
		<div className="grid grid-cols-12 gap-8 h-full">
			<div className="col-span-12 lg:col-span-8 flex flex-col">
				<div className="flex items-center gap-3 mb-6">
					<h2 className="font-brand text-2xl text-white">
						Color Foundations
					</h2>
					<span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono border border-primary/20">
						EDITING: VOID RAMP
					</span>
				</div>
				<div className="flex-1 bg-bg-surface/30 rounded-2xl border border-glass-stroke p-8 relative overflow-hidden backdrop-blur-sm">
					<ColorMatrix aiLevel={aiLevel} />
				</div>
			</div>

			<div className="col-span-12 lg:col-span-4 space-y-6">
				<div className="depth-card p-6">
					<div className="flex justify-between items-center mb-4">
						<h4 className="font-display text-xs text-gray-400 uppercase tracking-widest">
							Figma Variables
						</h4>
						<span className="w-2 h-2 rounded-full bg-accent-success shadow-[0_0_10px_#32D74B]"></span>
					</div>
					<p className="text-sm text-gray-500 mb-4">
						3 primitives ready to sync.
					</p>
					<button
						onClick={handleSync}
						className="w-full py-3 rounded-lg bg-bg-void border border-glass-stroke text-white font-mono text-xs hover:border-primary hover:text-primary transition-all flex justify-center items-center gap-2 group"
					>
						<span>SYNC TO COLLECTION</span>
						<ChevronRight
							size={12}
							className="group-hover:translate-x-1 transition-transform"
						/>
					</button>
				</div>
			</div>
		</div>
	);
};

const NavIcon = ({ icon: Icon, active, onClick }: any) => (
	<button
		onClick={onClick}
		className={`p-3 rounded-xl transition-all duration-300 relative group ${
			active
				? "bg-bg-raised text-accent-cyan shadow-neon-glow"
				: "text-gray-500 hover:text-white"
		}`}
	>
		<Icon size={20} strokeWidth={1.5} />
	</button>
);

export default App;
