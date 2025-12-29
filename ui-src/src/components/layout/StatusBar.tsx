import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Trophy, type LucideIcon } from "lucide-react";
import { CONQUER_GROUP } from "./LeftRail";

interface StatusBarProps {
	isRailExpanded: boolean;
	activeView?: string;
}

type DrawerType = "left" | "main" | "right" | null;

type ConquerItem = {
	id: string;
	label: string;
	icon: LucideIcon;
};

const SlideUpPanel = ({
	isOpen,
	onClose,
	children,
	height = 400,
}: {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	height?: number;
}) => {
	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		globalThis.addEventListener("keydown", handleKeyDown);
		return () => globalThis.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ y: "100%" }}
					animate={{ y: 0 }}
					exit={{ y: "100%" }}
					transition={{ type: "spring", damping: 30, stiffness: 300 }}
					className="absolute bottom-full left-0 right-0 bg-bg-surface/90 backdrop-blur-2xl border border-glass-stroke border-b-0 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden rounded-t-2xl"
					style={{ height }}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export const StatusBar = ({ isRailExpanded, activeView }: StatusBarProps) => {
	const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
	const conquerItems = (CONQUER_GROUP?.[0]?.items || []) as ConquerItem[];
	const [activeConquerItemId, setActiveConquerItemId] = useState<string>(
		conquerItems.find((i) => i.id === "account")?.id ||
			conquerItems[0]?.id ||
			"account"
	);
	const activeConquerItem =
		conquerItems.find((i) => i.id === activeConquerItemId) ||
		conquerItems[0];
	const conquerTitle = activeConquerItem?.label
		? `Conquer — ${activeConquerItem.label}`
		: "Conquer";

	const toggleDrawer = (type: DrawerType) => {
		setActiveDrawer(activeDrawer === type ? null : type);
	};

	return (
		<div className="contents">
			{/* Slot 3,1: Brand/Conquer Group Footer (500px) */}
			<div className="border-t border-r border-glass-stroke bg-bg-surface relative transition-all duration-300 flex-shrink-0 z-40">
				<SlideUpPanel
					isOpen={activeDrawer === "left"}
					onClose={() => setActiveDrawer(null)}
					height={320}
				>
					<div className="h-full flex flex-col">
						<div className="px-4 pt-3 pb-3 border-b border-glass-stroke flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-glass-subtle border border-glass-stroke text-accent-cyan">
									<Trophy size={16} />
								</div>
								<div className="flex flex-col">
									<span className="text-[10px] font-mono tracking-[0.28em] uppercase text-white/60">
										Conquer
									</span>
									<span className="text-xs text-white/30 font-mono tracking-widest">
										Account • Notifications • Help •
										Settings
									</span>
								</div>
							</div>
							<button
								onClick={() => setActiveDrawer(null)}
								className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 border border-transparent hover:border-glass-stroke transition-colors"
								title="Close"
							>
								<ChevronDown size={16} />
							</button>
						</div>

						<div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-2">
							{conquerItems.map((item) => {
								const Icon = item.icon;
								const active = item.id === activeConquerItemId;
								return (
									<button
										key={item.id}
										onClick={() =>
											setActiveConquerItemId(item.id)
										}
										className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${
											active
												? "bg-accent-cyan/10 border-accent-cyan/20 text-white"
												: "bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10"
										}`}
										title={item.label}
									>
										<Icon
											size={16}
											className={
												active
													? "text-accent-cyan"
													: "text-white/30"
											}
										/>
										<span className="text-xs font-mono tracking-widest uppercase">
											{item.label}
										</span>
										{active && (
											<div className="ml-auto flex items-center gap-2">
												<span className="text-[10px] text-accent-cyan/80 font-mono tracking-widest uppercase">
													Active
												</span>
												<div className="w-7 h-4 rounded-full bg-accent-cyan/20 border border-accent-cyan/20 relative">
													<div className="absolute top-1/2 -translate-y-1/2 right-1 w-2.5 h-2.5 rounded-full bg-accent-cyan shadow-glow" />
												</div>
											</div>
										)}
									</button>
								);
							})}
						</div>
					</div>
				</SlideUpPanel>

				<button
					onClick={() => toggleDrawer("left")}
					className="flex items-center size-full whitespace-nowrap overflow-hidden h-full group"
					title={conquerTitle}
				>
					<div className="flex-shrink-0 h-full flex items-center justify-center px-3">
						<div
							className={`w-[clamp(34px,4.8vh,44px)] h-[clamp(34px,4.8vh,44px)] rounded-full border transition-colors flex items-center justify-center ${
								activeDrawer === "left"
									? "border-accent-cyan/30 bg-accent-cyan/10"
									: "border-white/10 bg-black/10 group-hover:bg-white/5 group-hover:border-white/20"
							}`}
						>
							<Trophy
								size={18}
								strokeWidth={1.5}
								className="text-white/60 group-hover:text-white transition-colors"
								aria-label="Conquer"
							/>
						</div>
					</div>
					{isRailExpanded && (
						<div className="flex-1 h-full flex items-center pr-4 min-w-0">
							<span className="text-[12px] font-mono tracking-[0.3em] uppercase text-white/70 pt-0.5">
								Conquer
							</span>
							<div className="ml-auto flex items-center gap-3">
								<motion.div
									animate={{
										rotate:
											activeDrawer === "left" ? 180 : 0,
									}}
									className="text-white/20 group-hover:text-white transition-colors"
								>
									<ChevronUp size={16} strokeWidth={1.5} />
								</motion.div>
							</div>
						</div>
					)}
				</button>
			</div>

			{/* Slot 3,2: Workbench Footer (Flexible) */}
			<div className="flex-1 border-t border-r border-glass-stroke bg-bg-surface/20 backdrop-blur-sm relative min-w-0 z-40">
				<SlideUpPanel
					isOpen={activeDrawer === "main"}
					onClose={() => setActiveDrawer(null)}
					height={500}
				>
					<div className="p-12 h-full flex flex-col">
						<h3 className="text-[10px] font-brand tracking-[0.4em] text-white/20 uppercase mb-8">
							SYSTEM WORKBENCH STATUS
						</h3>
						<div className="grid grid-cols-3 gap-12 flex-1">
							<div className="space-y-6">
								<p className="text-xs font-brand text-accent-cyan uppercase tracking-[0.3em]">
									CPU INTEGRITY
								</p>
								<div className="h-[200px] border border-white/5 bg-white/5 rounded-2xl flex items-center justify-center">
									<span className="text-4xl font-brand font-thin text-white/10">
										98%
									</span>
								</div>
							</div>
							<div className="space-y-6">
								<p className="text-xs font-brand text-accent-cyan uppercase tracking-[0.3em]">
									SYNC STATUS
								</p>
								<div className="h-[200px] border border-white/5 bg-white/5 rounded-2xl flex items-center justify-center">
									<span className="text-2xl font-brand font-thin text-white/10">
										ACTIVE
									</span>
								</div>
							</div>
							<div className="space-y-6">
								<p className="text-xs font-brand text-accent-cyan uppercase tracking-[0.3em]">
									UPTIME
								</p>
								<div className="h-[200px] border border-white/5 bg-white/5 rounded-2xl flex items-center justify-center">
									<span className="text-2xl font-brand font-thin text-white/10">
										04:22:15
									</span>
								</div>
							</div>
						</div>
					</div>
				</SlideUpPanel>

				<button
					onClick={() => toggleDrawer("main")}
					className="flex items-center size-full px-6 gap-6 group"
				>
					<div className="flex items-center gap-4 flex-shrink-0">
						<div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse shadow-glow" />
						<div className="flex flex-col">
							<span className="text-base font-brand font-thin text-white/30 uppercase pt-0.5 text-nowrap">
								System Active
							</span>
							{activeView && (
								<span className="text-[10px] font-mono tracking-widest text-white/20 uppercase">
									{activeView.split("-").join(" ")}
								</span>
							)}
						</div>
					</div>

					<div className="flex items-center gap-6 flex-1 max-w-[460px]">
						<div className="flex flex-col gap-1 flex-1">
							<div className="flex justify-between text-[10px] font-brand text-white/20 tracking-widest">
								<span>MASTERED</span>
								<span className="text-accent-cyan">42</span>
							</div>
							<div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
								<div className="h-full bg-accent-cyan/50 w-[80%]" />
							</div>
						</div>
						<div className="flex flex-col gap-1 flex-1">
							<div className="flex justify-between text-[10px] font-brand text-white/20 tracking-widest">
								<span>INTEGRITY</span>
								<span className="text-accent-cyan">98%</span>
							</div>
							<div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
								<div className="h-full bg-accent-cyan w-[98%]" />
							</div>
						</div>
					</div>

					<motion.div
						animate={{ rotate: activeDrawer === "main" ? 180 : 0 }}
						className="ml-auto text-white/20 group-hover:text-white transition-colors"
					>
						<ChevronUp size={18} />
					</motion.div>
				</button>
			</div>

			{/* Slot 3,3: Assistant Footer */}
			<div className="flex-[1.5] border-t border-glass-stroke bg-bg-surface/50 backdrop-blur-md relative z-40">
				<SlideUpPanel
					isOpen={activeDrawer === "right"}
					onClose={() => setActiveDrawer(null)}
					height={600}
				>
					<div className="p-12 space-y-8">
						<h3 className="text-[10px] font-brand tracking-[0.4em] text-accent-cyan uppercase">
							ASSISTANT DIAGNOSTICS
						</h3>
						<div className="space-y-4">
							<div className="p-6 border border-glass-stroke bg-white/5 rounded-2xl flex items-center justify-between">
								<span className="text-xl font-brand font-thin text-white/60">
									AI Context Pulse
								</span>
								<span className="text-accent-cyan">
									NOMINAL
								</span>
							</div>
							<div className="p-6 border border-glass-stroke bg-white/5 rounded-2xl flex items-center justify-between">
								<span className="text-xl font-brand font-thin text-white/60">
									Figma Bridge
								</span>
								<span className="text-accent-cyan">STABLE</span>
							</div>
						</div>
					</div>
				</SlideUpPanel>

				<button
					onClick={() => toggleDrawer("right")}
					className="flex items-center size-full px-6 justify-between group"
				>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-3 py-1 px-3 rounded-lg bg-accent-cyan/5 border border-accent-cyan/10">
							<div className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-glow" />
							<span className="text-base font-brand font-thin text-accent-cyan uppercase pt-0.5 text-nowrap">
								System: Nominal
							</span>
						</div>
					</div>
					<motion.div
						animate={{ rotate: activeDrawer === "right" ? 180 : 0 }}
						className="text-white/20 group-hover:text-white transition-colors"
					>
						<ChevronUp size={18} />
					</motion.div>
				</button>
			</div>
		</div>
	);
};
