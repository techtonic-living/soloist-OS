import { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Toast {
	id: string;
	message: ReactNode;
}

interface ToastContextType {
	showToast: (message: ReactNode, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	const [toast, setToast] = useState<Toast | null>(null);

	const showToast = (message: ReactNode, duration = 3000) => {
		const id = Date.now().toString();
		setToast({ id, message });
		setTimeout(() => {
			setToast((current) => (current?.id === id ? null : current));
		}, duration);
	};

	return (
		<ToastContext.Provider value={{ showToast }}>
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
