import { hex } from "wcag-contrast";

// Types
export type AILevel = "silent" | "guide" | "teacher";

interface Advice {
	status: "success" | "warning" | "error";
	ratio: number;
	rating: string; // AA, AAA, Fail
	message: string;
}

// 1. The Math
const getContrastRatio = (hex1: string, hex2: string) => {
	try {
		return hex(hex1, hex2);
	} catch (e) {
		return 1; // Fail safe
	}
};

const getRating = (ratio: number) => {
	if (ratio >= 7) return "AAA";
	if (ratio >= 4.5) return "AA"; // Normal Text
	if (ratio >= 3) return "AA+"; // Large Text / UI
	return "Fail";
};

// 2. The Personality Engine
export const generateColorAdvice = (
	fgColor: string,
	bgColor: string,
	level: AILevel
): Advice | null => {
	if (level === "silent") return null;

	const ratio = getContrastRatio(fgColor, bgColor);
	const rating = getRating(ratio);
	const isPass = ratio >= 4.5; // Baseline for text

	// MODE: GUIDE (Concise data)
	if (level === "guide") {
		return {
			status: isPass ? "success" : ratio >= 3 ? "warning" : "error",
			ratio,
			rating,
			message: `${rating} (${ratio.toFixed(2)})`,
		};
	}

	// MODE: TEACHER (Educational context)
	if (level === "teacher") {
		if (isPass) {
			return {
				status: "success",
				ratio,
				rating,
				message: `Strong contrast (${ratio.toFixed(
					2
				)}). Great for body text.`,
			};
		}
		if (ratio >= 3) {
			return {
				status: "warning",
				ratio,
				rating,
				message: `Moderate contrast (${ratio.toFixed(
					2
				)}). Good for headlines or UI components, but avoid for small text.`,
			};
		}
		return {
			status: "error",
			ratio,
			rating,
			message: `Low contrast (${ratio.toFixed(
				2
			)}). Only use for decorative elements or disabled states.`,
		};
	}

	return null;
};
