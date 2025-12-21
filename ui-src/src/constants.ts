export const TOAST = {
	DURATION: {
		/** General status updates (e.g., "Saved to library") - 3000ms */
		STANDARD: 3000,
		/** Quick feedback loops (e.g., "Copied", "Orbit full") - 2000ms */
		TRANSIENT: 2000,
		/** Critical failures or complex errors - 5000ms */
		ERROR: 5000,
	},
} as const;

export const COPY = {
	LAB: {
		ATMOSPHERE_HELPER: "Pick a color from the generative atmosphere.",
	},
} as const;
