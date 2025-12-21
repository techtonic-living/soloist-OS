import React, {
	createContext,
	useContext,
	useState,
	useRef,
	ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TOAST } from "../constants";

interface Toast {
	id: string;
	message: ReactNode;
}

interface ToastContextType {
	/** Show a standard status update (${TOAST.DURATION.STANDARD}ms) */
	standard: (message: ReactNode) => void;
	/** Show a quick feedback message (${TOAST.DURATION.TRANSIENT}ms) */
	transient: (message: ReactNode) => void;
	/** Show an error message (${TOAST.DURATION.ERROR}ms) */
	error: (message: ReactNode) => void;
	/** Clear any active toast immediately */
	clear: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	const [toast, setToast] = useState<Toast | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const internalShow = (message: ReactNode, duration: number) => {
		// Clear any existing timeout to prevent stale closures
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		const id = Date.now().toString();
		setToast({ id, message });

		// Set new timeout and store reference
		timeoutRef.current = setTimeout(() => {
			setToast(null);
			timeoutRef.current = null;
		}, duration);
	};

	const standard = (message: ReactNode) =>
		internalShow(message, TOAST.DURATION.STANDARD);
	const transient = (message: ReactNode) =>
		internalShow(message, TOAST.DURATION.TRANSIENT);
	const error = (message: ReactNode) =>
		internalShow(message, TOAST.DURATION.ERROR);
	const clear = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setToast(null);
	};

	const value = React.useMemo(
		() => ({ standard, transient, error, clear }),
		[toast]
	);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<AnimatePresence>
				{toast && (
					<motion.div
						initial={{ opacity: 0, y: 50, x: "-50%" }}
						animate={{ opacity: 1, y: 0, x: "-50%" }}
						exit={{ opacity: 0, y: 20, x: "-50%" }}
						transition={{ duration: 0.2 }}
						className="fixed bottom-6 left-1/2 z-[1000] px-4 py-2 bg-black/80 backdrop-blur-md text-white/90 text-xs font-bold tracking-wider uppercase rounded-full border border-white/10 shadow-lg whitespace-nowrap"
					>
						{toast.message}
					</motion.div>
				)}
			</AnimatePresence>
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
};
