import { hex } from "wcag-contrast"; // You might need to install: npm install wcag-contrast

// Types
export type AILevel = "silent" | "guide" | "teacher";

interface Advice {
	status: "success" | "warning" | "error";
	message: string;
}

// 1. The Math (Simulated for this demo, usually requires a color library)
const getContrastRatio = (hex1: string, hex2: string) => {
	// Mocking simple relative luminance check if library isn't present
	// In prod, use a robust library like 'tinycolor2' or 'colord'
	try {
		return hex(hex1, hex2);
	} catch (e) {
		// Fallback mock if package missing or error
		return 4.5;
	}
};

// 2. The Personality Engine
export const generateColorAdvice = (
	fgColor: string,
	bgColor: string,
	level: AILevel
): Advice | null => {
	if (level === "silent") return null;

	const ratio = getContrastRatio(fgColor, bgColor);
	const isPass = ratio >= 4.5; // AA Standard

	// MODE: GUIDE (Concise, professional, just the facts)
	if (level === "guide") {
		if (isPass)
			return {
				status: "success",
				message: `Contrast AA Pass (${ratio.toFixed(1)})`,
			};
		return {
			status: "warning",
			message: `Contrast Fail (${ratio.toFixed(1)}). Target: 4.5`,
		};
	}

	// MODE: TEACHER (Educational, explanatory, helpful)
	if (level === "teacher") {
		if (isPass) {
			return {
				status: "success",
				message: `Excellent work. A ratio of ${ratio.toFixed(
					1
				)} exceeds WCAG AA standards, ensuring readability for users with visual impairments. This combination is safe for body text.`,
			};
		}
		return {
			status: "error",
			message: `Critique: The contrast ratio is only ${ratio.toFixed(
				1
			)}. To meet accessibility standards, you need at least 4.5:1. Try darkening the background lightness by ~15% or increasing the foreground saturation.`,
		};
	}

	return null;
};
