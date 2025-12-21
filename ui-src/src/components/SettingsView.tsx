import { motion } from "framer-motion";
import {
	Cpu,
	Eye,
	Save,
	Zap,
	Laptop,
	Ghost,
	Check,
	Github,
	HardDrive,
	User as UserIcon,
} from "lucide-react";

import { useSoloist } from "../context/SoloistContext";

export const SettingsView = () => {
	const { settings, updateSettings } = useSoloist();
	const SettingSection = ({ title, icon: Icon, children }: any) => (
		<div className="mb-8 last:mb-0">
			<div className="flex items-center gap-3 mb-6">
				<div className="p-2 rounded-lg bg-glass-subtle border border-glass-stroke text-accent-cyan">
					<Icon size={18} />
				</div>
				<h3 className="font-brand text-xl text-white tracking-wide">
					{title}
				</h3>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{children}
			</div>
		</div>
	);

	const OptionCard = ({
		active,
		onClick,
		title,
		description,
		icon: Icon,
		colorClass = "bg-primary",
	}: any) => (
		<motion.button
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			onClick={onClick}
			className={`
                relative p-6 rounded-xl border text-left h-full transition-all duration-300
                ${
					active
						? `bg-bg-raised border-${colorClass.replace(
								"bg-",
								""
						  )} shadow-lg ring-1 ring-${colorClass.replace(
								"bg-",
								""
						  )}/50`
						: "bg-glass-subtle border-glass-stroke hover:border-glass-stroke/80"
				}
            `}
		>
			{active && (
				<div
					className={`absolute top-4 right-4 p-1 rounded-full ${colorClass} text-black`}
				>
					<Check size={12} strokeWidth={3} />
				</div>
			)}

			<div
				className={`
                w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors
                ${
					active
						? colorClass + " text-black"
						: "bg-bg-void text-gray-400"
				}
            `}
			>
				<Icon size={20} />
			</div>

			<h4
				className={`font-brand mb-2 ${
					active ? "text-white" : "text-gray-300"
				}`}
			>
				{title}
			</h4>
			<p className="text-xs text-gray-500 leading-relaxed font-mono">
				{description}
			</p>
		</motion.button>
	);

	return (
		<div className="h-full w-full overflow-y-auto p-4 lg:p-12 pb-32">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="max-w-5xl mx-auto"
			>
				<header className="mb-12 border-b border-glass-stroke pb-8">
					<h1 className="font-brand text-4xl text-white mb-2 text-shadow-glow">
						System Configuration
					</h1>
					<p className="text-gray-500 font-mono text-sm max-w-2xl">
						Customize your Soloist OS environment. These preferences
						persist locally and sync across your sessions.
					</p>
				</header>

				<SettingSection title="User Profile" icon={UserIcon}>
					<div className="md:col-span-3 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 bg-glass-subtle rounded-xl p-8 border border-glass-stroke">
						<div className="flex flex-col items-center gap-4">
							<div className="w-24 h-24 rounded-full bg-bg-void border-2 border-primary/30 flex items-center justify-center relative overflow-hidden group">
								{settings.userProfile?.avatarUrl ? (
									<img
										src={settings.userProfile.avatarUrl}
										alt="Avatar"
										className="w-full h-full object-cover"
									/>
								) : (
									<UserIcon
										size={32}
										className="text-gray-600"
									/>
								)}
								<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-xs text-white">
									Change
								</div>
							</div>
						</div>
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-xs text-gray-400 uppercase tracking-widest font-mono">
										Display Name
									</label>
									<input
										type="text"
										value={
											settings.userProfile?.displayName ||
											""
										}
										onChange={(e) =>
											updateSettings({
												userProfile: {
													...settings.userProfile,
													displayName: e.target.value,
												},
											})
										}
										className="w-full bg-bg-void border border-glass-stroke rounded-lg py-2 px-3 text-white font-mono text-sm focus:outline-none focus:border-accent-cyan/50"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-xs text-gray-400 uppercase tracking-widest font-mono">
										Role / Title
									</label>
									<input
										type="text"
										value={settings.userProfile?.role || ""}
										onChange={(e) =>
											updateSettings({
												userProfile: {
													...settings.userProfile,
													role: e.target.value,
												},
											})
										}
										className="w-full bg-bg-void border border-glass-stroke rounded-lg py-2 px-3 text-white font-mono text-sm focus:outline-none focus:border-accent-cyan/50"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<label className="text-xs text-gray-400 uppercase tracking-widest font-mono">
									Short Bio
								</label>
								<textarea
									value={settings.userProfile?.bio || ""}
									onChange={(e) =>
										updateSettings({
											userProfile: {
												...settings.userProfile,
												bio: e.target.value,
											},
										})
									}
									className="w-full bg-bg-void border border-glass-stroke rounded-lg py-2 px-3 text-white font-mono text-sm focus:outline-none focus:border-accent-cyan/50 h-20 resize-none"
								/>
							</div>
						</div>
					</div>
				</SettingSection>

				<SettingSection title="Intelligence Level" icon={Cpu}>
					<OptionCard
						title="Teacher Mode"
						description="Proactive guidance, architectural advice, and detailed explanations for every decision."
						icon={Zap}
						active={settings.aiLevel === "teacher"}
						onClick={() => updateSettings({ aiLevel: "teacher" })}
						colorClass="bg-accent-purple"
					/>
					<OptionCard
						title="Co-Pilot"
						description="Balanced assistance. Suggests completions and valid tokens without interrupting flow."
						icon={Laptop}
						active={settings.aiLevel === "guide"}
						onClick={() => updateSettings({ aiLevel: "guide" })}
						colorClass="bg-accent-cyan"
					/>
					<OptionCard
						title="Silent Mode"
						description="Manual control only. No automated suggestions or interruptions. pure purity."
						icon={Ghost}
						active={settings.aiLevel === "silent"}
						onClick={() => updateSettings({ aiLevel: "silent" })}
						colorClass="bg-gray-200"
					/>
				</SettingSection>

				<SettingSection title="Visual Fidelity" icon={Eye}>
					<OptionCard
						title="High Fidelity"
						description="Full glassmorphism, blurs, glow effects and smooth motion. Requires GPU acceleration."
						icon={Zap}
						active={settings.visualFidelity === "high"}
						onClick={() =>
							updateSettings({ visualFidelity: "high" })
						}
						colorClass="bg-accent-orange"
					/>
					<OptionCard
						title="Performance"
						description="Reduced motion, solid opacity layers, and optimized for lower-power devices."
						icon={Cpu}
						active={settings.visualFidelity === "performance"}
						onClick={() =>
							updateSettings({ visualFidelity: "performance" })
						}
						colorClass="bg-accent-success"
					/>
				</SettingSection>

				<SettingSection title="Persistence" icon={Save}>
					<OptionCard
						title="Local Storage"
						description="Data is stored within the Figma document's shared plugin data."
						icon={HardDrive}
						active={settings.storageType === "local"}
						onClick={() => updateSettings({ storageType: "local" })}
						colorClass="bg-white"
					/>
					<OptionCard
						title="GitHub Sync"
						description="Sync tokens and docs directly to a repository. (Requires Authentication)"
						icon={Github}
						active={settings.storageType === "github"}
						onClick={() =>
							updateSettings({ storageType: "github" })
						}
						colorClass="bg-white"
					/>
				</SettingSection>
			</motion.div>
		</div>
	);
};
