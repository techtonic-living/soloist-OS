import { motion, AnimatePresence } from "framer-motion";
import {
	Lightbulb,
	BookOpen,
	ArrowRight,
	Pin,
	PinOff,
	Ghost,
	Cpu,
	Zap,
} from "lucide-react";
import { ColorControlPanel } from "./lab/ColorControlPanel";
import { AILevel } from "../hooks/useSoloistSystem";

interface AssistantPanelProps {
	aiLevel: AILevel;
	pinned: boolean; // Managed by parent for layout resizing
	setPinned: (pinned: boolean) => void;
	activeView: string;
	// ... Context props from TeacherPanel
	activeColorStep?: string;
	activeColorTab?: string;
	activeTypeTab?: string;
	activeTokensModule?: string;
	activeExploreTab?: string;
	selectedInsightColor?: any;

	// Color Creator Props
	seedColor?: string;
	setSeedColor?: (color: string) => void;
	secondaryColor?: string;
	tertiaryColor?: string;
	harmonyMode?: string;
	settings?: any;
	updateSettings?: (settings: any) => void;
}

export const AssistantPanel = ({
	aiLevel,
	pinned,
	setPinned,
	activeView,
	activeColorStep,
	activeColorTab,
	activeTypeTab,
	activeTokensModule,
	activeExploreTab,
	selectedInsightColor,

	seedColor,
	setSeedColor,
	secondaryColor,
	tertiaryColor,
	harmonyMode,
	settings,
	updateSettings,
}: AssistantPanelProps) => {
	// Re-use the content logic (could be refactored into a hook later)
	const content = getContentForView(
		activeView,
		activeColorStep,
		activeColorTab,
		activeTypeTab,
		activeTokensModule,
		activeExploreTab,
		selectedInsightColor
	);

	// Check if we should show the Color Control Panel
	const showColorControls =
		activeView === "explore" && activeExploreTab === "create";

	// Sidebar width
	const width = 320;

	return (
		<motion.div
			initial={false}
			animate={{
				width: pinned ? width : 60, // Collapsed width
				opacity: 1,
			}}
			className={`h-full border-l border-glass-stroke bg-bg-void/50 backdrop-blur-md flex flex-col overflow-hidden transition-all duration-300 relative group z-40 ${
				!pinned
					? "absolute right-0 top-0 bottom-0 hover:w-[320px] shadow-2xl"
					: ""
			}`}
		>
			{/* Header / Handle */}
			<div className="flex-shrink-0 p-4 border-b border-glass-stroke flex items-center justify-between bg-accent-cyan/5 h-16">
				<div
					className={`flex items-center gap-3 transition-opacity ${
						!pinned
							? "opacity-0 group-hover:opacity-100"
							: "opacity-100"
					}`}
				>
					<div
						className={`p-2 rounded-lg ${
							aiLevel === "silent"
								? "text-gray-500 bg-white/5"
								: "text-accent-cyan bg-accent-cyan/10"
						}`}
					>
						{aiLevel === "teacher" && <Zap size={18} />}
						{aiLevel === "guide" && <Cpu size={18} />}
						{aiLevel === "silent" && <Ghost size={18} />}
					</div>
					<div className="whitespace-nowrap overflow-hidden">
						<h3 className="text-white font-brand text-sm tracking-wide">
							{aiLevel === "teacher"
								? "Teacher Mode"
								: aiLevel === "guide"
								? "Co-Pilot"
								: "Standby"}
						</h3>
					</div>
				</div>

				{/* Collapsed Indicator */}
				{!pinned && (
					<div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
						<div className="rotate-90 text-gray-500 text-xs font-mono uppercase tracking-widest whitespace-nowrap mb-4">
							Assistant
						</div>
						<div
							className={`p-2 rounded-full ${
								aiLevel === "silent"
									? "bg-white/5"
									: "bg-accent-cyan/10 text-accent-cyan"
							}`}
						>
							{aiLevel === "teacher" && <Zap size={16} />}
							{aiLevel === "guide" && <Cpu size={16} />}
							{aiLevel === "silent" && <Ghost size={16} />}
						</div>
					</div>
				)}

				{/* Pin Toggle */}
				<button
					onClick={() => setPinned(!pinned)}
					className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
					title={pinned ? "Unpin Sidebar" : "Pin Sidebar"}
				>
					{pinned ? <PinOff size={16} /> : <Pin size={16} />}
				</button>
			</div>

			{/* Content Area */}
			<div
				className={`flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar transition-opacity duration-200 ${
					!pinned
						? "opacity-0 group-hover:opacity-100"
						: "opacity-100"
				}`}
			>
				{/* SILENT MODE / CONTEXT INSPECTOR */}
				{aiLevel === "silent" && (
					<div className="flex flex-col h-full">
						{/* If we have selected color, show minimal inspector even in silent */}
						{content.lessonId === "00.1a" ? (
							<div className="space-y-6">
								<div>
									<h3 className="text-white font-brand text-lg mb-1">
										{content.title}
									</h3>
									<p className="text-sm text-gray-500">
										{content.description}
									</p>
								</div>
								<div className="space-y-4">
									<div className="bg-white/5 rounded-lg p-3 border border-white/10">
										<span className="text-xs text-gray-500 uppercase font-mono block mb-1">
											Details
										</span>
										<div className="space-y-2">
											{content.concepts.map(
												(c: string, i: number) => (
													<p
														key={i}
														className="text-sm text-gray-300 font-mono"
													>
														{c}
													</p>
												)
											)}
										</div>
									</div>
								</div>
							</div>
						) : activeView === "explore" &&
						  activeExploreTab !== "create" ? (
							// Explore View Context (When not in Create/Color Control mode)
							<div className="flex flex-col h-full">
								<div className="mb-6">
									<h2 className="text-xl text-white font-brand mb-2">
										Explore
									</h2>
									<p className="text-sm text-gray-400 leading-relaxed">
										Discover and gather your creative
										resources. Use the tabs above to switch
										between Colors, Palettes, and
										Generators.
									</p>
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center h-full text-center opacity-50">
								<Ghost
									size={48}
									className="mb-4 text-gray-700"
								/>
								<h3 className="text-gray-500 font-brand">
									System Standby
								</h3>
								<p className="text-xs text-gray-600 mt-2 max-w-[200px]">
									Select an element or increase AI Level for
									assistance.
								</p>
							</div>
						)}
					</div>
				)}

				{/* ACTIVE MODES */}
				{/* Override for Color Creator: Show Controls if available */}
				{showColorControls && seedColor && setSeedColor ? (
					<div className="h-full flex flex-col">
						<div className="mb-6">
							<h2 className="text-xl text-white font-brand mb-2">
								Color Studio
							</h2>
							<p className="text-sm text-gray-400 leading-relaxed">
								Craft precise color harmonies and adjustments.
							</p>
						</div>
						<ColorControlPanel
							seedColor={seedColor}
							setSeedColor={setSeedColor}
							secondaryColor={secondaryColor || "#000000"}
							tertiaryColor={tertiaryColor || "#000000"}
							harmonyMode={harmonyMode}
							settings={settings}
							updateSettings={updateSettings}
						/>
						{/* If Teacher Mode, show some hints below? */}
						{aiLevel === "teacher" && (
							<div className="mt-8 pt-6 border-t border-white/5 space-y-4">
								<h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
									<Lightbulb size={12} /> Theory
								</h4>
								<p className="text-xs text-gray-400 leading-relaxed">
									Adjust Hue to find a base. Saturation
									controls vibrancy. Lightness helps with
									contrast.
								</p>
							</div>
						)}
					</div>
				) : (
					aiLevel !== "silent" && (
						<AnimatePresence mode="wait">
							<motion.div
								key={`${activeView}-${content.lessonId}`}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
							>
								{/* Lesson Header */}
								<div className="mb-6">
									<span className="text-accent-cyan text-xs font-mono mb-2 block">
										TOPIC #{content.lessonId}
									</span>
									<h2 className="text-2xl text-white font-brand mb-3 leading-tight">
										{content.title}
									</h2>
									<p className="text-gray-400 text-sm leading-relaxed">
										{content.description}
									</p>
								</div>

								{/* Key Concepts (Hidden in Guide Mode for brevity?) - Let's keep simpler in Guide */}
								{aiLevel === "teacher" && (
									<div className="space-y-4 mb-8">
										<h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
											<BookOpen
												size={14}
												className="text-accent-cyan"
											/>
											Key Concepts
										</h4>
										<div className="bg-bg-raised/50 rounded-xl p-4 border border-glass-stroke space-y-3">
											{content.concepts.map(
												(
													concept: string,
													i: number
												) => (
													<div
														key={i}
														className="flex gap-3 items-start"
													>
														<span className="text-accent-cyan font-bold text-sm">
															{i + 1}.
														</span>
														<p className="text-sm text-gray-300">
															{concept}
														</p>
													</div>
												)
											)}
										</div>
									</div>
								)}

								{/* Suggestions */}
								<div className="space-y-4">
									<h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
										<Lightbulb
											size={14}
											className="text-yellow-400"
										/>
										{aiLevel === "teacher"
											? "Try This"
											: "Quick Tips"}
									</h4>
									{content.suggestions
										.slice(0, aiLevel === "guide" ? 1 : 3)
										.map((suggestion: any, i: number) => (
											<div
												key={i}
												className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-accent-cyan/30 transition-colors group cursor-default"
											>
												<div className="flex justify-between items-start mb-2">
													<h5 className="text-sm text-white font-medium group-hover:text-accent-cyan transition-colors">
														{suggestion.title}
													</h5>
													{aiLevel === "teacher" && (
														<ArrowRight
															size={14}
															className="text-gray-600 group-hover:text-accent-cyan transition-colors"
														/>
													)}
												</div>
												<p className="text-xs text-gray-400 leading-relaxed">
													{suggestion.text}
												</p>
											</div>
										))}
								</div>
							</motion.div>
						</AnimatePresence>
					)
				)}
			</div>
		</motion.div>
	);
};

