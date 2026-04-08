import type { Config } from "tailwindcss";
import { markketTailwindColors } from './markket/colors.tokens.mjs';

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ...markketTailwindColors,
      },
    },
  },
  plugins: [],
} satisfies Config;
