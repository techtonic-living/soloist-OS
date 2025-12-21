import { useState, useCallback } from "react";
import { useToast } from "../context/ToastContext";

const fallbackCopy = (text: string) => {
	const textArea = document.createElement("textarea");
	textArea.value = text;
	textArea.style.position = "fixed";
	textArea.style.left = "-9999px";
	textArea.style.top = "0";
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	try {
		document.execCommand("copy");
	} catch (err) {
		console.error("Fallback copy failed", err);
	}
	document.body.removeChild(textArea);
};

export const useCopyFeedback = () => {
	const [isCopied, setIsCopied] = useState(false);
	const toast = useToast();

	const copy = useCallback(
		(text: string, label?: React.ReactNode) => {
			// 1. Perform Copy
			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard
					.writeText(text)
					.catch(() => fallbackCopy(text));
			} else {
				fallbackCopy(text);
			}

			// 2. Trigger Feedback
			const message = label ? (
				<>
					Copied <span className="text-accent-cyan">{label}</span> to
					clipboard
				</>
			) : (
				"Copied to clipboard"
			);

			toast.transient(message);
			setIsCopied(true);

			// 3. Reset State
			setTimeout(() => setIsCopied(false), 2000);
		},
		[toast]
	);

	return { isCopied, copy };
};
