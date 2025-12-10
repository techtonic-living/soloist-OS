import { useState } from "react";
import { motion } from "framer-motion";
import { Book, Code, Save, Github, Plus, Search } from "lucide-react";
import { useSoloistSystem } from "../hooks/useSoloistSystem";

export const KnowledgeBase = () => {
	const { dataStore, updateData, settings } = useSoloistSystem();
	const [activeTab, setActiveTab] = useState<"journal" | "cheatsheet">(
		"journal"
	);

	const entries: any[] = dataStore["kb-entries"] || [
		{
			id: 1,
			title: "Typography Scale",
			type: "cheatsheet",
			content: "Base: 16px\nScale: 1.250 (Major Third)",
			date: "2025-12-01",
		},
		{
			id: 2,
			title: "Design System V2 Notes",
			type: "journal",
			content: "Moving to OKLCH for better gradients...",
			date: "2025-12-05",
		},
	];

	const handleNewEntry = () => {
		const newEntry = {
			id: Date.now(),
			title: "New Note",
			type: activeTab,
			content: "Start typing...",
			date: new Date().toISOString().split("T")[0],
		};
		const updatedEntries = [newEntry, ...entries];
		updateData("kb-entries", updatedEntries);
	};

	return (
		<div className="h-full flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div className="flex bg-bg-surface p-1 rounded-lg border border-glass-stroke shadow-inner">
					<TabButton
						active={activeTab === "journal"}
						onClick={() => setActiveTab("journal")}
						icon={Book}
						label="Journal"
					/>
					<TabButton
						active={activeTab === "cheatsheet"}
						onClick={() => setActiveTab("cheatsheet")}
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

			<div className="relative group">
				<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
					<Search
						size={16}
						className="text-gray-600 group-focus-within:text-accent-cyan transition-colors"
					/>
				</div>
				<input
					type="text"
					placeholder="Search knowledge base..."
					className="w-full bg-bg-void border border-glass-stroke rounded-xl py-4 pl-12 pr-4 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-accent-cyan/50 focus:shadow-[0_0_30px_rgba(63,227,242,0.1)] transition-all font-mono text-sm"
				/>
			</div>

			<div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-20">
				{entries
					.filter((e: any) => e.type === activeTab)
					.map((entry: any, i: number) => (
						<MonolithCard key={entry.id} index={i} entry={entry} />
					))}
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

const MonolithCard = ({ entry, index }: any) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ delay: index * 0.1 }}
		className="group relative bg-bg-surface rounded-xl border border-glass-stroke shadow-monolith hover:shadow-monolith-hover transition-all duration-500 overflow-hidden cursor-pointer"
	>
		<div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-glass-highlight to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
		<div className="p-5 space-y-3">
			<div className="flex justify-between items-start">
				<h3 className="font-display text-lg text-white group-hover:text-accent-cyan transition-colors">
					{entry.title}
				</h3>
				<span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest border border-glass-stroke px-2 py-0.5 rounded-full">
					{entry.date}
				</span>
			</div>
			<p className="font-mono text-xs text-gray-500 line-clamp-3 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
				{entry.content}
			</p>
		</div>
	</motion.div>
);
