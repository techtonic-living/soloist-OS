import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";

export const ColorMatrix = ({
	ramp,
	setRamp,
}: {
	ramp: any[];
	setRamp: any;
}) => {
	const toggleLock = (id: number) => {
		setRamp((prev: any[]) =>
			prev.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c))
		);
	};

	return (
		<div className="flex flex-col h-full gap-6">
			{/* Advice UI Removed per user request for dedicated Audit Tool */}

			<div className="flex-1 flex gap-4 items-end justify-center perspective-1000 min-h-[300px]">
				{ramp.map((color, index) => (
					<MonolithColumn
						key={color.id}
						color={color}
						index={index}
						onToggleLock={() => toggleLock(color.id)}
					/>
				))}
			</div>
		</div>
	);
};

const MonolithColumn = ({ color, index, onToggleLock }: any) => {
	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{
				y: -16,
				transition: { type: "spring", stiffness: 300, damping: 20 },
			}}
			transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
			className="relative group flex flex-col items-center gap-3 w-20"
		>
			<div
				className="w-full relative rounded-xl cursor-pointer"
				style={{
					height: color.isAccent ? "280px" : "220px",
					backgroundColor: color.hex,
					boxShadow: `0 20px 40px -10px ${color.hex}40`,
				}}
			>
				<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-xl pointer-events-none" />
				<div className="absolute inset-0 border border-white/10 rounded-xl" />
				<div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						onClick={(e) => {
							e.stopPropagation();
							onToggleLock();
						}}
						className="p-2 bg-black/20 backdrop-blur-sm rounded-full text-white/70 hover:text-white"
					>
						{color.locked ? (
							<Lock size={12} />
						) : (
							<Unlock size={12} />
						)}
					</button>
				</div>
			</div>
			<div className="text-center space-y-1">
				<p className="font-brand text-lg text-white tracking-wide">
					{color.name
						? color.name.split("/")[1] || color.name.split(".")[1]
						: "???"}
				</p>
				<p className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">
					{color.hex}
				</p>
			</div>
		</motion.div>
	);
};
