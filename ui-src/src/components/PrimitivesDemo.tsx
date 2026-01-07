import { Icon } from "../v2/primitives/Icon";
import { Button } from "../v2/primitives/Button";

/**
 * PrimitivesDemo — Test harness for Icon + Button primitives
 *
 * Verifies:
 * - Icon rendering (13 glyphs × 3 sizes × 3 tones)
 * - Button rendering (2 variants × 3 sizes × icons)
 * - Icon+Button integration (iconLeft/iconRight props)
 */

export function PrimitivesDemo() {
	return (
		<div className="p-8 space-y-12 bg-black text-white min-h-screen">
			{/* Icon Demo */}
			<section className="space-y-6">
				<h2 className="text-2xl font-bold">Icon Primitive</h2>

				{/* Size variations */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Sizes (sm/md/lg)</h3>
					<div className="flex gap-6 items-center">
						<Icon name="IconGlyph/home" size="sm" tone="primary" />
						<Icon name="IconGlyph/home" size="md" tone="primary" />
						<Icon name="IconGlyph/home" size="lg" tone="primary" />
					</div>
				</div>

				{/* Tone variations */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">
						Tones (primary/secondary/muted)
					</h3>
					<div className="flex gap-6 items-center">
						<Icon name="IconGlyph/home" size="md" tone="primary" />
						<Icon name="IconGlyph/home" size="md" tone="secondary" />
						<Icon name="IconGlyph/home" size="md" tone="muted" />
					</div>
				</div>

				{/* All glyphs */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">All 13 Glyphs</h3>
					<div className="flex flex-wrap gap-6">
						<Icon name="IconGlyph/home" size="md" tone="primary" />
						<Icon
							name="IconGlyph/brand-safari"
							size="md"
							tone="primary"
						/>
						<Icon
							name="IconGlyph/settings-2"
							size="md"
							tone="primary"
						/>
						<Icon
							name="IconGlyph/affiliate"
							size="md"
							tone="primary"
						/>
						<Icon
							name="IconGlyph/device-desktop-analytics"
							size="md"
							tone="primary"
						/>
						<Icon name="IconGlyph/book" size="md" tone="primary" />
						<Icon
							name="IconGlyph/writing-sign"
							size="md"
							tone="primary"
						/>
						<Icon name="IconGlyph/slash" size="md" tone="primary" />
						<Icon name="IconGlyph/minus" size="md" tone="primary" />
						<Icon
							name="IconGlyph/minus-vertical"
							size="md"
							tone="primary"
						/>
						<Icon
							name="IconGlyph/chevron-right"
							size="md"
							tone="primary"
						/>
						<Icon
							name="IconGlyph/circle-chevron-right"
							size="md"
							tone="primary"
						/>
						<Icon
							name="IconGlyph/circle-chevrons-right"
							size="md"
							tone="primary"
						/>
					</div>
				</div>
			</section>

			{/* Button Demo */}
			<section className="space-y-6">
				<h2 className="text-2xl font-bold">Button Primitive</h2>

				{/* Glass variant */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">
						Glass Variant (sm/md/lg)
					</h3>
					<div className="flex gap-4 items-center">
						<Button variant="glass" size="sm">
							Small
						</Button>
						<Button variant="glass" size="md">
							Medium
						</Button>
						<Button variant="glass" size="lg">
							Large
						</Button>
					</div>
				</div>

				{/* Ghost variant */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">
						Ghost Variant (sm/md/lg)
					</h3>
					<div className="flex gap-4 items-center">
						<Button variant="ghost" size="sm">
							Small
						</Button>
						<Button variant="ghost" size="md">
							Medium
						</Button>
						<Button variant="ghost" size="lg">
							Large
						</Button>
					</div>
				</div>

				{/* With icons */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">
						With Icons (iconLeft/iconRight)
					</h3>
					<div className="flex gap-4 items-center flex-wrap">
						<Button
							variant="glass"
							size="md"
							iconLeft="IconGlyph/home"
						>
							Home
						</Button>
						<Button
							variant="glass"
							size="md"
							iconRight="IconGlyph/chevron-right"
						>
							Next
						</Button>
						<Button
							variant="glass"
							size="md"
							iconLeft="IconGlyph/settings-2"
							iconRight="IconGlyph/chevron-right"
						>
							Settings
						</Button>
						<Button
							variant="ghost"
							size="md"
							iconLeft="IconGlyph/book"
						>
							Docs
						</Button>
					</div>
				</div>

				{/* Disabled state */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Disabled State</h3>
					<div className="flex gap-4 items-center">
						<Button variant="glass" size="md" disabled>
							Disabled Glass
						</Button>
						<Button variant="ghost" size="md" disabled>
							Disabled Ghost
						</Button>
					</div>
				</div>
			</section>

			{/* Integration Test */}
			<section className="space-y-6">
				<h2 className="text-2xl font-bold">
					Icon + Button Integration
				</h2>
				<div className="flex gap-4 flex-wrap">
					{[
						"home",
						"brand-safari",
						"settings-2",
						"book",
						"affiliate",
					].map((glyph) => (
						<Button
							key={glyph}
							variant="glass"
							size="md"
							iconLeft={`IconGlyph/${glyph}` as any}
							title={glyph}
						>
							{glyph.split("-").join(" ")}
						</Button>
					))}
				</div>
			</section>
		</div>
	);
}
