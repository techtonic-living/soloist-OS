import { useState } from "react";
import {
	Copy,
	Check,
	Terminal as TerminalIcon,
	FileJson,
	FileCode,
} from "lucide-react";

const generateCode = (format: "css" | "json" | "swift") => {
	if (format === "css") {
		return `:root {
  /* Soloist OS - Void Theme */
  --color-void-900: #0B0D12;
  --color-void-800: #1A1D24;
  --color-primary-500: #3D8BFF;
  --shadow-monolith: 0 20px 40px -10px rgba(0,0,0,0.8);
}`;
	}
	if (format === "json") {
		return `{
  "void": {
    "900": { "value": "#0B0D12", "type": "color" },
    "800": { "value": "#1A1D24", "type": "color" }
  },
  "primary": { "500": { "value": "#3D8BFF", "type": "color" } }
}`;
	}
	return `// Swift
extension Color {
    static let void900 = Color(hex: "0B0D12")
    static let primary500 = Color(hex: "3D8BFF")
}`;
};

export const ExportTerminal = () => {
	const [format, setFormat] = useState<"css" | "json" | "swift">("css");
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(generateCode(format));
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="h-full flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div className="flex bg-bg-surface p-1 rounded-lg border border-glass-stroke shadow-inner">
					<FormatTab
						active={format === "css"}
						onClick={() => setFormat("css")}
						label="CSS"
						icon={FileCode}
					/>
					<FormatTab
						active={format === "json"}
						onClick={() => setFormat("json")}
						label="JSON"
						icon={FileJson}
					/>
					<FormatTab
						active={format === "swift"}
						onClick={() => setFormat("swift")}
						label="Swift"
						icon={FileCode}
					/>
				</div>
				<button
					onClick={handleCopy}
					className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-all text-xs uppercase tracking-wider font-semibold"
				>
					{copied ? <Check size={14} /> : <Copy size={14} />}
					<span>{copied ? "COPIED" : "COPY CODE"}</span>
				</button>
			</div>
			<div className="flex-1 rounded-xl bg-[#0d0f14] border border-glass-stroke overflow-hidden flex flex-col shadow-monolith relative group">
				<div className="bg-[#151820] px-4 py-3 flex items-center gap-2 border-b border-white/5">
					<div className="flex gap-2">
						<div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
						<div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
						<div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
					</div>
					<div className="ml-4 flex items-center gap-2 text-xs text-gray-500 font-mono">
						<TerminalIcon size={12} />
						<span>soloist-export.{format}</span>
					</div>
				</div>
				<div className="p-6 font-mono text-sm overflow-auto custom-scrollbar flex-1 relative">
					<pre className="text-gray-300">{generateCode(format)}</pre>
				</div>
			</div>
		</div>
	);
};

const FormatTab = ({ active, onClick, icon: Icon, label }: any) => (
	<button
		onClick={onClick}
		className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm font-mono ${
			active
				? "bg-bg-raised text-white shadow-md border border-white/5"
				: "text-gray-500 hover:text-gray-300"
		}`}
	>
		<Icon size={14} />
		<span>{label}</span>
	</button>
);
