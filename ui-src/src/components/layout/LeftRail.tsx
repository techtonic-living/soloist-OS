import { useState } from "react";
import {
	Palette,
	Shapes,
	Type,
	Layers,
	LayoutDashboard,
	Variable,
	PaintBucket,
	Coins,
	Flag,
	Book,
	FileText,
	Ruler,
	Grid3X3,
	BookOpen,
	Droplet,
	Pilcrow,
	Sticker,
	LibraryBig,
	LayoutTemplate,
	GraduationCap,
	StickyNote,
	CalendarDays,
	Pin,
	FileBox,
	Settings,
	User,
	Bell,
	LifeBuoy,
	ChevronLeft,
	ChevronDown,
	LucideIcon,
	Compass,
	Pencil,
	Blocks,
	Files,
	Lightbulb,
	Trophy,
	Share2,
	FolderTree,
	Terminal,
	Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_GROUPS = [
	{
		id: "explore",
		label: "Explore",
		icon: Compass,
		color: "text-cyan-400",
		borderColor: "border-cyan-400/30",
		items: [
			{ id: "explore-colors", label: "Colors", icon: Palette },
			{ id: "explore-typography", label: "Typography", icon: Type },
			{ id: "explore-layouts", label: "Layouts", icon: LayoutDashboard },
			{
				id: "explore-iconography",
				label: "Iconography",
				icon: Shapes,
			},
		],
	},
	{
		id: "define",
		label: "Define",
		icon: Pencil,
		color: "text-sky-400",
		borderColor: "border-sky-400/30",
		items: [
			{ id: "define-variables", label: "Variables", icon: Variable },
			{ id: "define-styles", label: "Styles", icon: PaintBucket },
			{ id: "define-tokens", label: "Tokens", icon: Coins },
		],
	},
	{
		id: "structure",
		label: "Structure",
		icon: Blocks,
		color: "text-blue-400",
		borderColor: "border-blue-400/30",
		items: [
			{ id: "structure-principles", label: "Principles", icon: Flag },
			{ id: "structure-guidelines", label: "Guidelines", icon: Book },
			{ id: "structure-specs", label: "Specs", icon: Ruler },
		],
	},
	{
		id: "document",
		label: "Document",
		icon: Files,
		color: "text-indigo-400",
		borderColor: "border-indigo-400/30",
		items: [
			{ id: "document-overview", label: "Overview", icon: FileText },
			{ id: "document-color", label: "Color", icon: Droplet },
			{ id: "document-typography", label: "Typography", icon: Pilcrow },
			{ id: "document-elevations", label: "Elevations", icon: Layers },
			{ id: "document-grid", label: "Grid", icon: Grid3X3 },
			{ id: "document-icons", label: "Icons", icon: Sticker },
		],
	},
	{
		id: "learn",
		label: "Learn",
		icon: Lightbulb,
		color: "text-violet-400",
		borderColor: "border-violet-400/30",
		items: [
			{ id: "learn-library", label: "Library", icon: LibraryBig },
			{ id: "learn-guidelines", label: "Guidelines", icon: BookOpen },
			{ id: "learn-templates", label: "Templates", icon: LayoutTemplate },
			{ id: "learn-tutorials", label: "Tutorials", icon: GraduationCap },
		],
	},
	{
		id: "record",
		label: "Record",
		icon: StickyNote,
		color: "text-fuchsia-400",
		borderColor: "border-fuchsia-400/30",
		items: [
			{ id: "record-journal", label: "Journal", icon: StickyNote },
			{ id: "record-planner", label: "Planner", icon: CalendarDays },
			{ id: "record-corkboard", label: "Corkboard", icon: Pin },
			{ id: "record-filing", label: "Filing Cabinet", icon: FileBox },
		],
	},
	{
		id: "system",
		label: "System",
		icon: Cpu,
		color: "text-emerald-300",
		borderColor: "border-emerald-300/30",
		items: [
			{ id: "connect", label: "Connect", icon: Share2 },
			{ id: "define-tokens", label: "Tokens", icon: Coins },
			{ id: "organize", label: "Organize", icon: FolderTree },
			{ id: "knowledge", label: "Knowledge", icon: BookOpen },
			{ id: "export", label: "Export", icon: Terminal },
			{ id: "settings", label: "Settings", icon: Settings },
		],
	},
];

export const CONQUER_GROUP = [
	{
		id: "conquer",
		label: "Conquer",
		icon: Trophy,
		color: "text-white",
		borderColor: "border-white/20",
		items: [
			{ id: "account", label: "Account", icon: User },
			{ id: "notifications", label: "Notifications", icon: Bell },
			{ id: "help", label: "Help Center", icon: LifeBuoy },
			{ id: "settings", label: "User Settings", icon: Settings },
		],
	},
];

interface LeftRailProps {
	activeTool: string;
	onSelectTool: (id: string) => void;
	isExpanded: boolean;
	onToggleExpand: () => void;
	uiDensity?: "compact" | "cozy" | "spacious";
}

const DENSITY_MAP = {
	compact: {
		iconSize: 18,
		groupGap: "space-y-2",
		navPadding: "py-2",
		buttonPadding: "px-3 py-2",
		collapsedButtonPadding: "p-2.5",
		buttonGap: "gap-2",
		groupHeaderMargin: "mb-2",
		headerIconSize: 20,
		headerGap: "gap-3 lg:gap-4",
	},
	cozy: {
		iconSize: 20,
		groupGap: "space-y-3",
		navPadding: "py-2.5",
		buttonPadding: "px-3 py-2.5",
		collapsedButtonPadding: "p-3",
		buttonGap: "gap-2.5",
		groupHeaderMargin: "mb-2.5",
		headerIconSize: 22,
		headerGap: "gap-4 lg:gap-5",
	},
	spacious: {
		iconSize: 22,
		groupGap: "space-y-4",
		navPadding: "py-3",
		buttonPadding: "px-4 py-3",
		collapsedButtonPadding: "p-3.5",
		buttonGap: "gap-3",
		groupHeaderMargin: "mb-3",
		headerIconSize: 24,
		headerGap: "gap-5 lg:gap-6",
	},
};

export const LeftRail = ({
	activeTool,
	onSelectTool,
	isExpanded,
	onToggleExpand,
	uiDensity = "cozy",
}: LeftRailProps) => {
	// Initialize with only "Explore" expanded
	const [expandedGroups, setExpandedGroups] = useState<string[]>(["explore"]);
	const density = DENSITY_MAP[uiDensity];

	const toggleGroup = (groupId: string) => {
		setExpandedGroups((prev) => (prev.includes(groupId) ? [] : [groupId]));
	};

	return (
		<motion.div className="h-full min-h-0 bg-bg-surface border-r border-glass-stroke flex flex-col flex-shrink-0 z-50 relative group/rail">
			{/* Rail Toggle Button */}
			<button
				onClick={onToggleExpand}
				className={`absolute top-20 soloist-rail-toggle-anchor w-[clamp(40px,5vh,52.5px)] h-[clamp(40px,5vh,52.5px)] rounded-full bg-bg-raised border border-glass-stroke flex items-center justify-center text-white/50 hover:text-white transition-all duration-300 z-50 opacity-0 group-hover/rail:opacity-100 shadow-glass`}
				title={isExpanded ? "Collapse navigation" : "Expand navigation"}
				aria-label={
					isExpanded ? "Collapse navigation" : "Expand navigation"
				}
			>
				<ChevronLeft
					size={20}
					strokeWidth={1.5}
					className={`transition-transform duration-300 ${
						isExpanded ? "rotate-0" : "rotate-180"
					}`}
				/>
			</button>

			{/* Main Nav Scroller */}
			<div
				className={`flex-1 overflow-y-auto ${density.navPadding} ${
					density.groupGap
				} overflow-x-hidden ${
					isExpanded ? "custom-scrollbar" : "scrollbar-none"
				}`}
			>
				{NAV_GROUPS.map((group) => {
					const isGroupExpanded = expandedGroups.includes(group.id);
					const showItems = isGroupExpanded;
					const Icon = group.icon;

					const activeCollapsed = !isExpanded && isGroupExpanded;

					const railPadding = isExpanded
						? "px-3 lg:px-4 mx-0"
						: "px-1.5 mx-0";
					const inactiveWrapperClasses = `border-transparent bg-transparent p-0 ${railPadding}`;
					const wrapperClasses = `transition-all duration-300 relative z-10 border ${
						isExpanded ? "rounded-xl" : "rounded-full"
					} ${
						activeCollapsed
							? `bg-bg-surface/60 ${group.borderColor} p-0.5 mx-1 shadow-inner`
							: inactiveWrapperClasses
					}`;

					return (
						<div key={group.id} className={wrapperClasses}>
							<AnimatePresence mode="wait">
								<motion.button
									key="header"
									title={group.label}
									onClick={() => toggleGroup(group.id)}
									className={`flex items-center w-full text-xs font-mono tracking-[0.2em] uppercase ${
										density.groupHeaderMargin
									} whitespace-nowrap transition-colors group/header ${
										isExpanded
											? "justify-between"
											: "justify-center"
									} ${
										isGroupExpanded
											? group.color
											: `text-white/40 hover:text-white`
									}`}
								>
									<div
										className={`flex items-center ${
											density.headerGap ||
											"gap-4 lg:gap-6"
										}`}
									>
										<Icon
											size={density.headerIconSize}
											strokeWidth={1.5}
											className={
												isGroupExpanded
													? "opacity-100"
													: "opacity-70"
											}
										/>
										{isExpanded && (
											<motion.span
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												className="truncate"
											>
												{group.label}
											</motion.span>
										)}
									</div>
									{isExpanded && (
										<ChevronDown
											size={14}
											strokeWidth={1.5}
											className={`transition-transform duration-200 ${
												isGroupExpanded
													? "rotate-180"
													: "rotate-0"
											}`}
										/>
									)}
								</motion.button>
							</AnimatePresence>

							{!isExpanded && isGroupExpanded && (
								<div className="h-[1px] w-6 bg-white/10 mx-auto mb-4" />
							)}

							<motion.div
								initial={false}
								animate={{
									height: showItems ? "auto" : 0,
									opacity: showItems ? 1 : 0,
								}}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 30,
								}}
								className="space-y-2 overflow-hidden"
							>
								{group.items.map((item) => (
									<NavButton
										key={item.id}
										active={activeTool === item.id}
										onClick={() => onSelectTool(item.id)}
										icon={item.icon}
										label={item.label}
										tooltip={`${group.label} — ${item.label}`}
										isExpanded={isExpanded}
										activeColor={group.color}
										iconSize={density.iconSize}
										padding={density.buttonPadding}
										collapsedPadding={
											density.collapsedButtonPadding
										}
										gap={density.buttonGap}
									/>
								))}
							</motion.div>
						</div>
					);
				})}
			</div>
		</motion.div>
	);
};

