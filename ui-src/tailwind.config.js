/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				brand: ["Hubballi", "cursive"],
				sans: ["Inter", "system-ui", "sans-serif"],
				display: ["Satoshi", "Inter", "sans-serif"],
				mono: ["JetBrains Mono", "monospace"],
			},
			colors: {
				bg: {
					void: "#050505",
					surface: "#0F1115",
					raised: "#1A1D24",
				},
				glass: {
					subtle: "rgba(255, 255, 255, 0.02)",
					stroke: "rgba(255, 255, 255, 0.08)",
					highlight: "rgba(255, 255, 255, 0.15)",
				},
				primary: {
					DEFAULT: "#3D8BFF",
					dim: "#1c4e9e",
				},
				accent: {
					violet: "#9466FF",
					cyan: "#3FE3F2",
					error: "#FF453A",
					success: "#32D74B",
				},
			},
			boxShadow: {
				monolith:
					"0 -1px 0 0 rgba(255,255,255,0.08) inset, 0 20px 40px -10px rgba(0,0,0,0.8)",
				"monolith-hover":
					"0 -1px 0 0 rgba(255,255,255,0.2) inset, 0 30px 60px -12px rgba(0,0,0,0.9), 0 0 20px rgba(61, 139, 255, 0.1)",
				"neon-glow":
					"0 0 10px rgba(63, 227, 242, 0.3), 0 0 20px rgba(63, 227, 242, 0.1)",
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [],
};
