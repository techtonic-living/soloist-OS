/**
 * Soloist OS ESLint configuration
 *
 * Focuses on design system compliance and accessibility.
 */

import js from "@eslint/js";
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
    },
  },
  // Exception: Interactive color picker components require inline styles for dynamic values
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
];
