import { Trash } from "lucide-react";

export const TypeLibrary = ({ library, onRemoveFont }: any) => {
	return (
		<div className="h-full overflow-y-auto pr-2 pb-20">
			<div className="space-y-12">
				{/* Font Pairings */}
				<div className="space-y-4">
					<h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest border-b border-glass-stroke pb-2">
						Saved Type Pairings
					</h3>
					{library.fonts.length === 0 ? (
						<p className="text-gray-600 text-xs italic">
							No saved pairings.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{library.fonts.map((f: string) => {
								const [header, body] = f.split(":");
								return (
									<div
										key={f}
										className="bg-white p-4 rounded-xl text-black relative group border border-transparent hover:border-accent-cyan/50 transition-all"
									>
										<button
											onClick={() => onRemoveFont(f)}
											className="absolute top-2 right-2 text-gray-300 hover:text-red-500"
										>
											<Trash size={12} />
										</button>
										<h4
											className="text-xl mb-1 truncate"
											style={{ fontFamily: header }}
										>
											{header}
										</h4>
										<p
											className="text-sm opacity-60 truncate"
											style={{ fontFamily: body }}
										>
											{body}
										</p>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
