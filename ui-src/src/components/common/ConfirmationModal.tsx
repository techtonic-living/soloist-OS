import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Info } from "lucide-react";

interface ConfirmationModalProps {
	isOpen: boolean;
	title: string;
	message: React.ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "danger" | "default";
	onConfirm: () => void;
	onCancel: () => void;
}

export const ConfirmationModal = ({
	isOpen,
	title,
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	variant = "default",
	onConfirm,
	onCancel,
}: ConfirmationModalProps) => {
	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onCancel}
						className="absolute inset-0 bg-bg-void/80 backdrop-blur-sm"
					/>

					{/* Modal Card */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 10 }}
						className="relative w-full max-w-md bg-bg-raised border border-glass-stroke rounded-2xl shadow-2xl overflow-hidden"
					>
						{/* Header/Content Area */}
						<div className="p-6">
							<div className="flex gap-4 items-start">
								{/* Icon */}
								<div
									className={`p-3 rounded-full shrink-0 ${
										variant === "danger"
											? "bg-red-500/10 text-red-500"
											: "bg-accent-cyan/10 text-accent-cyan"
									}`}
								>
									{variant === "danger" ? (
										<AlertTriangle size={24} />
									) : (
										<Info size={24} />
									)}
								</div>

								<div className="flex-1">
									<h3 className="text-xl font-brand text-white mb-2 leading-tight">
										{title}
									</h3>
									<div className="text-gray-400 text-sm leading-relaxed">
										{message}
									</div>
								</div>
							</div>
						</div>

						{/* Footer Actions */}
						<div className="p-4 bg-black/20 border-t border-glass-stroke flex justify-end gap-3">
							<button
								onClick={onCancel}
								className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
							>
								{cancelLabel}
							</button>
							<button
								onClick={onConfirm}
								className={`px-4 py-2 text-sm font-bold rounded-lg transition-all shadow-lg ${
									variant === "danger"
										? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20"
										: "bg-accent-cyan hover:bg-accent-cyan/80 text-black shadow-accent-cyan/20"
								}`}
							>
								{confirmLabel}
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
};
