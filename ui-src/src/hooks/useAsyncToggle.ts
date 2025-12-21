import { useState, useCallback } from "react";

export type AsyncStatus = "idle" | "pending" | "success" | "error";

export const useAsyncToggle = () => {
	const [status, setStatus] = useState<AsyncStatus>("idle");

	const toggle = useCallback(
		async (action: () => Promise<void>) => {
			if (status === "pending") return;

			setStatus("pending");
			try {
				await action();
				setStatus("success");
				// Reset to idle after a moment to allow re-toggling if needed,
				// or keep success state if it represents a persistent "on" state?
				// For a favorite toggle, the state is driven by the data (isFavorite prop).
				// This hook purely manages the *transition* feedback.
				setTimeout(() => setStatus("idle"), 1000);
			} catch (error) {
				console.error("Toggle action failed", error);
				setStatus("error");
				setTimeout(() => setStatus("idle"), 2000);
			}
		},
		[status]
	);

	return { status, toggle };
};
