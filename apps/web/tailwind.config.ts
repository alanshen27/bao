import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bao: {
          bg: "var(--bao-bg)",
          card: "var(--bao-card)",
          "card-soft": "var(--bao-card-soft)",
          border: "var(--bao-border)",
          text: "var(--bao-text)",
          muted: "var(--bao-muted)",
          bamboo: "var(--bao-bamboo)",
          soy: "var(--bao-soy)",
          scallion: "var(--bao-scallion)",
          chili: "var(--bao-chili)",
          sesame: "var(--bao-sesame)",
          success: "var(--bao-success)",
          warning: "var(--bao-warning)",
          danger: "var(--bao-danger)",
          ring: "var(--bao-ring)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Fraunces", "Calistoga", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        bao: "0 10px 30px rgba(90, 56, 37, 0.08)",
        "bao-lg": "0 18px 44px rgba(90, 56, 37, 0.14)",
        "bao-chili": "0 10px 24px rgba(229, 106, 58, 0.28)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "soft-pulse": "soft-pulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
