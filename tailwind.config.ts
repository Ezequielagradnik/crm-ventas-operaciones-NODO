import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0D14",
        surface: "#16162A",
        border: "#333345",
        primary: {
          DEFAULT: "#6C63FF",
          hover: "#7A72FF",
          light: "#8B84FF",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#9999AA",
          muted: "#666680",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#F87171",
        info: "#06B6D4",
      },
      fontFamily: {
        sans: ["var(--font-satoshi)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(108, 99, 255, 0.15)",
        "glow-sm": "0 0 10px rgba(108, 99, 255, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
