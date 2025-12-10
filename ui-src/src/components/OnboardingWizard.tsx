import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Sparkles, User, ArrowRight } from "lucide-react";
import { ColorMatrix } from "./ColorMatrix";
import { TypographyMatrix } from "./TypographyMatrix";
import { SizingMatrix } from "./SizingMatrix";
import { SemanticMapper, SemanticToken } from "./SemanticMapper";

interface OnboardingWizardProps {
	ramp: any[];
	setRamp: any;
	setSeedColor: (color: string) => void;
	baseSize: number;
	setBaseSize: (size: number) => void;
	scale: any;
	setScale: (scale: any) => void;
	baseSpacing: number;
	setBaseSpacing: (val: number) => void;
	baseRadius: number;
	setBaseRadius: (val: number) => void;
	semanticTokens: SemanticToken[];
	setSemanticTokens: (tokens: SemanticToken[]) => void;
	onComplete: () => void;
}

const STEPS = [
	{
		id: "intro",
		title: "Welcome to Soloist",
		description:
			"Let's build your design system the right way. We'll start with the basics (DNA) and move to advanced logic (Semantics).",
		icon: Sparkles,
	},
	{
		id: "dna",
		title: "Step 1: DNA (Brand Identity)",
		description:
			"Everything starts with a single color. Pick your primary brand color, and I'll generate a harmonized Primitive Ramp.",
		icon: User, // Placeholder
	},
	{
		id: "voice",
		title: "Step 2: Voice (Typography)",
		description:
			"Define your typographic hierarchy. Choose a base size and a mathematical ratio that suits your content density.",
		icon: TypeIcon,
	},
	{
		id: "rhythm",
		title: "Step 3: Rhythm (Spacing)",
		description:
			"Consistency is key. We use a strict 4pt grid system to ensure perfect alignment across all devices.",
		icon: GridIcon,
	},
	{
		id: "logic",
		title: "Step 4: Logic (Semantics)",
		description:
			"Now, let's give meaning to your tokens. Map your Primitives to Semantic Roles for automatic Light/Dark mode support.",
		icon: LayersIcon,
	},
];

// Icon wrappers for Lucide to pass as props if needed, or just use inline
function TypeIcon(props: any) {
	return <span {...props}>Tt</span>;
}
function GridIcon(props: any) {
	return <span {...props}>#</span>;
}
function LayersIcon(props: any) {
	return <span {...props}>L</span>;
}

export const OnboardingWizard = ({
	ramp,
	setRamp,
	setSeedColor,
	baseSize,
	setBaseSize,
	scale,
	setScale,
	baseSpacing,
	setBaseSpacing,
	baseRadius,
	setBaseRadius,
	semanticTokens,
	setSemanticTokens,
	onComplete,
}: OnboardingWizardProps) => {
	const [currentStep, setCurrentStep] = useState(0);

	const handleNext = () => {
		if (currentStep < STEPS.length - 1) {
			setCurrentStep((c) => c + 1);
		} else {
			onComplete();
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep((c) => c - 1);
		}
	};

	const stepData = STEPS[currentStep];

	return (
		<div className="flex flex-col h-full relative overflow-hidden bg-bg-surface/50 backdrop-blur-xl rounded-3xl border border-glass-stroke shadow-2xl">
			{/* Progress Header */}
			<div className="h-16 border-b border-glass-stroke flex items-center px-8 justify-between bg-bg-void/50">
				<div className="flex items-center gap-3">
					<span className="w-6 h-6 rounded-full bg-accent-cyan flex items-center justify-center text-bg-void font-bold text-xs">
						{currentStep + 1}
					</span>
					<h3 className="text-white font-brand text-lg">
						{stepData.title}
					</h3>
				</div>
				<div className="flex gap-1">
					{STEPS.map((_, i) => (
						<div
							key={i}
							className={`h-1.5 w-8 rounded-full transition-all ${
								i <= currentStep
									? "bg-accent-cyan"
									: "bg-glass-stroke"
							}`}
						/>
					))}
				</div>
			</div>

			{/* Content Area */}
			<div className="flex-1 overflow-hidden relative p-8">
				<AnimatePresence mode="wait">
					<motion.div
						key={currentStep}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3 }}
						className="h-full flex flex-col"
					>
						<p className="text-gray-400 mb-8 max-w-2xl text-lg leading-relaxed">
							{stepData.description}
						</p>

						<div className="flex-1 overflow-y-auto custom-scrollbar border border-glass-stroke/30 rounded-xl bg-black/10 p-6">
							{stepData.id === "intro" && (
								<div className="h-full flex flex-col items-center justify-center text-center">
									<div className="w-24 h-24 rounded-full bg-accent-cyan/10 flex items-center justify-center mb-6 animate-pulse">
										<Sparkles
											size={48}
											className="text-accent-cyan"
										/>
									</div>
									<h2 className="text-3xl font-brand text-white mb-4">
										You're the Conductor.
									</h2>
									<p className="text-gray-400 max-w-md">
										Soloist will help you orchestrate a
										perfect design system using standard
										musical principles: DNA, Voice, Rhythm,
										and Logic.
									</p>
								</div>
							)}

							{stepData.id === "dna" && (
								<ColorMatrix
									ramp={ramp}
									setRamp={setRamp}
									setSeedColor={setSeedColor}
								/>
							)}

							{stepData.id === "voice" && (
								<TypographyMatrix
									baseSize={baseSize}
									setBaseSize={setBaseSize}
									scale={scale}
									setScale={setScale}
								/>
							)}

							{stepData.id === "rhythm" && (
								<SizingMatrix
									baseSpacing={baseSpacing}
									setBaseSpacing={setBaseSpacing}
									baseRadius={baseRadius}
									setBaseRadius={setBaseRadius}
								/>
							)}

							{stepData.id === "logic" && (
								<SemanticMapper
									ramp={ramp}
									tokens={semanticTokens}
									setTokens={setSemanticTokens}
								/>
							)}
						</div>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Footer Navigation */}
			<div className="h-20 border-t border-glass-stroke flex items-center justify-between px-8 bg-bg-void/50">
				<button
					onClick={handleBack}
					disabled={currentStep === 0}
					className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
						currentStep === 0
							? "opacity-0 pointer-events-none"
							: "text-gray-400 hover:text-white hover:bg-white/5"
					}`}
				>
					<ChevronLeft size={18} />
					<span>Back</span>
				</button>

				<button
					onClick={handleNext}
					className="flex items-center gap-2 px-8 py-3 rounded-xl bg-accent-cyan text-bg-void font-bold hover:brightness-110 hover:scale-105 transition-all shadow-[0_0_20px_rgba(50,215,75,0.3)]"
				>
					<span>
						{currentStep === STEPS.length - 1
							? "Finish & Sync"
							: "Next Step"}
					</span>
					{currentStep === STEPS.length - 1 ? (
						<Check size={18} />
					) : (
						<ArrowRight size={18} />
					)}
				</button>
			</div>
		</div>
	);
};
