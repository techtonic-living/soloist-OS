import { motion } from "framer-motion";
import { Sparkles, Terminal, Cpu, Globe, ArrowRight } from "lucide-react";

export const WelcomeView = () => {
	return (
		<div className="h-full w-full flex flex-col items-center justify-center p-12 overflow-y-auto custom-scrollbar bg-bg-void/10">
			<div className="max-w-2xl w-full space-y-12">
				{/* Hero Section */}
				<header className="space-y-4 text-center">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="inline-flex p-3 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 shadow-glow mb-4"
					>
						<Sparkles className="text-accent-cyan" size={32} />
					</motion.div>
					<motion.h1
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-4xl font-brand font-bold text-white tracking-widest leading-tight"
					>
						WELCOME TO{" "}
						<span className="text-accent-cyan">SOLOIST OS</span>
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-lg text-white/50 font-light"
					>
						The executive design engine for building modern design
						systems with speed, accuracy, and intelligence.
					</motion.p>
				</header>

				{/* Quick Actions / Getting Started */}
				<div className="grid md:grid-cols-2 gap-6">
					<QuickCard
						icon={Terminal}
						title="Unified Tokens"
						description="Define and manage your variables, styles, and tokens in a centralized registry."
						delay={0.2}
					/>
					<QuickCard
						icon={Cpu}
						title="Generative Studio"
						description="Create intricate color systems and typography scales using AI-assisted tools."
						delay={0.3}
					/>
					<QuickCard
						icon={Globe}
						title="System Documentation"
						description="Automatically generate living documentation for your design system modules."
						delay={0.4}
					/>
					<QuickCard
						icon={ArrowRight}
						title="Plugin Sync"
						description="Push updates directly to Figma without leaving your workbench."
						delay={0.5}
					/>
				</div>

				{/* Footer/System Status */}
				<motion.footer
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
					className="pt-12 border-t border-glass-stroke flex flex-col items-center gap-4"
				>
					<div className="flex items-center gap-4 text-xs font-mono tracking-widest text-white/20 uppercase">
						<span className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse shadow-glow" />
							Kernal: v1.0.4
						</span>
						<span className="h-3 w-[1px] bg-glass-stroke" />
						<span>Module: Explore</span>
					</div>
					<p className="text-[10px] text-white/10 text-center uppercase tracking-[0.3em]">
						Engineered by Soloist Labs • // Design with Intent
					</p>
				</motion.footer>
			</div>
		</div>
	);
};

const QuickCard = ({
	icon: Icon,
	title,
	description,
	delay,
}: {
	icon: any;
	title: string;
	description: string;
	delay: number;
}) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ delay }}
		className="p-6 rounded-2xl bg-bg-surface/30 border border-glass-stroke hover:bg-white/5 transition-all group cursor-pointer hover:shadow-monolith"
	>
		<div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-accent-cyan/10 transition-colors">
			<Icon
				size={20}
				className="text-white/40 group-hover:text-accent-cyan transition-colors"
			/>
		</div>
		<h3 className="text-white font-medium mb-2">{title}</h3>
		<p className="text-xs text-white/40 leading-relaxed">{description}</p>
	</motion.div>
);
