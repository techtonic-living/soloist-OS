import { useState, useEffect } from "react";
import { PresetColor } from "../data/colorPresets";

export type StorageType = "local" | "github" | "cloud";
export type VisualFidelity = "performance" | "high";
export type AILevel = "silent" | "guide" | "teacher";

interface UserProfile {
	displayName: string;
	role: string;
	bio: string;
	avatarUrl?: string;
}

export interface CollectionItem {
	type: "color" | "palette";
	value: any;
}

export interface Collection {
	id: string;
	name: string;
	items: CollectionItem[];
}

export interface Project {
	id: string;
	name: string;
	collectionIds: string[];
}

export interface UserLibrary {
	colors: (string | PresetColor)[]; // Hex codes or full PresetColor objects
	fonts: string[]; // Font family names
	palettes: { name: string; colors: string[] }[];
	collections: Collection[];
	colorCache?: PresetColor[]; // AI-generated metadata cache for reuse
	projects: Project[];
}

export interface SystemSettings {
	storageType: StorageType;
	visualFidelity: VisualFidelity;
	aiLevel: AILevel;
	userProfile: UserProfile;
	library: UserLibrary;
}

const DEFAULT_SETTINGS: SystemSettings = {
	storageType: "local",
	visualFidelity: "high",
	aiLevel: "guide",
	userProfile: {
		displayName: "Soloist User",
		role: "Designer",
		bio: "Crafting digital experiences.",
	},
	library: {
		colors: [],
		fonts: [],
		palettes: [],
		collections: [],
		projects: [],
	},
};

export const useSoloistSystem = () => {
	const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
	// We'll treat generic data as a simple key-value store in React state for now
	// to allow reactive updates.
	const [dataStore, setDataStore] = useState<Record<string, any>>({});

	useEffect(() => {
		// Listen for messages from the plugin backend
		const handleMessage = (event: MessageEvent) => {
			const { type, payload } = event.data.pluginMessage || {};
			if (type === "storage-loaded") {
				const { key, data } = payload;
				if (key === "soloist-settings" && data) {
					setSettings(data);
				} else if (key.startsWith("soloist-data-")) {
					const dataKey = key.replace("soloist-data-", "");
					setDataStore((prev) => ({ ...prev, [dataKey]: data }));
				}
			}
		};

		window.addEventListener("message", handleMessage);

		// Initial load requests
		parent.postMessage(
			{
				pluginMessage: {
					type: "load-storage",
					payload: { key: "soloist-settings" },
				},
			},
			"*"
		);
		parent.postMessage(
			{
				pluginMessage: {
					type: "load-storage",
					payload: { key: "soloist-data-kb-entries" },
				},
			},
			"*"
		);

		return () => window.removeEventListener("message", handleMessage);
	}, []);

	return {
		settings,
		updateSettings: (newSettings: Partial<SystemSettings>) => {
			const updated = { ...settings, ...newSettings };
			setSettings(updated);
			parent.postMessage(
				{
					pluginMessage: {
						type: "save-storage",
						payload: { key: "soloist-settings", data: updated },
					},
				},
				"*"
			);
		},
		updateData: (key: string, data: any) => {
			setDataStore((prev) => ({ ...prev, [key]: data }));
			parent.postMessage(
				{
					pluginMessage: {
						type: "save-storage",
						payload: { key: `soloist-data-${key}`, data },
					},
				},
				"*"
			);
		},
		// Reactive data access
		dataStore,
	};
};