// --- Educational Content Mapping (Copied from TeacherPanel for now - could be extracted) ---
// Ideally this moves to a data file, but for speed keeping here.
// I will just paste the function 'getContentForView' here or import it if I extracted it.
// Since I can't easily extract in one step, I'll duplicate the logic for this task to ensure it Works.

const getContentForView = (
	view: string,
	colorStep?: string,
	colorTab?: string,
	typeTab?: string,
	tokensModule?: string,
	exploreTab?: string,
	selectedColor?: any
) => {
	// Handle Explore View
	if (view === "explore") {
		// Specific Color Insight Override
		if (
			exploreTab === "colors" &&
			selectedColor &&
			selectedColor.description
		) {
			return {
				lessonId: "00.1a",
				title: selectedColor.name,
				description: selectedColor.description,
				concepts: [
					`Hex: ${selectedColor.value}`,
					`Meaning: ${selectedColor.meaning || "Unknown"}`,
					`Usage: ${selectedColor.usage || "General UI"}`,
				],
				suggestions: [
					{
						title: "Try it out",
						text: `Click 'Use Base' to set ${selectedColor.name} as your primary seed color.`,
					},
				],
			};
		}

		if (exploreTab === "colors") {
			return {
				lessonId: "00.1",
				title: "Color Library",
				description:
					"This is your collection of saved colors. Think of it as your palette box.",
				concepts: [
					"Star colors to save them here.",
					"Click a color to set it as your active seed.",
					"Building a library helps maintain consistency across projects.",
				],
				suggestions: [
					{
						title: "Clean Up",
						text: "Remove colors you no longer need to keep your library focused.",
					},
				],
			};
		}
		if (exploreTab === "palettes") {
			return {
				lessonId: "00.2",
				title: "Saved Palettes",
				description:
					"Groups of colors that work well together. Keep your best combinations here.",
				concepts: [
					"Save entire generated palettes for later use.",
					"Name your palettes descriptively (e.g., 'Dark Mode Details', 'Brand Primary').",
				],
				suggestions: [
					{
						title: "Create a Palette",
						text: "Use the Generator to create a new palette and save it.",
					},
				],
			};
		}
		if (exploreTab === "wheel") {
			return {
				lessonId: "00.3",
				title: "Harmony Wheel",
				description:
					"Understand the relationships between colors using classic color theory.",
				concepts: [
					"Complementary: Opposite colors, high contrast.",
					"Analogous: Adjacent colors, harmonious and calm.",
					"Triadic: Three colors equally spaced, vibrant and balanced.",
				],
				suggestions: [
					{
						title: "Try Analogous",
						text: "Switch to Analogous mode for a natural, pleasing color scheme.",
					},
				],
			};
		}
		if (exploreTab === "picker") {
			return {
				lessonId: "00.4",
				title: "Color Picker",
				description:
					"Precisely select colors from your screen or fine-tune hex values.",
				concepts: [
					"Input specific Hex codes if you have brand guidelines.",
					"Use the eyedropper (if available) to pick from images.",
				],
				suggestions: [
					{
						title: "Manual Entry",
						text: "Try entering a known brand color hex code.",
					},
				],
			};
		}
		if (exploreTab === "generator") {
			return {
				lessonId: "00.5",
				title: "Palette Generator",
				description: "Let algorithms find the perfect colors for you.",
				concepts: [
					"Lock colors you like to keep them while regenerating others.",
					"Iterate quickly to find unexpected combinations.",
				],
				suggestions: [
					{
						title: "Lock and Roll",
						text: "Lock a nice accent color and generate options around it.",
					},
				],
			};
		}
		if (exploreTab === "create") {
			return {
				lessonId: "00.6",
				title: "Color Studio",
				description: "Create custom colors with precision controls.",
				concepts: [
					"Use Hue, Saturation, and Lightness for intuitive mixing.",
					"See real-time harmony suggestions on the wheel.",
				],
				suggestions: [
					{
						title: "Harmony Handles",
						text: "Drag the main handle and watch the smaller harmony handles follow automatically.",
					},
				],
			};
		}
	}

	// Handle Atelier Mode specifically
	if (view === "atelier") {
		if (colorTab === "generator") {
			return {
				lessonId: "01.1",
				title: "Inspiration Generator",
				description:
					"Stuck? Iterate rapidly through mathematically generated palettes until you find a mood that resonates.",
				concepts: [
					"Lock colors you like with Spacebar.",
					"Use generated colors as seeds for your main system.",
					"Don't settle for the first good option.",
				],
				suggestions: [
					{
						title: "The Anchor",
						text: "Lock your primary brand color and hit generate to see matching secondary options.",
					},
				],
			};
		}
		if (colorTab === "contrast") {
			return {
				lessonId: "01.2",
				title: "Contrast Lab",
				description:
					"Ensure your color choices are accessible and readable for everyone.",
				concepts: [
					"AA (4.5:1) is the minimum for standard text.",
					"Large text allows for lower contrast (3:1).",
					"Never guess—always measure.",
				],
				suggestions: [
					{
						title: "Test Your Primary",
						text: "Check if white text on your 500-level brand color passes AA standards.",
					},
				],
			};
		}
		if (colorTab === "mixer") {
			return {
				lessonId: "01.3",
				title: "Color Mixer",
				description:
					"Blend two colors to create perfect intermediate steps or custom gradients.",
				concepts: [
					"Mixing with white = Tint.",
					"Mixing with black = Shade.",
					"Interpolation creates smooth transitions.",
				],
				suggestions: [
					{
						title: "Soft Backgrounds",
						text: "Mix your primary with 90% white to create a subtle background tint.",
					},
				],
			};
		}

		// Default Atelier
		return {
			lessonId: "01.0",
			title: "The Atelier",
			description:
				"Before we get into the math, let's start with art. The Atelier is where you define the core DNA of your brand palette.",
			concepts: [
				"Pick your Main Brand Color first (Center Orb).",
				"Secondary/Tertiary orbs orbit the primary, representing harmony.",
				"Use 'Harmony Modes' (Complementary, Analogous) to find mathematically pleasing pairs.",
			],
			suggestions: [
				{
					title: "Spin the Wheel",
					text: "Try switching between 'Complementary' and 'Triadic' to see how your palette mood changes instantly.",
				},
				{
					title: "Break the Rules",
					text: "Click a Secondary orb to unlock it and pick a custom color manually if the math isn't fitting your vibe.",
				},
			],
		};
	}

	if (view === "typography") {
		if (typeTab === "pairing") {
			return {
				lessonId: "02.1",
				title: "Pairing Sandbox",
				description:
					"Test your heading and body fonts together in a real context.",
				concepts: [
					"Contrast is key (e.g. Serif Header + Sans Body).",
					"Check readability at small sizes.",
					"Ensure x-heights are compatible.",
				],
				suggestions: [
					{
						title: "Classic Combo",
						text: "Try Playfair Display (Serif) for headers and Inter (Sans) for body.",
					},
				],
			};
		}
		// Default Scale
		return {
			lessonId: "02.0",
			title: "Type Scale",
			description:
				"A mathematical scale ensures rhythm and consistency across your typography.",
			concepts: [
				"Major Third (1.25) is versatile for web.",
				"Golden Ratio (1.618) creates dramatic contrast.",
				"Base size sets the foundation for everything.",
			],
			suggestions: [
				{
					title: "Find Your Rhythm",
					text: "Switch between Major Third and Perfect Fourth to see how the hierarchy steepens.",
				},
			],
		};
	}

	// Handle Tokens View Modules
	if (view === "tokens") {
		if (tokensModule === "spacing") {
			return {
				lessonId: "03.0",
				title: "Spatial Rhythm",
				description:
					"Space is the invisible glue of your interface. We use a 4pt grid system to ensure consistent alignment.",
				concepts: [
					"All spacing values are multiples of your Base Spacing (e.g. 4px).",
					"Use 'Space-MD' (16px) for standard padding.",
					"Use 'Space-XS' (4px) for tight groupings.",
				],
				suggestions: [
					{
						title: "Check Alignment",
						text: "Ensure your card padding (Space-LG) matches your grid gutters.",
					},
				],
			};
		}
		if (tokensModule === "typography") {
			return {
				lessonId: "02.5",
				title: "Type Styles",
				description:
					"These are your final text styles, ready for consumption by developers.",
				concepts: [
					"Styles combine Family, Size, Weight, and Line Height.",
					"Don't detach styles in your design tool.",
					"Use 'Body Base' for 80% of your UI.",
				],
				suggestions: [
					{
						title: "Review Hierarchy",
						text: "Check if 'Heading S' and 'Body Base' have enough visual distinction.",
					},
				],
			};
		}

		if (colorStep) {
			switch (colorStep) {
				case "primary":
					return {
						lessonId: "01.1",
						title: "Primary DNA",
						description:
							"Your brand's core color is the seed for the entire system. We generate a full 11-step range (50-950) from this single value.",
						concepts: [
							"The '500' step is your base brand color.",
							"Lighter shades (50-200) are for backgrounds/tints.",
							"Darker shades (700-950) are for text and icons.",
						],
						suggestions: [
							{
								title: "Lock Your Brand",
								text: "Lock the 500 step if you want to keep it exact, or let Soloist shift it slightly for better harmony.",
							},
						],
					};
				case "secondary":
					return {
						lessonId: "01.2",
						title: "Secondary Support",
						description:
							"Secondary colors support your brand but don't compete with it. By default, we use a Complementary harmony.",
						concepts: [
							"Use Secondary for primary actions ONLY if your Brand Color is too dark/light on its own.",
							"Great for distinct sections of your product (e.g., a 'Customer Support' area).",
							"Keep its usage to < 20% of your UI.",
						],
						suggestions: [
							{
								title: "Harmony Check",
								text: "This ramp was automatically generated as a Complement to your Primary. Try changing the Primary and watch this shift.",
							},
						],
					};
				case "tertiary":
					return {
						lessonId: "01.3",
						title: "Tertiary Accents",
						description:
							"Tertiary colors are your 'spice'. Use them for highlights, badges, or specific data visualization categories.",
						concepts: [
							"Use sparingly. Think of it as a highlighter.",
							"We generated this using an Analogous/Split-Comp harmony to support the main pair.",
							"Avoid using for text unless it passes AA contrast.",
						],
						suggestions: [
							{
								title: "Spot Check",
								text: "Does this color vibrate against your Primary? If so, try adjusting its saturation.",
							},
						],
					};
				case "neutrals":
					return {
						lessonId: "01.4",
						title: "Calculated Neutrals",
						description:
							"Pure grey feels dead in UI. We tint your neutrals slightly with your primary hue to make them feel warm and cohesive.",
						concepts: [
							"Never use #000000. It creates too much contrast causing eye strain.",
							"Tinted greys reduce the 'vibration' against your primary color.",
							"Neutral/50-100 are your surface colors (cards, sidebars).",
						],
						suggestions: [
							{
								title: "Check Surface Contrast",
								text: "Ensure Neutral/50 and Neutral/100 have enough differentiation for card borders.",
							},
						],
					};
				case "signals":
					return {
						lessonId: "01.3",
						title: "Semantic Signals",
						description:
							"Standard colors for communicating state: Success (Green), Warning (Orange), Error (Red), and Info (Blue).",
						concepts: [
							"Don't rely on color alone. Always pair signals with icons or text labels.",
							"These defaults pass WCAG AA on white backgrounds.",
							"Keep these distinct from your primary brand color.",
						],
						suggestions: [
							{
								title: "Simulate Color Blindness",
								text: "Use the Playground to check if your Error red is distinguishable from your Success green.",
							},
						],
					};
				case "alphas":
					return {
						lessonId: "01.4",
						title: "Alpha Overlays",
						description:
							"Opacity tokens allow you to place elements on any background without hardcoding new hex values.",
						concepts: [
							"Alpha/60 is standard for modal backdrops (scrims).",
							"Alpha/5 can be used for subtle hover states.",
							"Alphas blend with whatever is behind them, creating depth.",
						],
						suggestions: [
							{
								title: "Test Overlay",
								text: "Imagine placing white text over an image with an Alpha/40 black overlay.",
							},
						],
					};
			}
		}
	}

	switch (view) {
		case "tokens": // Fallback if no step
			return {
				lessonId: "01",
				title: "Visual DNA",
				description:
					"Your design system starts here. Primitives are the raw materials (colors), atomic units that will build everything else.",
				concepts: [
					"Don't use primitives directly in designs. Alias them first.",
					"A 50-950 scale covers all UI needs from backgrounds to text.",
					"Naming conventions matters more than the actual hex codes.",
				],
				suggestions: [
					{
						title: "Check Contrast",
						text: "Try toggling the 'AI Audit' to see if your 500-level brand color is accessible on white.",
					},
					{
						title: "Lock Your Brand",
						text: "Lock the 500 level if you want to keep it exact.",
					},
				],
			};
		case "knowledge":
			return {
				lessonId: "03",
				title: "Documentation",
				description:
					"A design system without documentation is just a UI Kit. Writing things down bridges the gap between design and engineering.",
				concepts: [
					"Document the 'Why', not just the 'What'.",
					"Include do's and don'ts for every component.",
					"Keep it close to the code/design for easy updates.",
				],
				suggestions: [
					{
						title: "Write a Card Entry",
						text: "Create a new journal entry describing how to use the 'Card' component in your system.",
					},
				],
			};
		case "export":
			return {
				lessonId: "04",
				title: "Handoff & Sync",
				description:
					"The final step is getting your decisions out of this tool and into the real world (Figma or Code).",
				concepts: [
					"Tokens are the source of truth.",
					"Figma Variables allow for powerful mode switching.",
					"CSS Variables are the web equivalent of your tokens.",
				],
				suggestions: [
					{
						title: "Review JSON Output",
						text: "Toggle to 'JSON' mode to see the raw data structure that developers will consume.",
					},
				],
			};
		default:
			return {
				lessonId: "00",
				title: "Welcome",
				description:
					"Select a tool from the sidebar to begin your lesson.",
				concepts: [],
				suggestions: [],
			};
	}
};
