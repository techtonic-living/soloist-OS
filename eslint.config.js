// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

/**
 * Soloist OS ESLint configuration
 *
 * Focuses on design system compliance and accessibility.
 */

import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import * as tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
	{
		ignores: [
			"**/node_modules/**",
			"**/dist/**",
			"**/build/**",
			"archive/**",
			"temp/**",
			"docs/**",
			".git/**",
		],
	},
	{
		files: ["ui-src/src/**/*.{js,jsx,ts,tsx}"],
		plugins: {
			"react-hooks": reactHooks,
		},
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 2021,
			sourceType: "module",
			parserOptions: {
				ecmaFeatures: { jsx: true },
				project: false, // Disable TS project mode to avoid conflicts
			},
			globals: {
				...globals.browser,
				...globals.es2021,
				React: "readonly",
				JSX: "readonly",
			},
		},
		rules: {
			...js.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,

			// The latest react-hooks plugin includes several React Compiler-focused rules.
			// They're great when you're actively targeting React Compiler constraints, but
			// they are too disruptive for this codebase right now (lots of legitimate
			// setState-in-effect and component factories).
			// Keep the classic hooks safety rules, but relax the compiler-centric ones.
			"react-hooks/immutability": "off",
			"react-hooks/preserve-manual-memoization": "off",
			"react-hooks/purity": "off",
			"react-hooks/set-state-in-effect": "off",
			"react-hooks/static-components": "off",

			// Catch common issues (warn, not error, for relaxed feedback)
			"no-unused-vars": [
				"warn",
				{
					// Ignore unused parameters in type definitions (interfaces, function signatures)
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					// Don't warn about unused params in TypeScript type/interface definitions
					args: "none",
				},
			],
			"no-empty-pattern": "warn",
			"no-console": ["warn", { allow: ["warn", "error"] }],
			// Disable developer-experience-only rules (not user-facing)
			complexity: "off",
			"max-depth": "off",
			"max-nested-callbacks": "off",
			"sonarjs/cognitive-complexity": "off",
		},
	}, // Exception: Interactive color picker components require inline styles for dynamic values
	// (computed positioning, gradients, and colors cannot be static Tailwind classes)
	{
		files: [
			"ui-src/src/components/lab/ColorCreator.tsx",
			"ui-src/src/components/lab/PaletteGenerator.tsx",
		],
		rules: {
			"no-inline-styles": "off",
		},
	},
	...storybook.configs["flat/recommended"],
];
