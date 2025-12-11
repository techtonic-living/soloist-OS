export interface SemanticToken {
	name: string;
	description: string;
	values: {
		light: string; // references primitive name e.g., "blue-500"
		dark: string;
	};
}

export const DEFAULT_SEMANTICS: SemanticToken[] = [
	{
		name: "bg-surface",
		description: "Default page background",
		values: { light: "neutral-50", dark: "neutral-950" },
	},
	{
		name: "bg-surface-raised",
		description: "Cards and elevated elements",
		values: { light: "neutral-0", dark: "neutral-900" },
	},
	{
		name: "text-primary",
		description: "High contrast text",
		values: { light: "neutral-950", dark: "neutral-50" },
	},
	{
		name: "text-secondary",
		description: "Lower contrast text",
		values: { light: "neutral-600", dark: "neutral-400" },
	},
	{
		name: "action-primary",
		description: "Primary interactive elements",
		values: { light: "primary-600", dark: "primary-500" },
	},
	{
		name: "border-subtle",
		description: "Dividers and borders",
		values: { light: "neutral-200", dark: "neutral-800" },
	},
];
