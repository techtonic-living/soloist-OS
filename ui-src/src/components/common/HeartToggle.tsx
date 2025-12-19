import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

interface HeartToggleProps {
	isFavorite: boolean;
	onToggle: () => void;
	size?: number;
	className?: string;
	showPending?: boolean;
}

export const HeartToggle = ({
	isFavorite,
	onToggle,
	size = 14,
	className = "",
	showPending = false,
}: HeartToggleProps) => {
	const [isAnimating, setIsAnimating] = useState(false);

	// Trigger animation on toggle to true
	useEffect(() => {
		if (isFavorite) {
			setIsAnimating(true);
			const timer = setTimeout(() => setIsAnimating(false), 500); // Reset after animation
			return () => clearTimeout(timer);
		}
	}, [isFavorite]);

	return (
		<button
			onClick={(e) => {
				e.stopPropagation();
				onToggle();
			}}
			className={`relative p-1.5 rounded-full transition-all group/heart outline-none focus:ring-2 focus:ring-primary/20 ${className} ${
				isFavorite
					? "text-red-500 hover:bg-red-500/10"
					: "text-gray-400 hover:text-red-400 hover:bg-red-500/5"
			} ${showPending ? "animate-pulse opacity-70" : ""}`}
			title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
			disabled={showPending}
		>
			<motion.div
				initial={false}
				animate={{
					scale: isAnimating ? [1, 1.4, 0.9, 1.1, 1] : 1,
				}}
				transition={{
					duration: 0.4,
					type: "spring",
					stiffness: 400,
					damping: 15,
				}}
			>
				<Heart
					size={size}
					className={`transition-all duration-300 ${
						isFavorite ? "fill-current" : "fill-transparent"
					}`}
				/>
			</motion.div>

			{/* Burst Effect */}
			<AnimatePresence>
				{isAnimating && (
					<motion.span
						initial={{ scale: 0, opacity: 1 }}
						animate={{ scale: 1.5, opacity: 0 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4 }}
						className="absolute inset-0 rounded-full border border-red-500 pointer-events-none"
					/>
				)}
			</AnimatePresence>
		</button>
	);
};
