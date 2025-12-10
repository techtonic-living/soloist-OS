import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Book,
	Code,
	Save,
	Github,
	Plus,
	Search,
	Tag as TagIcon,
	Pin,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSoloistSystem } from "../hooks/useSoloistSystem";

interface KBEntry {
	id: number;
	title: string;
	type: "journal" | "cheatsheet";
	content: string;
	date: string;
	tags: string[];
	pinned: boolean;
}

export const KnowledgeBase = () => {
	const { dataStore, updateData, settings } = useSoloistSystem();
	const [activeTab, setActiveTab] = useState<"journal" | "cheatsheet">(
		"journal"
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	// Load entries or default
	const entries: KBEntry[] = dataStore["kb-entries"] || [
		{
			id: 1,
			title: "Typography Scale",
			type: "cheatsheet",
			content:
				"## Base: 16px\n\n- Scale: 1.250 (Major Third)\n- `h1`: 3.052rem\n- `h2`: 2.441rem",
			date: "2025-12-01",
			tags: ["design", "tokens"],
			pinned: true,
		},
		{
			id: 2,
			title: "Design System V2 Notes",
			type: "journal",
			content:
				"Moving to **OKLCH** for better gradients. \n\n```css\n.bg-void {\n  background: oklch(0.15 0.05 280);\n}\n```",
			date: "2025-12-05",
			tags: ["planning"],
			pinned: false,
		},
	];

	const handleNewEntry = () => {
		const newEntry: KBEntry = {
			id: Date.now(),
			title: "New Note",
			type: activeTab,
			content: "# New Entry\nstart typing...",
			date: new Date().toISOString().split("T")[0],
			tags: [],
			pinned: false,
		};
		updateData("kb-entries", [newEntry, ...entries]);
	};

	const togglePin = (id: number) => {
		const updated = entries.map((e) =>
			e.id === id ? { ...e, pinned: !e.pinned } : e
		);
		updateData("kb-entries", updated);
	};

	// Derived state for filtering
	const displayedEntries = useMemo(() => {
		return entries
			.filter((e) => e.type === activeTab)
			.filter(
				(e) =>
					e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					e.content.toLowerCase().includes(searchQuery.toLowerCase())
			)
			.filter((e) => (selectedTag ? e.tags.includes(selectedTag) : true))
			.sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1)); // Pinned first
	}, [entries, activeTab, searchQuery, selectedTag]);

	// Extract unique tags for the current tab
	const availableTags = useMemo(() => {
		const tags = new Set<string>();
		entries
			.filter((e) => e.type === activeTab)
			.forEach((e) => e.tags.forEach((t) => tags.add(t)));
		return Array.from(tags);
	}, [entries, activeTab]);

	return (
		<div className="h-full flex flex-col gap-6">
			{/* Controls Header */}
			<div className="flex items-center justify-between">
				<div className="flex bg-bg-surface p-1 rounded-lg border border-glass-stroke shadow-inner">
					<TabButton
						active={activeTab === "journal"}
						onClick={() => {
							setActiveTab("journal");
							setSelectedTag(null);
						}}
						icon={Book}
						label="Journal"
					/>
					<TabButton
						active={activeTab === "cheatsheet"}
						onClick={() => {
							setActiveTab("cheatsheet");
							setSelectedTag(null);
						}}
						icon={Code}
						label="Refs"
					/>
				</div>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface border border-glass-stroke text-xs text-gray-500 font-mono">
						{settings.storageType === "github" ? (
							<Github size={12} />
						) : (
							<Save size={12} />
						)}
						<span>{settings.storageType.toUpperCase()}</span>
					</div>
					<button
						onClick={handleNewEntry}
						className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-all text-xs uppercase tracking-wider font-semibold"
					>
						<Plus size={14} />
						<span>New Entry</span>
					</button>
				</div>
			</div>

			{/* Search & Tags */}
			<div className="flex flex-col gap-3">
				<div className="relative group">
					<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
						<Search
							size={16}
							className="text-gray-600 group-focus-within:text-accent-cyan transition-colors"
						/>
					</div>
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search knowledge base..."
						className="w-full bg-bg-void border border-glass-stroke rounded-xl py-4 pl-12 pr-4 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-accent-cyan/50 focus:shadow-[0_0_30px_rgba(63,227,242,0.1)] transition-all font-mono text-sm"
					/>
				</div>
				{availableTags.length > 0 && (
					<div className="flex gap-2 items-center overflow-x-auto custom-scrollbar pb-1">
						<TagIcon
							size={12}
							className="text-gray-600 flex-shrink-0"
						/>
						{availableTags.map((tag) => (
							<button
								key={tag}
								onClick={() =>
									setSelectedTag(
										selectedTag === tag ? null : tag
									)
								}
								className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
									selectedTag === tag
										? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan"
										: "bg-bg-surface border-glass-stroke text-gray-500 hover:border-gray-400"
								}`}
							>
								#{tag}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Grid */}
			<div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-20">
				<AnimatePresence>
					{displayedEntries.map((entry, i) => (
						<MonolithCard
							key={entry.id}
							index={i}
							entry={entry}
							onTogglePin={() => togglePin(entry.id)}
						/>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
	<button
		onClick={onClick}
		className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm ${
			active
				? "bg-bg-raised text-white shadow-md"
				: "text-gray-500 hover:text-gray-300"
		}`}
	>
		<Icon size={14} />
		<span>{label}</span>
	</button>
);

const MonolithCard = ({
	entry,
	index,
	onTogglePin,
}: {
	entry: KBEntry;
	index: number;
	onTogglePin: () => void;
}) => (
	<motion.div
		layout
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		exit={{ opacity: 0, scale: 0.95 }}
		transition={{ delay: index * 0.05 }}
		className={`group relative bg-bg-surface rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col ${
			entry.pinned
				? "border-accent-cyan/30 shadow-[0_0_20px_rgba(63,227,242,0.1)]"
				: "border-glass-stroke shadow-monolith hover:shadow-monolith-hover"
		}`}
	>
		<div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-glass-highlight to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

		<div className="p-5 space-y-3 flex-1">
			<div className="flex justify-between items-start gap-4">
				<h3 className="font-display text-lg text-white group-hover:text-accent-cyan transition-colors line-clamp-1">
					{entry.title}
				</h3>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onTogglePin();
					}}
					className={`p-1.5 rounded-full transition-colors ${
						entry.pinned
							? "text-accent-cyan bg-accent-cyan/10"
							: "text-gray-600 hover:text-gray-300"
					}`}
				>
					<Pin
						size={12}
						className={entry.pinned ? "fill-current" : ""}
					/>
				</button>
			</div>

			{/* Markdown Content Preview */}
			<div className="prose prose-invert prose-sm max-w-none text-gray-400 font-mono text-xs leading-relaxed line-clamp-6 opacity-80 group-hover:opacity-100 transition-opacity">
				<ReactMarkdown>{entry.content}</ReactMarkdown>
			</div>
		</div>

		{/* Footer */}
		<div className="px-5 py-3 border-t border-glass-stroke bg-bg-void/30 flex justify-between items-center">
			<div className="flex gap-2">
				{entry.tags.map((tag) => (
					<span
						key={tag}
						className="text-[9px] text-accent-cyan/70 font-mono px-1.5 py-0.5 rounded bg-accent-cyan/5 border border-accent-cyan/10"
					>
						#{tag}
					</span>
				))}
			</div>
			<span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
				{entry.date}
			</span>
		</div>
	</motion.div>
);
