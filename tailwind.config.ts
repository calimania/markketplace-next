import type { Config } from "tailwindcss";

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
        markket: {
          yellow: "#FFD700",
          blue: "#0000FF",
          pink: "#FFC0CB",
          cyan: "#00FFFF",
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
