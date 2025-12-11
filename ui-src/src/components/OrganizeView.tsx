import { useState } from "react";
import { Folder, Plus, Trash, Layers } from "lucide-react";
import { useSoloist } from "../context/SoloistContext";

export const OrganizeView = () => {
	const { settings, updateSettings } = useSoloist();
	const [selectedCollectionId, setSelectedCollectionId] = useState<
		string | null
	>(null);

	const library = settings?.library || {
		colors: [],
		palettes: [],
		collections: [],
		projects: [],
	};
	const collections = library.collections || [];

	// --- Actions ---

	const createCollection = () => {
		const name = prompt("Enter collection name:", "New Collection");
		if (!name) return;

		const newCollection = {
			id: crypto.randomUUID(),
			name,
			items: [],
		};

		updateSettings({
			library: {
				...library,
				collections: [...collections, newCollection],
			},
		});
	};

	const deleteCollection = (id: string) => {
		if (!confirm("Are you sure?")) return;
		const newCollections = collections.filter((c: any) => c.id !== id);
		updateSettings({
			library: { ...library, collections: newCollections },
		});
		if (selectedCollectionId === id) setSelectedCollectionId(null);
	};

	const addItemToCollection = (collectionId: string, item: any) => {
		const collectionIndex = collections.findIndex(
			(c: any) => c.id === collectionId
		);
		if (collectionIndex === -1) return;

		const updatedCollection = {
			...collections[collectionIndex],
			items: [...collections[collectionIndex].items, item],
		};

		const newCollections = [...collections];
		newCollections[collectionIndex] = updatedCollection;

		updateSettings({
			library: { ...library, collections: newCollections },
		});
	};

	const removeItemFromCollection = (
		collectionId: string,
		itemIndex: number
	) => {
		const collectionIndex = collections.findIndex(
			(c: any) => c.id === collectionId
		);
		if (collectionIndex === -1) return;

		const updatedItems = [...collections[collectionIndex].items];
		updatedItems.splice(itemIndex, 1);

		const updatedCollection = {
			...collections[collectionIndex],
			items: updatedItems,
		};

		const newCollections = [...collections];
		newCollections[collectionIndex] = updatedCollection;

		updateSettings({
			library: { ...library, collections: newCollections },
		});
	};

	// --- Render Helpers ---

	const renderFavorites = () => (
		<div className="flex-1 overflow-y-auto p-4 border-r border-glass-stroke">
			<h3 className="text-xs font-mono text-gray-500 uppercase mb-4 tracking-widest">
				Global Favorites
			</h3>

			{/* Colors */}
			<div className="mb-6">
				<h4 className="text-xs text-white mb-2">Colors</h4>
				<div className="grid grid-cols-4 gap-2">
					{library.colors.map((colorItem) => {
						const hexValue =
							typeof colorItem === "string"
								? colorItem
								: colorItem.value;
						return (
							<div
								key={hexValue}
								className="w-full aspect-square rounded-md cursor-pointer hover:scale-105 transition-transform border border-white/10"
								style={{ backgroundColor: hexValue }}
								onClick={() =>
									selectedCollectionId &&
									addItemToCollection(selectedCollectionId, {
										type: "color",
										value: hexValue,
									})
								}
								title={
									selectedCollectionId
										? "Click to add to selected collection"
										: "Select a collection to add"
								}
							/>
						);
					})}
					{library.colors.length === 0 && (
						<span className="text-gray-600 text-xs italic col-span-4">
							No favorites yet.
						</span>
					)}
				</div>
			</div>

			{/* Palettes */}
			<div>
				<h4 className="text-xs text-white mb-2">Palettes</h4>
				<div className="space-y-2">
					{library.palettes.map((p: any, i: number) => (
						<div
							key={i}
							className="p-2 bg-bg-raised rounded-lg border border-glass-stroke cursor-pointer hover:border-accent-cyan/50 transition-colors"
							onClick={() =>
								selectedCollectionId &&
								addItemToCollection(selectedCollectionId, {
									type: "palette",
									value: p,
								})
							}
						>
							<div className="text-[10px] text-gray-400 mb-1">
								{p.name}
							</div>
							<div className="flex h-4 rounded overflow-hidden">
								{p.colors.map((c: string, ci: number) => (
									<div
										key={ci}
										className="flex-1 h-full"
										style={{ backgroundColor: c }}
									/>
								))}
							</div>
						</div>
					))}
					{library.palettes.length === 0 && (
						<span className="text-gray-600 text-xs italic">
							No saved palettes.
						</span>
					)}
				</div>
			</div>

			{!selectedCollectionId && (
				<div className="mt-8 p-3 bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg text-accent-yellow text-xs">
					Select a collection on the right to add items.
				</div>
			)}
		</div>
	);

	const renderCollectionsList = () => (
		<div className="w-64 border-r border-glass-stroke overflow-y-auto p-2 bg-bg-void/20">
			<div className="flex items-center justify-between p-2 mb-2">
				<span className="text-xs font-bold text-gray-400 uppercase">
					Collections
				</span>
				<button
					onClick={createCollection}
					className="text-accent-cyan hover:bg-accent-cyan/10 p-1 rounded"
				>
					<Plus size={14} />
				</button>
			</div>

			<div className="space-y-1">
				{collections.map((c: any) => (
					<div
						key={c.id}
						onClick={() => setSelectedCollectionId(c.id)}
						className={`flex items-center justify-between p-2 rounded-md cursor-pointer group ${
							selectedCollectionId === c.id
								? "bg-accent-cyan/10 text-white"
								: "text-gray-400 hover:text-white hover:bg-white/5"
						}`}
					>
						<div className="flex items-center gap-2 overflow-hidden">
							<Folder
								size={14}
								className={
									selectedCollectionId === c.id
										? "text-accent-cyan fill-current"
										: ""
								}
							/>
							<span className="text-sm truncate">{c.name}</span>
						</div>
						<button
							onClick={(e) => {
								e.stopPropagation();
								deleteCollection(c.id);
							}}
							className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
						>
							<Trash size={12} />
						</button>
					</div>
				))}
				{collections.length === 0 && (
					<div className="text-center p-4 text-gray-600 text-xs italic">
						No collections. Create one to start organizing.
					</div>
				)}
			</div>
		</div>
	);

	const renderActiveCollection = () => {
		if (!selectedCollectionId)
			return (
				<div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-2">
					<Layers size={32} className="opacity-20" />
					<span>Select a collection to view contents</span>
				</div>
			);

		const collection = collections.find(
			(c: any) => c.id === selectedCollectionId
		);
		if (!collection) return null;

		return (
			<div className="flex-1 p-6 overflow-y-auto bg-bg-surface/30">
				<header className="mb-6 flex items-center justify-between border-b border-glass-stroke pb-4">
					<h2 className="text-2xl font-brand text-white">
						{collection.name}
					</h2>
					<span className="text-xs text-gray-400 font-mono">
						{collection.items.length} items
					</span>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{collection.items.map((item: any, idx: number) => (
						<div
							key={idx}
							className="bg-bg-raised border border-glass-stroke rounded-xl p-3 relative group"
						>
							<button
								onClick={() =>
									removeItemFromCollection(collection.id, idx)
								}
								className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded-full backdrop-blur-sm z-10"
							>
								<Trash size={12} />
							</button>

							{item.type === "color" && (
								<div className="space-y-2">
									<div
										className="w-full h-24 rounded-lg"
										style={{ backgroundColor: item.value }}
									/>
									<div className="text-xs font-mono text-gray-400 uppercase">
										{item.value}
									</div>
								</div>
							)}

							{item.type === "palette" && (
								<div className="space-y-2">
									<div className="flex h-24 rounded-lg overflow-hidden">
										{item.value.colors.map(
											(c: string, i: number) => (
												<div
													key={i}
													className="flex-1 h-full"
													style={{
														backgroundColor: c,
													}}
												/>
											)
										)}
									</div>
									<div className="text-xs font-mono text-gray-400">
										{item.value.name}
									</div>
								</div>
							)}
						</div>
					))}
					{collection.items.length === 0 && (
						<div className="col-span-full py-12 text-center text-gray-500 text-sm border-2 border-dashed border-glass-stroke rounded-xl">
							Collection is empty. Add items from the favorites
							panel on the left.
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="h-full flex flex-col overflow-hidden">
			<header className="p-6 border-b border-glass-stroke bg-bg-void/50 backdrop-blur-sm">
				<h1 className="text-3xl font-brand text-white tracking-wide">
					Organize
				</h1>
				<p className="text-gray-400 text-sm">
					Curate your findings into Collections and Projects.
				</p>
			</header>

			<div className="flex-1 flex overflow-hidden">
				{/* Left: Favorites Source */}
				<div className="w-64 border-r border-glass-stroke flex flex-col bg-bg-void/30">
					<div className="p-3 border-b border-glass-stroke bg-bg-raised/50">
						<span className="text-xs font-bold text-gray-300 uppercase">
							Step 1: Source Material
						</span>
					</div>
					{renderFavorites()}
				</div>

				{/* Middle: Collection List */}
				{renderCollectionsList()}

				{/* Right: Active Collection Content */}
				{renderActiveCollection()}
			</div>
		</div>
	);
};