interface NavButtonProps {
	active: boolean;
	onClick: () => void;
	icon: LucideIcon;
	label: string;
	tooltip?: string;
	isExpanded: boolean;
	activeColor?: string;
	iconSize: number;
	padding: string;
	collapsedPadding: string;
	gap: string;
}

const NavButton = ({
	active,
	onClick,
	icon: Icon,
	label,
	tooltip,
	isExpanded,
	activeColor,
	iconSize,
	padding,
	collapsedPadding,
	gap,
}: NavButtonProps) => {
	const baseTextColor = activeColor ?? "text-white";
	const activeTextColor = activeColor ?? "text-accent-cyan";
	const activeIndicatorColor = activeColor
		? activeColor.replace("text-", "bg-")
		: "bg-accent-cyan";

	return (
		<button
			onClick={onClick}
			title={tooltip || label}
			aria-label={tooltip || label}
			aria-current={active ? "page" : undefined}
			className={`w-full flex items-center justify-between ${
				isExpanded ? "rounded-xl" : "rounded-full"
			} text-[10px] lg:text-xs transition-all duration-200 group overflow-hidden ${
				isExpanded ? padding : `${collapsedPadding}`
			} ${
				active
					? `bg-white/5 border border-white/10 shadow-glow ${activeTextColor}`
					: `${baseTextColor} opacity-50 hover:opacity-100 hover:bg-white/5 border border-transparent`
			}`}
		>
			<div className={`flex items-center ${gap}`}>
				<Icon
					size={iconSize}
					strokeWidth={1.5}
					className={`flex-shrink-0 transition-transform duration-300 ${
						active ? "scale-110" : "group-hover:scale-110"
					}`}
				/>
				{isExpanded && (
					<motion.span
						initial={{ opacity: 0, x: -5 }}
						animate={{ opacity: 1, x: 0 }}
						className="font-medium whitespace-nowrap pt-0.5 truncate"
					>
						{label}
					</motion.span>
				)}
			</div>
			{active && isExpanded && (
				<div
					className={`ml-auto w-1 h-3 rounded-full flex-shrink-0 ${activeIndicatorColor}`}
				/>
			)}
		</button>
	);
};
