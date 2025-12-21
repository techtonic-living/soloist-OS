import React, { useState, useEffect } from "react";
import { colord } from "colord";
import { Copy, Check, X } from "lucide-react";

interface SmartColorInputProps {
	id: string;
	value: string; // The display string (e.g. "FF0000" or "255, 0, 0")
	type: "hex" | "rgb" | "hsl" | "hsb";
	label?: string;
	onCommit?: (val: string) => void;
	onCopy: () => void;
	isCopied: boolean;
	editable?: boolean;
	disabled?: boolean;
	onEditStart: (id: string) => void;
	onEditEnd: () => void;
	hideCopy?: boolean;
	isDark?: boolean;
}

export const SmartColorInput = ({
	id,
	value,
	type,
	label,
	onCommit,
	onCopy,
	isCopied,
	editable = false,
	disabled = false,
	onEditStart,
	onEditEnd,
	hideCopy = false,
	isDark,
}: SmartColorInputProps) => {
	// Local state
	const [localValue, setLocalValue] = useState(value);
	const [isEditing, setIsEditing] = useState(false);
	const [initialHexValue, setInitialHexValue] = useState<string | null>(null);

	// Slider State
	const [activeComponent, setActiveComponent] = useState<number | null>(null);
	const [initialValue, setInitialValue] = useState<string | null>(null);

	// Sync local value when prop changes (if not editing)
	useEffect(() => {
		if (!isEditing && activeComponent === null) {
			setLocalValue(value);
		}
	}, [value, isEditing, activeComponent]);

	// ---------------------------
	// Slider Logic
	// ---------------------------
	const getComponentValues = () => {
		if (type === "hex") return [];
		return localValue
			.replace(/%/g, "")
			.split(",")
			.map((p) => parseInt(p.trim()));
	};

	const componentValues = getComponentValues();

	const getSliderConfig = (index: number) => {
		if (type === "rgb") return { min: 0, max: 255 };
		if (type === "hsl" || type === "hsb")
			return { min: 0, max: index === 0 ? 360 : 100 };
		return { min: 0, max: 100 };
	};

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (activeComponent === null) return;
		const newVal = parseInt(e.target.value);
		const newComponents = [...componentValues];
		newComponents[activeComponent] = newVal;

		let formattedString = "";
		if (type === "rgb") {
			formattedString = newComponents.join(", ");
		} else {
			formattedString = `${newComponents[0]}, ${newComponents[1]}%, ${newComponents[2]}%`;
		}

		setLocalValue(formattedString);
		// Real-time update
		if (onCommit) onCommit(formattedString);
	};

	const startSlider = (idx: number) => {
		if (disabled) return;
		setInitialValue(value);
		setActiveComponent(idx);
		onEditStart(id);
	};

	const commitSlider = () => {
		setActiveComponent(null);
		setInitialValue(null);
		onEditEnd();
	};

	const revertSlider = () => {
		if (initialValue && onCommit) {
			onCommit(initialValue);
			setLocalValue(initialValue);
		}
		setActiveComponent(null);
		setInitialValue(null);
		onEditEnd();
	};

	// ---------------------------
	// Text Input Logic (Hex)
	// ---------------------------
	const handleSave = () => {
		let commitValue = localValue;

		if (type === "hex") {
			const hexPattern = /^[A-Fa-f0-9]{6}$/;
			const normalizedValue = `#${localValue.replace(/^#/, "")}`;

			if (
				!hexPattern.test(localValue) ||
				!colord(normalizedValue).isValid()
			) {
				return;
			}

			commitValue = normalizedValue;
		}

		if (onCommit) {
			onCommit(commitValue);
		}
		setInitialHexValue(null);
		setIsEditing(false);
		onEditEnd();
	};

	const handleCancel = () => {
		if (type === "hex" && initialHexValue) {
			setLocalValue(initialHexValue);
			if (onCommit) onCommit(initialHexValue);
		} else {
			setLocalValue(value);
		}
		setInitialHexValue(null);
		setIsEditing(false);
		onEditEnd();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSave();
		} else if (e.key === "Escape") {
			e.preventDefault();
			handleCancel();
		}
	};

	// ---------------------------
	// Render
	// ---------------------------
	const renderContent = () => {
		// HEX Mode: Text Input (Keep the unified style for Hex)
		if (type === "hex") {
			if (isEditing) {
				const hexPattern = /^[A-Fa-f0-9]{6}$/;
				const normalizedValue = `#${localValue.replace(/^#/, "")}`;
				const isInvalid =
					!hexPattern.test(localValue) ||
					!colord(normalizedValue).isValid();

				return (
					<div className="relative z-[100] flex flex-col gap-1 flex-1 min-w-0">
						<div className="flex items-center gap-2 flex-1 min-w-0">
							<input
								autoFocus
								type="text"
								value={localValue.toUpperCase()}
								onChange={(e) => {
									const nextVal = e.target.value.replace(
										/^#/,
										""
									);
									setLocalValue(nextVal);

									if (
										hexPattern.test(nextVal) &&
										colord(`#${nextVal}`).isValid()
									) {
										if (onCommit) onCommit(`#${nextVal}`);
									}
								}}
								onKeyDown={handleKeyDown}
								className={`flex-1 min-w-0 bg-black/40 text-white text-sm font-brand font-bold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 shadow-lg transition-colors text-center ${
									isInvalid
										? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
										: "border-white/20 focus:border-accent-cyan focus:ring-accent-cyan/20"
								}`}
								title="Hex Value"
								placeholder="000000"
							/>
							<div className="flex items-center gap-1 shrink-0">
								<button
									onClick={handleCancel}
									className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors backdrop-blur-sm"
									title="Cancel"
								>
									<X size={12} />
								</button>
								<button
									onClick={handleSave}
									disabled={isInvalid}
									className={`p-1.5 rounded-full text-white transition-colors backdrop-blur-sm ${
										isInvalid
											? "bg-gray-500 opacity-50"
											: "bg-green-500/80 hover:bg-green-500"
									}`}
									title={
										isInvalid
											? "Invalid Hex Color Format"
											: "Save"
									}
								>
									<Check size={12} />
								</button>
							</div>
						</div>
					</div>
				);
			} else {
				return (
					<button
						onClick={() => {
							if (editable && !disabled) {
								setInitialHexValue(value);
								setLocalValue(value.replace(/^#/, ""));
								setIsEditing(true);
								onEditStart(id);
							}
						}}
						disabled={!editable || disabled}
						className={`
                            flex-1 text-center transition-all duration-300 font-bold text-3xl font-brand
                            ${
								editable && !disabled
									? "cursor-pointer hover:text-white"
									: "cursor-default select-none"
							}
                            ${
								disabled
									? "opacity-30 blur-[1px]"
									: isDark
									? "opacity-90 text-white"
									: "opacity-90 text-black/80"
							}
                        `}
					>
						{value.toUpperCase()}
					</button>
				);
			}
		}

		// SLIDER Mode (Active)
		if (activeComponent !== null) {
			const config = getSliderConfig(activeComponent);
			return (
				<div className="relative z-[100] flex items-center gap-2 flex-1 min-w-0">
					<div
						className="flex items-center gap-1.5 w-[120px] bg-black/40 rounded px-2 py-0.5 animate-in fade-in zoom-in-95 duration-200 border border-accent-cyan backdrop-blur-md"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Component Label */}
						<span className="text-[10px] font-mono opacity-60 w-3 text-right shrink-0">
							{activeComponent === 0
								? type === "rgb"
									? "R"
									: "H"
								: activeComponent === 1
								? type === "rgb"
									? "G"
									: "S"
								: type === "rgb"
								? "B"
								: type === "hsl"
								? "L"
								: "B"}
						</span>

						{/* Slider */}
						<input
							type="range"
							min={config.min}
							max={config.max}
							value={componentValues[activeComponent]}
							onChange={handleSliderChange}
							autoFocus
							className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-accent-cyan hover:accent-accent-cyan/80 min-w-0"
							title="Adjust Value"
						/>

						{/* Value Readout */}
						<span className="text-[10px] font-mono font-bold w-6 text-left shrink-0">
							{componentValues[activeComponent]}
						</span>
					</div>

					{/* Actions: Revert & Commit (Outside, aligned with Hex) */}
					<div className="flex items-center gap-1 shrink-0">
						<button
							onClick={(e) => {
								e.stopPropagation();
								revertSlider();
							}}
							className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors backdrop-blur-sm"
							title="Cancel"
						>
							<X size={12} />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								commitSlider();
							}}
							className="p-1.5 rounded-full bg-green-500/80 hover:bg-green-500 text-white transition-colors backdrop-blur-sm"
							title="Commit"
						>
							<Check size={12} />
						</button>
					</div>
				</div>
			);
		}

		return (
			<div
				className={`grid grid-cols-3 gap-3 flex-1 text-xs font-mono transition-all duration-300 ${
					disabled
						? "opacity-30 blur-[1px] pointer-events-none"
						: `opacity-90 cursor-default ${
								isDark ? "text-white" : "text-black/80"
						  }`
				}`}
			>
				{componentValues.map((val, idx) => (
					<button
						key={idx}
						onClick={(e) => {
							e.stopPropagation();
							startSlider(idx);
						}}
						className={`px-0.5 rounded transition-colors w-full ${
							idx === 2 ? "text-left pl-2" : "text-right"
						} ${
							isDark
								? "hover:bg-white/10 hover:text-white"
								: "hover:bg-black/10 hover:text-black"
						}`}
						title={`Adjust ${type.toUpperCase()} value`}
						disabled={disabled}
					>
						{val}
						{type !== "rgb" && idx > 0 ? "%" : ""}
						{idx < 2 && (
							<span
								className={`opacity-30 ml-px ${
									isDark ? "text-white" : "text-black"
								}`}
							>
								,
							</span>
						)}
					</button>
				))}
			</div>
		);
	};

	return (
		<div
			className={`flex items-center ${
				type === "hex" || isEditing || activeComponent !== null
					? "justify-center"
					: "justify-between"
			} px-12 gap-1 group/field w-full relative h-7 ${
				disabled ? "pointer-events-none" : ""
			} ${isEditing || activeComponent !== null ? "z-[100]" : "z-auto"}`}
		>
			{label && (
				<span
					className={`text-[9px] font-mono w-8 text-left transition-all duration-300 ${
						disabled
							? "opacity-10"
							: isDark
							? "text-white opacity-40"
							: "text-black opacity-50"
					} ${
						isEditing || activeComponent !== null
							? "absolute left-2"
							: ""
					}`}
				>
					{label}
				</span>
			)}

			{renderContent()}

			{/* Copy Button (Only if NOT active slider/editing AND not hidden) */}
			{!isEditing && activeComponent === null && !hideCopy && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						if (!disabled) onCopy();
					}}
					disabled={disabled}
					className={`
                        p-1.5 rounded-lg transition-all absolute right-2
                        ${
							isCopied
								? "opacity-100"
								: "opacity-0 group-hover/field:opacity-100"
						}
                        ${
							isDark
								? "text-white hover:bg-white/10"
								: "text-black hover:bg-black/10"
						}
                        ${disabled ? "hidden" : ""}
                    `}
					title={`Copy ${type.toUpperCase()}`}
				>
					{isCopied ? (
						<Check
							size={type === "hex" ? 14 : 12}
							className="text-green-500"
						/>
					) : (
						<Copy
							size={type === "hex" ? 14 : 12}
							className={isDark ? "text-white" : "text-black"}
						/>
					)}
				</button>
			)}
		</div>
	);
};
