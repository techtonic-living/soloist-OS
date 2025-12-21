import { Layers, Terminal, Sparkles, Palette, Settings } from "lucide-react";

interface BottomNavProps {
	activeView: string;
	setActiveView: (view: any) => void;
	onWizardClick: () => void;
}

export const BottomNav = ({
	activeView,
	setActiveView,
	onWizardClick,
}: BottomNavProps) => {
	return (
		<div className="h-16 flex-shrink-0 bg-bg-surface/80 backdrop-blur-xl border-t border-glass-stroke flex items-center justify-around px-2 z-50">
			<NavIcon
				icon={Palette}
				active={activeView === "explore"}
				onClick={() => setActiveView("explore")}
				label="Explore"
			/>
			<NavIcon
				icon={Layers}
				active={activeView === "organize"}
				onClick={() => setActiveView("organize")}
				label="Organize"
			/>

			{/* Center Action Button (Wizard) */}
			<button
				onClick={onWizardClick}
				className="relative -top-6 bg-accent-cyan text-black p-4 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] border-4 border-bg-void hover:scale-110 transition-transform"
			>
				<Sparkles size={24} />
			</button>

			<NavIcon
				icon={Terminal}
				active={activeView === "connect"}
				onClick={() => setActiveView("connect")}
				label="Connect"
			/>
			<NavIcon
				icon={Settings}
				active={activeView === "settings"}
				onClick={() => setActiveView("settings")}
				label="Settings"
			/>
		</div>
	);
};

const NavIcon = ({ icon: Icon, active, onClick, label }: any) => (
	<button
		onClick={onClick}
		className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
			active ? "text-accent-cyan" : "text-gray-500 hover:text-white"
		}`}
	>
		<Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
		<span className="text-[9px] font-mono tracking-wider uppercase">
			{label}
		</span>
	</button>
);
