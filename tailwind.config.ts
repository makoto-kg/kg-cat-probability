import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chalkboard: {
          dark: "#0d221c",
          DEFAULT: "#15332b",
          light: "#1e443a",
          border: "#29584c",
        },
        chalk: {
          white: "#f8fafc",
          yellow: "#fef08a",
          pink: "#fbcfe8",
          blue: "#bae6fd",
          green: "#bbf7d0",
          orange: "#fed7aa",
        },
        wood: {
          dark: "#451a03",
          DEFAULT: "#78350f",
          light: "#92400e",
          accent: "#b45309",
        },
        amberGold: "#f59e0b",
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-jp)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
