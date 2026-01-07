import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
	Home,
	Search,
	ChevronDown,
	Minus,
	Plus,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { PopoverMenu } from "../common/PopoverMenu";

interface TopNavBarProps {
	activeSectionLabel?: string;
	activeToolLabel: string;
	activeSubTool: string;
	onSetSubTool: (id: string) => void;
	uiDensity: "compact" | "cozy" | "spacious";
	setUiDensity: (d: "compact" | "cozy" | "spacious") => void;
	uiSize: "small" | "medium" | "big";
	setUiSize: (s: "small" | "medium" | "big") => void;
	subTools?: { id: string; label: string }[];
	onGoHome: () => void;
	isRailExpanded: boolean;
}

const PROJECTS = [
	"My Project",
	"Soloist Brand",
	"App Redesign",
	"System Audit",
];

const LOGOMARK_SRC = "/assets/plugin-media/soloist_logomark.jpg";
const LOGOMARK_FALLBACK_SRC = "/assets/plugin-media/soloist_favicon.jpg";

const useViewportWidth = () => {
	const [width, setWidth] = useState<number>(() =>
		globalThis.window === undefined ? 1440 : globalThis.window.innerWidth
	);

	useEffect(() => {
		if (globalThis.window === undefined) return;
		const onResize = () => setWidth(globalThis.window.innerWidth);
		globalThis.window.addEventListener("resize", onResize);
		return () => globalThis.window.removeEventListener("resize", onResize);
	}, []);

	return width;
};

const SliderControl = ({
	value,
	onChange,
	options,
	iconLeft,
	iconRight,
	label,
}: {
	value: string;
	onChange: (v: any) => void;
	options: string[];
	iconLeft: ReactNode;
	iconRight: ReactNode;
	label: string;
}) => {
	const currentIndex = options.indexOf(value);
	const safeIndex = Math.max(0, currentIndex);

	return (
		<div className="flex-1 max-w-[220px] space-y-1.5 group/slider">
			<div className="rounded-full bg-black/20 border border-white/10 px-4 py-2 shadow-inner">
				<div className="flex items-center gap-3">
					<div className="text-white/30 group-hover/slider:text-white/60 transition-colors">
						{iconLeft}
					</div>
					<input
						type="range"
						min={0}
						max={Math.max(0, options.length - 1)}
						step={1}
						value={safeIndex}
						aria-label={label}
						onChange={(e) =>
							onChange(
								options[Number.parseInt(e.target.value, 10)]
							)
						}
						className="soloist-range flex-1"
					/>
					<div className="text-white/30 group-hover/slider:text-white/60 transition-colors">
						{iconRight}
					</div>
				</div>
			</div>
			<div className="text-center">
				<span className="text-[10px] font-mono tracking-[0.28em] uppercase text-white/40 group-hover/slider:text-white/70 transition-colors">
					{label}
				</span>
			</div>
		</div>
	);
};

