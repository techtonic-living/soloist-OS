import { Card } from "../primitives/Card";
import { IconButton } from "../primitives/IconButton";
import { Button } from "../primitives/Button";
import { PanelLeft, PanelRight, Search, Home, Sparkles } from "lucide-react";

export function V2Shell() {
	return (
		<div className="soloist-app-grid h-screen w-screen bg-bg-void overflow-hidden text-sm">
			<V2Header />
			<V2LeftRail />
			<V2Main />
			<V2RightPanel />
			<V2Footer />
		</div>
	);
}

function V2Header() {
	return (
		<header className="flex items-center justify-between px-4 border-b border-glass-stroke bg-bg-void/40 backdrop-blur-sm">
			<div className="flex items-center gap-2">
				<IconButton title="Home" ariaLabel="Home" icon={Home} />
				<div className="text-xs font-mono tracking-wider text-white/70">
					SOLOIST OS / V2 FOUNDATION
				</div>
			</div>

			<div className="flex items-center gap-2">
				<div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-glass-stroke bg-white/5">
					<Search size={14} className="text-white/40" />
					<input
						className="bg-transparent outline-none text-xs font-mono text-white/70 placeholder:text-white/30 w-[220px]"
						placeholder="Search (v2 stub)"
						title="Search"
						aria-label="Search"
					/>
				</div>
				<Button variant="ghost" title="Roadmap" ariaLabel="Roadmap">
					Roadmap
				</Button>
			</div>
		</header>
	);
}

function V2LeftRail() {
	return (
		<nav className="border-r border-glass-stroke bg-bg-void/30 backdrop-blur-sm p-3">
			<div className="flex flex-col gap-2">
				<Card className="p-3">
					<div className="text-xs font-mono tracking-wider text-white/70">
						TOOLS
					</div>
					<div className="mt-3 flex flex-col gap-2">
						<Button
							variant="glass"
							title="Tokens"
							ariaLabel="Tokens"
						>
							Tokens
						</Button>
						<Button
							variant="glass"
							title="Knowledge"
							ariaLabel="Knowledge"
						>
							Knowledge
						</Button>
						<Button
							variant="glass"
							title="Export"
							ariaLabel="Export"
						>
							Export
						</Button>
					</div>
				</Card>
				<div className="flex items-center justify-between px-1">
					<IconButton
						title="Toggle Rail (Stub)"
						ariaLabel="Toggle Rail"
						icon={PanelLeft}
					/>
					<IconButton
						title="Toggle Panel (Stub)"
						ariaLabel="Toggle Panel"
						icon={PanelRight}
					/>
				</div>
			</div>
		</nav>
	);
}

function V2Main() {
	return (
		<main className="p-6 overflow-y-auto custom-scrollbar">
			<Card className="p-6">
				<div className="flex items-center justify-between">
					<div>
						<div className="text-lg font-brand text-white">
							Foundation Mode
						</div>
						<div className="mt-1 text-xs text-white/60 max-w-[70ch]">
							This is an isolated v2 shell for rebuilding the
							framework without touching the legacy UI. Use it to
							develop primitives and layout patterns safely, then
							restore features behind adapters.
						</div>
					</div>
					<div className="flex items-center gap-2">
						<IconButton
							title="Spark (Stub)"
							ariaLabel="Spark"
							icon={Sparkles}
						/>
						<Button
							variant="glass"
							title="Create Primitive"
							ariaLabel="Create Primitive"
						>
							Create Primitive
						</Button>
					</div>
				</div>

				<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
					<Card className="p-4">
						<div className="text-xs font-mono tracking-wider text-white/70">
							NEXT
						</div>
						<ul className="mt-3 space-y-2 text-xs text-white/70">
							<li>
								• Build primitives
								(Button/Input/Slider/Card/Tabs)
							</li>
							<li>
								• Build shell interactions (rail/panel collapse)
							</li>
							<li>• Mount first restored module (read-only)</li>
						</ul>
					</Card>
					<Card className="p-4">
						<div className="text-xs font-mono tracking-wider text-white/70">
							GUARDRAILS
						</div>
						<ul className="mt-3 space-y-2 text-xs text-white/70">
							<li>• No inline layout styles</li>
							<li>• No hardcoded hex values</li>
							<li>• No cursor-not-allowed</li>
							<li>• Icon buttons have title + aria-label</li>
						</ul>
					</Card>
				</div>
			</Card>
		</main>
	);
}

function V2RightPanel() {
	return (
		<aside className="border-l border-glass-stroke bg-bg-void/30 backdrop-blur-sm p-4 overflow-y-auto custom-scrollbar">
			<Card className="p-4">
				<div className="text-xs font-mono tracking-wider text-white/70">
					ASSISTANT / INSPECTOR
				</div>
				<div className="mt-3 text-xs text-white/60">
					Stub panel for the v2 foundation. We’ll mount the Assistant
					here later behind an adapter boundary.
				</div>
			</Card>
		</aside>
	);
}

function V2Footer() {
	return (
		<footer className="border-t border-glass-stroke bg-bg-void/40 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
			<div className="text-xs font-mono text-white/60">
				Status: v2 shell running
			</div>
			<div className="text-xs font-mono text-white/40">
				Tip: append <span className="text-accent-cyan">?v2</span> to the
				URL
			</div>
		</footer>
	);
}
