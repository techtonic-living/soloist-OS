import {
	Book,
	HelpCircle,
	FileText,
	Home,
	Layers,
	Search,
	Settings,
	GitBranch,
	ChevronRight,
} from "lucide-react";

type ToolId =
	| "explore"
	| "define"
	| "structure"
	| "document"
	| "learn"
	| "record";

type ToolbarTabProps = {
	id: ToolId;
	label: string;
	active?: boolean;
	disabled?: boolean;
	// IMPORTANT: tool identity must live on the surface (Option A). Icons remain tone-based.
	accentClass:
		| "accent-cyan"
		| "accent-sky"
		| "accent-blue"
		| "accent-indigo"
		| "accent-violet"
		| "accent-magenta";
};

const ACCENT_SURFACE: Record<
	ToolbarTabProps["accentClass"],
	{ bg: string; ring: string }
> = {
	"accent-cyan": { bg: "bg-accent-cyan/10", ring: "ring-accent-cyan/20" },
	"accent-sky": { bg: "bg-accent-sky/10", ring: "ring-accent-sky/20" },
	"accent-blue": { bg: "bg-accent-blue/10", ring: "ring-accent-blue/20" },
	"accent-indigo": {
		bg: "bg-accent-indigo/10",
		ring: "ring-accent-indigo/20",
	},
	"accent-violet": {
		bg: "bg-accent-violet/10",
		ring: "ring-accent-violet/20",
	},
	"accent-magenta": {
		bg: "bg-accent-magenta/10",
		ring: "ring-accent-magenta/20",
	},
};

function ToolbarTab({
	label,
	active,
	disabled,
	accentClass,
}: Readonly<ToolbarTabProps>) {
	const base =
		"h-[30px] px-3 inline-flex items-center gap-2 rounded-full transition-all duration-300 select-none";
	const text =
		"font-mono text-[12px] leading-none tracking-[-0.12px] uppercase";

	const inactiveCls = "text-white/45 hover:text-white/75";
	const accent = ACCENT_SURFACE[accentClass];
	const activeCls = `text-white/90 ${accent.bg} ring-1 ${accent.ring} shadow-[0_0_10px_rgba(255,255,255,0.05)]`;
	const disabledCls = "opacity-30 pointer-events-none";

	// Icons are tone-based (white-ish) regardless of tool.
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			className={`${base} ${text} ${active ? activeCls : inactiveCls} ${
				disabled ? disabledCls : ""
			}`}
			disabled={disabled}
		>
			<Layers size={14} className="text-white/60" />
			<span>{label}</span>
		</button>
	);
}

function ToolbarDivider() {
	return <div className="h-4 w-px bg-white/10" />;
}

function ChevronPill({
	label,
	active,
}: Readonly<{ label: string; active?: boolean }>) {
	return (
		<button
			type="button"
			title={label}
			aria-label={label}
			className={`h-[30px] w-[30px] rounded-full border border-glass-stroke bg-bg-surface/40 backdrop-blur-sm transition-all duration-300 ${
				active ? "shadow-neon-glow" : "hover:bg-white/5"
			}`}
		>
			<div className="flex items-center justify-center">
				<ChevronRight size={16} className="text-white/60" />
			</div>
		</button>
	);
}

/**
 * Mockup: Primary Toolbars
 *
 * Goal: match the aesthetic of the Figma "Primary Toolbars" page while obeying repo invariants:
 * - Tool identity on the surface (Option A)
 * - Icons remain tone-based (no tool-colored icon variants)
 * - No cursor-not-allowed on disabled
 */
export function PrimaryToolbarsMock() {
	return (
		<div className="space-y-4">
			<div className="text-xs text-white/60">
				<span className="font-mono tracking-wider text-white/70">
					Mock
				</span>{" "}
				<span className="mx-2 text-white/30">{"•"}</span> Tool identity
				lives on the pill surface; icons stay tone-based.
			</div>

			{/* Full-width primary toolbar */}
			<div className="h-[30px] w-full rounded-xl border border-glass-stroke bg-bg-surface/50 backdrop-blur-md flex items-center gap-2 px-2">
				<div className="flex items-center gap-2 pl-1 pr-2">
					<div className="flex items-center gap-2">
						<div className="size-[18px] rounded-full bg-white/5 border border-glass-stroke flex items-center justify-center">
							<Home size={14} className="text-white/70" />
						</div>
						<div className="font-mono text-[12px] tracking-wider uppercase text-white/55">
							Soloist OS
						</div>
					</div>
					<div className="text-white/20">/</div>
					<button
						type="button"
						title="Home"
						aria-label="Home"
						className="h-[30px] px-3 rounded-full inline-flex items-center gap-2 text-white/55 hover:text-white/80 transition-colors"
					>
						<Home size={14} className="text-white/60" />
						<span className="font-mono text-[12px] uppercase tracking-[-0.12px]">
							Home
						</span>
					</button>
				</div>

				<ToolbarDivider />

				<div className="flex items-center gap-1 min-w-0">
					<ToolbarTab
						id="explore"
						label="Explore"
						accentClass="accent-cyan"
						active
					/>
					<ToolbarTab
						id="define"
						label="Define"
						accentClass="accent-sky"
					/>
					<ToolbarTab
						id="structure"
						label="Structure"
						accentClass="accent-blue"
					/>
					<ToolbarTab
						id="document"
						label="Document"
						accentClass="accent-indigo"
					/>
					<ToolbarTab
						id="learn"
						label="Learn"
						accentClass="accent-violet"
					/>
					<ToolbarTab
						id="record"
						label="Record"
						accentClass="accent-magenta"
						disabled
					/>
				</div>

				<div className="ml-auto flex items-center gap-1">
					<ChevronPill label="Next" active />
					<ChevronPill label="Next" />
				</div>
			</div>

			{/* Compact icon cluster variant */}
			<div className="w-fit rounded-xl border border-glass-stroke bg-bg-surface/40 backdrop-blur-md flex items-center gap-1 px-1 py-1">
				<button
					type="button"
					title="Home"
					aria-label="Home"
					className="h-[30px] w-[30px] rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
				>
					<Home size={16} className="text-white/60" />
				</button>
				<button
					type="button"
					title="Explore"
					aria-label="Explore"
					className="h-[30px] w-[30px] rounded-full bg-accent-cyan/10 ring-1 ring-accent-cyan/20 shadow-neon-glow transition-colors flex items-center justify-center"
				>
					<Search size={16} className="text-white/70" />
				</button>
				<button
					type="button"
					title="Define"
					aria-label="Define"
					className="h-[30px] w-[30px] rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
				>
					<Settings size={16} className="text-white/60" />
				</button>
				<button
					type="button"
					title="Structure"
					aria-label="Structure"
					className="h-[30px] w-[30px] rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
				>
					<GitBranch size={16} className="text-white/60" />
				</button>
				<button
					type="button"
					title="Document"
					aria-label="Document"
					className="h-[30px] w-[30px] rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
				>
					<FileText size={16} className="text-white/60" />
				</button>
				<button
					type="button"
					title="Learn"
					aria-label="Learn"
					className="h-[30px] w-[30px] rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
				>
					<Book size={16} className="text-white/60" />
				</button>
				<button
					type="button"
					title="Record"
					aria-label="Record"
					disabled
					className="h-[30px] w-[30px] rounded-full opacity-30 pointer-events-none flex items-center justify-center"
				>
					<HelpCircle size={16} className="text-white/60" />
				</button>
			</div>
		</div>
	);
}
