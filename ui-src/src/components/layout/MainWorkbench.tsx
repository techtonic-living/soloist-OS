import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, ShieldCheck, BookOpen, Lightbulb } from "lucide-react";

interface MainWorkbenchProps {
	children: React.ReactNode;
	assistantContent?: React.ReactNode;
	assistantMode: "standby" | "wingman" | "guru";
	setAssistantMode: (mode: "standby" | "wingman" | "guru") => void;
}

const getModeDescription = (mode: string) => {
	if (mode === "standby")
		return "Core system active. I'm ready to help you manage your design operations.";
	if (mode === "wingman")
		return "Interactive assistance enabled. I'll watch your workflow for optimization opportunities.";
	return "High-level intelligence engaged. Analyzing system architecture and token health.";
};

export const MainWorkbench = ({
	children,
	assistantContent,
	assistantMode,
	setAssistantMode,
}: MainWorkbenchProps) => {
	return (
		<div className="contents">
			{/* Main subpanel (Column 2) */}
			<main className="h-full min-h-0 overflow-hidden relative border-r border-glass-stroke bg-bg-surface/20 backdrop-blur-sm z-30 flex flex-col">
				{/* Subheader row (keeps borders aligned with assistant header) */}
				<div className="h-12 flex items-center px-4 border-b border-glass-stroke bg-bg-surface/40" />

				<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
					<AnimatePresence mode="wait">
						<motion.div
							key="workbench-content"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="min-h-full w-full"
						>
							{children}
						</motion.div>
					</AnimatePresence>
				</div>
			</main>

			{/* Right Accessory Subpanel (Column 3) */}
			<aside className="h-full min-h-0 bg-bg-surface/10 backdrop-blur-sm flex flex-col flex-shrink-0 relative overflow-hidden z-30">
				{/* Assistant Header / Mode Selector */}
				<div className="h-12 flex items-center justify-between px-4 border-b border-glass-stroke bg-bg-surface/40">
					<div className="flex bg-bg-void/50 p-1 rounded-lg border border-glass-stroke/50">
						<AssistantModeButton
							active={assistantMode === "standby"}
							onClick={() => setAssistantMode("standby")}
							label="Standby"
							icon={ShieldCheck}
						/>
						<AssistantModeButton
							active={assistantMode === "wingman"}
							onClick={() => setAssistantMode("wingman")}
							label="Wingman"
							icon={Zap}
						/>
						<AssistantModeButton
							active={assistantMode === "guru"}
							onClick={() => setAssistantMode("guru")}
							label="Guru"
							icon={Sparkles}
						/>
					</div>
				</div>

				{/* Assistant Content Scroll Area */}
				<div className="flex-1 overflow-y-auto custom-scrollbar p-4">
					<AnimatePresence mode="wait">
						<motion.div
							key={
								assistantMode +
								(assistantContent ? "active" : "idle")
							}
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -10 }}
							transition={{ duration: 0.2 }}
						>
							{assistantContent || (
								<DefaultAssistantContent mode={assistantMode} />
							)}
						</motion.div>
					</AnimatePresence>
				</div>
			</aside>
		</div>
	);
};

const AssistantModeButton = ({
	active,
	onClick,
	label,
	icon: Icon,
}: {
	active: boolean;
	onClick: () => void;
	label: string;
	icon: any;
}) => (
	<button
		onClick={onClick}
		title={label}
		className={`p-1.5 rounded-md transition-all flex items-center justify-center ${
			active
				? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
				: "text-white/20 hover:text-white/40 border border-transparent"
		}`}
	>
		<Icon size={14} />
	</button>
);

const DefaultAssistantContent = ({ mode }: { mode: string }) => {
	const content = {
		standby: {
			title: "Getting Started",
			icon: BookOpen,
			items: [
				"Select a tool from the left rail to begin your session.",
				"Configure your UI density and size in the top bar.",
				"Projects can be managed via the dropdown in the logo area.",
			],
			tip: "Press CMD+K to search all tokens.",
		},
		wingman: {
			title: "Active Assistance",
			icon: ShieldCheck,
			items: [
				"I'll provide real-time suggestions as you build.",
				"Select a color to see accessible combinations.",
				"Drop an image to extract high-vibrance palettes.",
			],
			tip: "Try the 'Shuffle' feature for rapid ideation.",
		},
		guru: {
			title: "System Insights",
			icon: Lightbulb,
			items: [
				"Deep architectural analysis of your design system.",
				"Token usage patterns and overlap detection.",
				"Consistency checks across all modules.",
			],
			tip: "Click 'Record' to see a timeline of changes.",
		},
	};

	const current = content[mode as keyof typeof content];

	return (
		<div className="space-y-8">
			<div className="flex flex-col items-center text-center space-y-4 py-4">
				<div className="w-12 h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center border border-accent-cyan/20 shadow-glow mb-2">
					<current.icon size={20} className="text-accent-cyan" />
				</div>
				<h2 className="text-sm font-semibold text-white tracking-wide">
					{current.title}
				</h2>
				<p className="text-xs text-white/40 leading-relaxed">
					{getModeDescription(mode)}
				</p>
			</div>

			<div className="space-y-4">
				<h3 className="text-[10px] font-mono tracking-widest text-white/20 uppercase">
					Next Steps
				</h3>
				{current.items.map((item) => (
					<div key={item} className="flex gap-3 items-start group">
						<div className="mt-1.5 w-1 h-1 rounded-full bg-accent-cyan group-hover:shadow-glow transition-all" />
						<p className="text-xs text-white/60 leading-relaxed group-hover:text-white transition-colors">
							{item}
						</p>
					</div>
				))}
			</div>

			<div className="p-4 rounded-xl bg-bg-raised border border-glass-stroke shadow-monolith mt-8">
				<div className="flex items-center gap-2 mb-2">
					<Sparkles size={12} className="text-accent-cyan" />
					<span className="text-[10px] font-mono text-accent-cyan uppercase tracking-widest">
						Mastery Tip
					</span>
				</div>
				<p className="text-[11px] text-white/40 leading-relaxed italic">
					"{current.tip}"
				</p>
			</div>
		</div>
	);
};
