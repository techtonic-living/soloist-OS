import { colord, extend } from "colord";
import mixPlugin from "colord/plugins/mix";
import harmoniesPlugin from "colord/plugins/harmonies";
import a11yPlugin from "colord/plugins/a11y";

extend([mixPlugin, harmoniesPlugin, a11yPlugin]);

export interface ColorToken {
	id: number;
	hex: string;
	name: string;
	locked: boolean;
	isAccent?: boolean;
}

// Helper to lock values
// const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max); // Unused for now

export const generateRamp = (
	seedHex: string,
	currentRamp: ColorToken[] = [],
	prefix: string = "primary"
): ColorToken[] => {
	const seed = colord(seedHex);

	// Define the scale steps (Standard 11-step scale)
	// Base is 500
	const steps = [
		{ id: 1, name: `${prefix}/50`, l: 0.45, h: -5, s: 0, locked: false },

		{ id: 2, name: `${prefix}/100`, l: 0.4, h: -4, s: 0, locked: false },
		{ id: 3, name: `${prefix}/200`, l: 0.3, h: -3, s: 0, locked: false },
		{ id: 4, name: `${prefix}/300`, l: 0.2, h: -2, s: 0, locked: false },
		{ id: 5, name: `${prefix}/400`, l: 0.1, h: -1, s: 0, locked: false },
		{
			id: 6,
			name: `${prefix}/500`,
			l: 0,
			h: 0,
			s: 0,
			locked: true,
			isAccent: true,
		}, // SEED
		{ id: 7, name: `${prefix}/600`, l: -0.1, h: 1, s: 0.05, locked: false },
		{ id: 8, name: `${prefix}/700`, l: -0.2, h: 2, s: 0.1, locked: false },
		{ id: 9, name: `${prefix}/800`, l: -0.3, h: 3, s: 0.15, locked: false },
		{ id: 10, name: `${prefix}/900`, l: -0.4, h: 4, s: 0.2, locked: false },
		{
			id: 11,
			name: `${prefix}/950`,
			l: -0.45,
			h: 5,
			s: 0.25,
			locked: false,
		},
	];

	// Map existing locks for quick lookup
	const lockedColors = new Map<number, ColorToken>();
	currentRamp.forEach((c) => {
		if (c.locked) lockedColors.set(c.id, c);
	});

	return steps.map((step) => {
		// Check if locked (But always allow ID 6 - the seed - to update if we are regenerating)
		if (lockedColors.has(step.id) && step.id !== 6) {
			return lockedColors.get(step.id)!;
		}

		// Generate new color
		let newColor = seed;

		// 1. Shift Hue (Cooler shadows, warmer lights)
		newColor = newColor.rotate(step.h);

		// 2. Shift Saturation
		if (step.s > 0) newColor = newColor.saturate(step.s);

		// 3. Shift Lightness
		if (step.l < 0) {
			newColor = newColor.darken(Math.abs(step.l));
		} else if (step.l > 0) {
			newColor = newColor.lighten(step.l);
		}

		return {
			id: step.id,
			hex: newColor.toHex(),
			name: step.name,
			locked: step.locked, // Default from step definition
			isAccent: step.isAccent,
		};
	});
};

export const generateNeutrals = (seedHex: string): ColorToken[] => {
	const seed = colord(seedHex);
	const seedHsl = seed.saturate(0.02).toHsl();

	// Neutrals heavily desaturated, slightly tinted with seed
	const steps = [
		{ id: 101, name: "neutral/50", l: 98 },
		{ id: 102, name: "neutral/100", l: 94 },
		{ id: 103, name: "neutral/200", l: 88 },
		{ id: 104, name: "neutral/300", l: 82 },
		{ id: 105, name: "neutral/400", l: 64 },
		{ id: 106, name: "neutral/500", l: 45 },
		{ id: 107, name: "neutral/600", l: 35 },
		{ id: 108, name: "neutral/700", l: 25 },
		{ id: 109, name: "neutral/800", l: 15 },
		{ id: 110, name: "neutral/900", l: 8 },
		{ id: 111, name: "neutral/950", l: 4 },
	];

	return steps.map((step) => ({
		id: step.id,
		hex: colord({ h: seedHsl.h, s: seedHsl.s, l: step.l }).toHex(),
		name: step.name,
		locked: false,
	}));
};

export const generateSignals = (): ColorToken[] => {
	// Standard accessible signals
	const defaults = [
		{ id: 201, name: "signal-success/500", hex: "#198754" },
		{ id: 202, name: "signal-warning/500", hex: "#fd7e14" },
		{ id: 203, name: "signal-error/500", hex: "#dc3545" },
		{ id: 204, name: "signal-info/500", hex: "#0dcaf0" },
	];
	return defaults.map((d) => ({
		...d,
		locked: false,
		isAccent: true,
	}));
};

export const generateAlphas = (baseHex: string = "#000000"): ColorToken[] => {
	// Simple opacity scale
	const steps = [
		{ id: 301, name: "alpha/5", opacity: 0.05 },
		{ id: 302, name: "alpha/10", opacity: 0.1 },
		{ id: 303, name: "alpha/20", opacity: 0.2 },
		{ id: 304, name: "alpha/40", opacity: 0.4 },
		{ id: 305, name: "alpha/60", opacity: 0.6 },
		{ id: 306, name: "alpha/80", opacity: 0.8 },
	];
	const base = colord(baseHex);

	return steps.map((step) => ({
		id: step.id,
		hex: base.alpha(step.opacity).toHex(), // Note: colord.toHex() might output #RRGGBBAA
		name: step.name,
		locked: false,
	}));
};
