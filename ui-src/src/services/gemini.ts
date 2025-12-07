import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
	console.warn(
		"VITE_GEMINI_API_KEY is not set in the environment variables."
	);
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

/**
 * Get the Gemini Pro model instance.
 * @returns The generative model instance.
 */
export const getGeminiModel = () => {
	return genAI.getGenerativeModel({ model: "gemini-pro" });
};

/**
 * Generate content from a text prompt.
 * @param prompt The text prompt to send to the model.
 * @returns The generated text response.
 */
export const generateText = async (prompt: string): Promise<string> => {
	try {
		const model = getGeminiModel();
		const result = await model.generateContent(prompt);
		const response = await result.response;
		return response.text();
	} catch (error) {
		console.error("Error generating content with Gemini:", error);
		throw error;
	}
};
