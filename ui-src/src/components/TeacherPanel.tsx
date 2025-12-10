import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, BookOpen, ArrowRight, GraduationCap } from "lucide-react";

export const TeacherPanel = ({
	activeView,
	activeColorStep,
	activeColorTab,
	activeTypeTab,
	activeTokensModule,
}: {
	activeView: string;
	activeColorStep?: string;
	activeColorTab?: string;
	activeTypeTab?: string;
	activeTokensModule?: string;
}) => {
	const content = getContentForView(
		activeView,
		activeColorStep,
		activeColorTab,
		activeTypeTab,
		activeTokensModule
	);

	return (
		<motion.div
			initial={{ width: 0, opacity: 0 }}
			animate={{ width: 320, opacity: 1 }}
			exit={{ width: 0, opacity: 0 }}
			className="h-full border-l border-glass-stroke bg-bg-void/50 backdrop-blur-md flex flex-col overflow-hidden"
		>
			<div className="w-[320px] h-full flex flex-col">
				<div className="p-6 border-b border-glass-stroke flex items-center gap-3 bg-accent-cyan/5">
					<div className="p-2 bg-accent-cyan/20 rounded-lg text-accent-cyan">
						<GraduationCap size={20} />
					</div>
					<div>
						<h3 className="text-white font-brand text-sm tracking-wide">
							Teacher Mode
						</h3>
						<p className="text-gray-400 text-[10px] uppercase tracking-wider">
							Interactive Guide
						</p>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
					<AnimatePresence mode="wait">
						<motion.div
							key={`${activeView}-${activeColorStep}`}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
						>
							{/* Lesson Header */}
							<div className="mb-6">
								<span className="text-accent-cyan text-xs font-mono mb-2 block">
									LESSON #{content.lessonId}
								</span>
								<h2 className="text-2xl text-white font-brand mb-3 leading-tight">
									{content.title}
								</h2>
								<p className="text-gray-400 text-sm leading-relaxed">
									{content.description}
								</p>
							</div>

							{/* Key Concepts */}
							<div className="space-y-4 mb-8">
								<h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
									<BookOpen
										size={14}
										className="text-accent-cyan"
									/>
									Key Concepts
								</h4>
								<div className="bg-bg-raised/50 rounded-xl p-4 border border-glass-stroke space-y-3">
									{content.concepts.map((concept, i) => (
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
									))}
								</div>
							</div>

							{/* Suggestions / Try This */}
							<div className="space-y-4">
								<h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
									<Lightbulb
										size={14}
										className="text-yellow-400"
									/>
									Try This
								</h4>
								{content.suggestions.map((suggestion, i) => (
									<div
										key={i}
										className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-accent-cyan/30 transition-colors group cursor-default"
									>
										<div className="flex justify-between items-start mb-2">
											<h5 className="text-sm text-white font-medium group-hover:text-accent-cyan transition-colors">
												{suggestion.title}
											</h5>
											<ArrowRight
												size={14}
												className="text-gray-600 group-hover:text-accent-cyan transition-colors"
											/>
										</div>
										<p className="text-xs text-gray-400 leading-relaxed">
											{suggestion.text}
										</p>
									</div>
								))}
							</div>
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</motion.div>
	);
};

// --- Educational Content Mapping ---

const getContentForView = (
	view: string,
	colorStep?: string,
	colorTab?: string,
	typeTab?: string,
	tokensModule?: string
) => {
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
						text: "Lock your primary brand color (500) so it doesn't shift when you regenerate the ramp.",
					},
				],
			};
			// Fallback for default
			return {
				lessonId: "00",
				title: "The Lab",
				description: "Welcome to your creative sandbox.",
				concepts: [],
				suggestions: [],
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
