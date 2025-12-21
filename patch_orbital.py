import sys

path = "/Users/jessesmith/Dev/soloist-OS/ui-src/src/components/lab/ColorCreator.tsx"

with open(path, 'r') as f:
    content = f.read()

# The start of the block we want to replace
start_marker = '{/* Orbiting Color Bubbles */}'
# The end of the block we want to replace (the end of the map function for bubbles)
# We look for the closing of the div that ends the toolkit if possible, or just the end of the map.
end_marker = '								);'

# Let's be more precise. We want to find the map call.
# {isSamplerActive && sampledColors.slice(0, 10).map... })}

new_content_block = """						{/* Orbiting Color Bubbles */}
						{isSamplerActive &&
							sampledColors.slice(0, 10).map((hex: string, i: number) => {
								const count = Math.min(sampledColors.length, 10);
								const spreadAngle = (360 / count) * i;
								const orbitAngle = (360 / count) * i;

								// Hover state values
								const radius = isSamplerHovered ? 60 : 42 + (i % 2) * 8;
								const scale = isSamplerHovered ? 1.25 : 1;

								return (
									<motion.div
										key={`${hex}-${i}`}
										className="absolute w-6 h-6 z-40"
										style={{
											left: "50%",
											top: "50%",
											marginLeft: "-12px",
											marginTop: "-12px",
										}}
										initial={false}
										animate={{
											rotate: isSamplerHovered ? spreadAngle : [orbitAngle, orbitAngle + 360],
										}}
										transition={{
											rotate: isSamplerHovered
												? { type: "spring", stiffness: 45, damping: 14 }
												: { duration: 15 + (i % 3) * 5, repeat: Infinity, ease: "linear" },
										}}
									>
										<motion.div
											className="absolute inset-0 group/bubble pointer-events-auto"
											initial={false}
											animate={{
												x: radius,
												scale: scale,
												rotate: isSamplerHovered ? -spreadAngle : [-(orbitAngle), -(orbitAngle + 360)]
											}}
											transition={{
												x: { type: "spring", stiffness: 80, damping: 12 },
												scale: { type: "spring", stiffness: 100, damping: 10 },
												rotate: isSamplerHovered
													? { type: "spring", stiffness: 45, damping: 14 }
													: { duration: 15 + (i % 3) * 5, repeat: Infinity, ease: "linear" },
											}}
										>
											{/* Bubble Color */}
											<button
												onClick={() => commitHex(hex)}
												className="absolute inset-0 rounded-full border border-white/20 shadow-sm transition-transform duration-200 group-hover/bubble:scale-110 cursor-pointer"
												style={{
													backgroundColor: hex,
												}}
												title={`Sample ${hex}`}
											/>

											{/* Delete Action (Appears on Hover) */}
											<button
												onClick={(e) => {
													e.stopPropagation();
													toast.clear();
													setSampledColors(
														(prev: string[]) =>
															prev.filter(
																(
																	c: string
																) =>
																	c !== hex
															)
													);
												}}
												className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover/bubble:opacity-100 transition-all duration-200 scale-75 group-hover/bubble:scale-100 shadow-sm hover:bg-red-600 z-10"
												title="Remove from orbit"
											>
												<X size={10} strokeWidth={3} />
											</button>
										</motion.div>
									</motion.div>
								);
							})}"""

# Find the start index
start_idx = content.find(start_marker)
if start_idx == -1:
    print("Start marker not found")
    sys.exit(1)

# Find the end of the map function.
# It ends with '})}' and it is roughly after the bubbles.
# Let's find the '})}' after the 'Remove from orbit' block.
search_point = content.find('title="Remove from orbit"', start_idx)
end_idx = content.find('})}', search_point) + 3

if end_idx == -1:
    print("End marker not found")
    sys.exit(1)

new_full_content = content[:start_idx] + new_content_block + content[end_idx:]

with open(path, 'w') as f:
    f.write(new_full_content)

print("Patch applied successfully")