export const TopNavBar = ({
	onGoHome,
	isRailExpanded,
	activeSectionLabel = "Explore",
	activeToolLabel,
	activeSubTool,
	onSetSubTool,
	subTools = [],
	uiDensity,
	setUiDensity,
	uiSize,
	setUiSize,
}: TopNavBarProps) => {
	const [isProjectOpen, setIsProjectOpen] = useState(false);
	const projectButtonRef = useRef<HTMLButtonElement | null>(null);
	const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isSubToolMenuOpen, setIsSubToolMenuOpen] = useState(false);
	const subToolButtonRef = useRef<HTMLButtonElement | null>(null);
	const [logomarkSrc, setLogomarkSrc] = useState<string>(LOGOMARK_SRC);
	const viewportWidth = useViewportWidth();

	// Breakpoints tuned for Figma-plugin style cramped headers. These are intentionally
	// conservative: hide non-essential chrome before anything goes off-screen.
	const isNarrow = viewportWidth < 980;
	const isVeryNarrow = viewportWidth < 860;
	const collapseSearch = viewportWidth < 1120;
	const hideHeaderSliders = viewportWidth < 1020;
	const collapseSubToolBar = viewportWidth < 980;

	const densityOptions = ["compact", "cozy", "spacious"];
	const sizeOptions = ["small", "medium", "big"];
	const hasSubTools = subTools.length > 0;

	const effectiveSubTool = useMemo(() => {
		if (!hasSubTools) return "";
		return subTools.some((s) => s.id === activeSubTool)
			? activeSubTool
			: subTools[0]?.id;
	}, [activeSubTool, hasSubTools, subTools]);

	const effectiveSubToolLabel = useMemo(() => {
		if (!hasSubTools) return "";
		return (
			subTools.find((s) => s.id === effectiveSubTool)?.label ||
			subTools[0]?.label ||
			"Mode"
		);
	}, [effectiveSubTool, hasSubTools, subTools]);

	useEffect(() => {
		// Close popovers when viewport changes to avoid stranded overlays.
		setIsProjectOpen(false);
		setIsSearchOpen(false);
		setIsSubToolMenuOpen(false);
	}, [viewportWidth]);

	const showWordmark = isRailExpanded && !isVeryNarrow;

	return (
		<div className="contents">
			{/* Left Column: Branding (matches left rail width) */}
			<div className="border-b border-r border-glass-stroke bg-bg-surface flex items-center transition-all duration-300 flex-shrink-0 overflow-hidden z-[120]">
				<button
					className="flex items-center size-full transition-all group outline-none h-full"
					onClick={onGoHome}
				>
					<div className="flex-shrink-0 h-full flex items-center justify-center px-3">
						<div className="w-[clamp(38px,5.2vh,50px)] h-[clamp(38px,5.2vh,50px)] rounded-full border border-glass-stroke bg-bg-raised shadow-glass flex items-center justify-center overflow-hidden">
							<img
								src={logomarkSrc}
								alt="Soloist logomark"
								className="h-full w-full object-cover"
								onError={() => {
									if (logomarkSrc !== LOGOMARK_FALLBACK_SRC) {
										setLogomarkSrc(LOGOMARK_FALLBACK_SRC);
									}
								}}
							/>
						</div>
					</div>

					{/* Wordmark hides when rail is collapsed (prevents clipped 'Sol…') */}
					<div
						className={`flex-1 h-full flex items-center pr-6 min-w-0 transition-all duration-300 ease-out overflow-hidden ${
							showWordmark
								? "max-w-[520px] opacity-100"
								: "max-w-0 opacity-0"
						}`}
					>
						<span
							className={`text-2xl font-brand font-thin tracking-wide text-white/80 group-hover:text-white transition-all duration-300 whitespace-nowrap ${
								showWordmark
									? "translate-x-0"
									: "-translate-x-10"
							}`}
						>
							Soloist OS
						</span>
					</div>
				</button>
			</div>

			{/* Main Column: Project + Navigator (Flexible) */}
			<div className="flex-1 min-w-0 flex items-stretch border-b border-r border-glass-stroke bg-bg-surface/50 backdrop-blur-md overflow-visible transition-all duration-300 z-[120]">
				{/* Project Selector Segment */}
				<div className="flex-[0.5] min-w-[120px] border-r border-glass-stroke flex items-center justify-center relative group/project px-6">
					<button
						onClick={() => setIsProjectOpen((v) => !v)}
						ref={projectButtonRef}
						className={`relative flex items-center justify-center gap-3 outline-none transition-all duration-200 ${
							isNarrow
								? "w-10 h-10 rounded-full bg-black/20 border border-white/10 hover:bg-white/5 hover:border-white/20"
								: "w-full h-[60%] rounded-xl bg-black/10 border border-white/10 hover:bg-white/5 hover:border-white/20"
						}`}
						aria-haspopup="menu"
					>
						{!isNarrow && (
							<span className="relative z-10 text-[14px] font-brand tracking-[0.4em] text-white/60 uppercase text-center truncate px-4">
								{selectedProject}
							</span>
						)}
						<ChevronDown size={14} className="text-white/30" />
					</button>

					<PopoverMenu
						open={isProjectOpen}
						anchorRef={projectButtonRef}
						onClose={() => setIsProjectOpen(false)}
						align="center"
						className="w-64 bg-bg-raised/95 border border-glass-stroke rounded-xl shadow-monolith z-[200] py-2 overflow-hidden backdrop-blur-xl"
					>
						{PROJECTS.map((p) => (
							<button
								key={p}
								onClick={() => {
									setSelectedProject(p);
									setIsProjectOpen(false);
								}}
								className="w-full text-left px-6 py-3 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between font-brand tracking-widest"
							>
								<span className="truncate uppercase">{p}</span>
								{selectedProject === p && (
									<div className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-glow" />
								)}
							</button>
						))}
					</PopoverMenu>
				</div>

				{/* Navigator Segment */}
				<div className="flex-1 flex items-center px-3 sm:px-6 gap-4 sm:gap-5 overflow-hidden min-w-0">
					{/* Home button */}
					<button
						onClick={onGoHome}
						className="flex items-center gap-3 group/nav h-10"
					>
						<Home
							size={22}
							className="text-white/30 group-hover/nav:text-white transition-colors"
						/>
						<span className="text-lg font-brand font-thin text-white/40 group-hover/nav:text-white transition-colors uppercase pt-0.5 hidden sm:inline">
							Home
						</span>
					</button>

					<div className="h-8 w-px bg-white/10" />

					{/* Breadcrumbs */}
					<div className="flex items-center gap-4 h-full min-w-0 overflow-hidden">
						<span className="text-lg font-brand font-thin text-accent-cyan uppercase pt-0.5 whitespace-nowrap truncate max-w-[28vw]">
							{activeSectionLabel}
						</span>
						<span className="text-white/20">/</span>
						<span className="text-lg font-brand font-thin text-accent-cyan uppercase pt-0.5 whitespace-nowrap truncate max-w-[28vw]">
							{activeToolLabel}
						</span>
					</div>

					{/* Subtool Mode Bar */}
					{hasSubTools &&
						(collapseSubToolBar ? (
							<div className="ml-auto flex items-center flex-shrink-0">
								<button
									ref={subToolButtonRef}
									onClick={() =>
										setIsSubToolMenuOpen((v) => !v)
									}
									className="h-10 px-3 rounded-full bg-black/20 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-2 text-white/60"
									aria-haspopup="menu"
									aria-label="Select mode"
								>
									<span className="text-[10px] font-mono uppercase tracking-[0.22em] truncate max-w-[22vw]">
										{effectiveSubToolLabel}
									</span>
									<ChevronDown
										size={14}
										className="text-white/30"
									/>
								</button>

								<PopoverMenu
									open={isSubToolMenuOpen}
									anchorRef={subToolButtonRef}
									onClose={() => setIsSubToolMenuOpen(false)}
									align="end"
									className="w-64 bg-bg-raised/95 border border-glass-stroke rounded-xl shadow-monolith z-[200] py-2 overflow-hidden backdrop-blur-xl"
								>
									{subTools.map((s) => {
										const active =
											s.id === effectiveSubTool;
										return (
											<button
												key={s.id}
												onClick={() => {
													onSetSubTool(s.id);
													setIsSubToolMenuOpen(false);
												}}
												className="w-full text-left px-6 py-3 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between font-brand tracking-widest"
											>
												<span className="truncate uppercase">
													{s.label}
												</span>
												{active && (
													<div className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-glow" />
												)}
											</button>
										);
									})}
								</PopoverMenu>
							</div>
						) : (
							<div className="ml-auto flex items-center gap-2 bg-bg-void/40 border border-glass-stroke rounded-xl p-1 shadow-inner flex-shrink-0">
								{subTools.map((s) => {
									const active = s.id === effectiveSubTool;
									return (
										<button
											key={s.id}
											onClick={() => onSetSubTool(s.id)}
											className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-[0.22em] transition-all ${
												active
													? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 shadow-glow"
													: "text-white/30 hover:text-white hover:bg-white/5 border border-transparent"
											}`}
										>
											{s.label}
										</button>
									);
								})}
							</div>
						))}
				</div>
			</div>

			{/* Right Column: Preferences + Search (1332px) */}
			<div className="flex-[1.5] border-b border-glass-stroke bg-bg-surface/50 backdrop-blur-md flex items-center z-[120] overflow-visible relative">
				{/* Preference Sliders Segment */}
				<div
					className={`flex-1 flex items-center gap-8 px-8 min-w-0 transition-all duration-300 ease-out ${
						hideHeaderSliders
							? "max-w-0 opacity-0 -translate-x-8 pointer-events-none"
							: "max-w-[900px] opacity-100 translate-x-0"
					}`}
				>
					<SliderControl
						label="Density"
						value={uiDensity}
						onChange={setUiDensity}
						options={densityOptions}
						iconLeft={<Minus size={14} />}
						iconRight={<Plus size={14} />}
					/>
					<SliderControl
						label="Zoom"
						value={uiSize}
						onChange={setUiSize}
						options={sizeOptions}
						iconLeft={<ZoomOut size={14} />}
						iconRight={<ZoomIn size={14} />}
					/>
				</div>

				{/* Search Bar Segment */}
				<div className="flex-shrink-0 pr-6 pl-2 flex items-center justify-end">
					{collapseSearch ? (
						<button
							onClick={() => setIsSearchOpen(true)}
							aria-label="Open search"
							className="h-10 w-10 rounded-full bg-black/20 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center text-white/50 hover:text-white"
						>
							<Search size={18} />
						</button>
					) : (
						<div className="w-[min(360px,26vw)]">
							<div className="w-full h-10 bg-white/5 rounded-lg flex items-center relative group/search border border-white/5 hover:border-white/10 focus-within:border-accent-cyan/30 focus-within:bg-accent-cyan/5 transition-all">
								<div className="absolute left-4 h-full flex items-center justify-center">
									<Search
										size={16}
										className="text-white/20 group-hover/search:text-white/60 group-focus-within/search:text-white transition-colors"
									/>
								</div>
								<input
									type="text"
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									placeholder="SEARCH COMMANDS..."
									className="size-full bg-transparent pl-14 pr-4 text-xs font-brand font-thin tracking-widest text-white outline-none placeholder:text-white/10"
								/>
							</div>
						</div>
					)}
				</div>

				{/* Search Overlay (icon mode) */}
				{isSearchOpen && (
					<div className="fixed inset-0 z-[250]">
						<button
							aria-label="Close search"
							onClick={() => setIsSearchOpen(false)}
							className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
						/>
						<div className="absolute top-0 right-0 h-[clamp(44px,6.5vh,60px)] w-[min(520px,86vw)] px-4 flex items-center">
							<div className="w-full h-10 bg-bg-raised/95 rounded-xl flex items-center relative border border-glass-stroke shadow-monolith backdrop-blur-xl">
								<div className="absolute left-4 h-full flex items-center justify-center">
									<Search
										size={16}
										className="text-white/70"
									/>
								</div>
								<input
									autoFocus
									type="text"
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									placeholder="SEARCH COMMANDS..."
									className="size-full bg-transparent pl-14 pr-4 text-xs font-brand font-thin tracking-widest text-white outline-none placeholder:text-white/20"
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
