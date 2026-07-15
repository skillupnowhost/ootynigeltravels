import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#071f18",
          900: "#0b3b2e",
          800: "#123f31",
          700: "#1b5744",
          600: "#24705a",
          500: "#2f8a6e",
          400: "#64a892",
          300: "#9ac5b6",
          200: "#cfe3da",
          100: "#e4eee9",
          50: "#f3f8f5",
        },
        gold: {
          900: "#6e5220",
          800: "#8a672a",
          700: "#a67c34",
          600: "#c8a15c",
          500: "#d2b174",
          400: "#dcc08b",
          300: "#e6d1a8",
          200: "#efe1c4",
          100: "#f5ecd8",
          50: "#fbf6ec",
        },
        ivory: {
          200: "#f0e9da",
          100: "#f5f0e6",
          50: "#fbf8f2",
        },
        charcoal: {
          900: "#17181a",
          700: "#2c2d2b",
          600: "#43433d",
          500: "#59584f",
          400: "#7c7b6d",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-1.2deg)" },
          "50%": { transform: "rotate(1.2deg)" },
        },
        "drift-slow": {
          "0%": { transform: "translateX(-8%)" },
          "100%": { transform: "translateX(8%)" },
        },
        "mist-drift": {
          "0%": { transform: "translateX(-6%) translateY(0)", opacity: "0.35" },
          "50%": { opacity: "0.55" },
          "100%": { transform: "translateX(6%) translateY(-3%)", opacity: "0.35" },
        },
        "road-dash": {
          "0%": { backgroundPositionX: "0" },
          "100%": { backgroundPositionX: "-160px" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-3px) rotate(0.4deg)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        shimmer: {
          "0%": { backgroundPositionX: "-200%" },
          "100%": { backgroundPositionX: "200%" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.06)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "cloud-drift": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "rain-fall": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "-60px 220px" },
        },
        "drive-loop": {
          "0%": { left: "-15%" },
          "100%": { left: "115%" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        sway: "sway 5s ease-in-out infinite",
        "sway-slow": "sway 8s ease-in-out infinite",
        "drift-slow": "drift-slow 22s ease-in-out infinite alternate",
        "mist-drift": "mist-drift 14s ease-in-out infinite alternate",
        "road-dash": "road-dash 0.9s linear infinite",
        bob: "bob 3.4s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.2s ease-in-out infinite",
        shimmer: "shimmer 2.6s linear infinite",
        "spin-slow": "spin-slow 14s linear infinite",
        wiggle: "wiggle 0.5s ease-in-out",
        "pop-in": "pop-in 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "cloud-drift": "cloud-drift 60s linear infinite",
        "rain-fall": "rain-fall 0.45s linear infinite",
        "drive-loop": "drive-loop 13s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
