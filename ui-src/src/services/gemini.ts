import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
	console.warn(
		"VITE_GEMINI_API_KEY is not set in the environment variables."
	);
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

/**
 * Get the Gemini model instance.
 * @returns The generative model instance.
 */
export const getGeminiModel = () => {
	return genAI.getGenerativeModel(
		{ model: "gemini-2.5-flash-lite" },
		{ apiVersion: "v1beta" }
	);
};

/**
 * Generate content from a text prompt.
 * @param prompt The text prompt to send to the model.
 * @returns The generated text response.
 */
export const generateText = async (prompt: string): Promise<string> => {
	try {
		console.log("[Gemini] Attempting to generate content...");
		console.log("[Gemini] API Key present:", !!API_KEY);

		const model = getGeminiModel();
		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();

		console.log("[Gemini] Successfully generated content");
		return text;
	} catch (error) {
		console.error("[Gemini] Error generating content:", error);
		console.error("[Gemini] Error details:", {
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		});

		// Attempt to list available models for debugging
		try {
			console.log("[Gemini] Listing available models...");
			const response = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
			);
			const data = await response.json();
			console.log("[Gemini] Available models:", data);
		} catch (listError) {
			console.error("[Gemini] Failed to list models:", listError);
		}

		throw error;
	}
};
