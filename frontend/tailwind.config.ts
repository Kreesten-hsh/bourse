import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container": "var(--surface-container)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        "surface-dim": "var(--surface-dim)",
        "surface-variant": "var(--surface-variant)",
        "surface-bright": "var(--surface-bright)",
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        secondary: "var(--secondary)",
        primary: "var(--primary)",
        "primary-container": "var(--primary-container)",
        "on-primary": "var(--on-primary)",
        "on-primary-container": "var(--on-primary-container)",
        "inverse-primary": "var(--inverse-primary)",
        "surface-tint": "var(--surface-tint)",
        outline: "var(--outline)",
        "outline-variant": "var(--outline-variant)",
        "border-card": "var(--border-card)",
        error: "var(--error)",
        "error-container": "var(--error-container)",
        "on-error": "var(--on-error)",
        "on-error-container": "var(--on-error-container)",
        success: "var(--success)",
        "success-container": "var(--success-container)",
        warning: "var(--warning)",
        "warning-container": "var(--warning-container)",
        "chip-bg": "var(--chip-bg)"
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-card)",
        md: "var(--radius-panel)",
        full: "var(--radius-full)"
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        panel: "var(--shadow-panel)",
        focus: "var(--shadow-focus)"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"]
      },
      fontSize: {
        "display-lg": ["48px", { fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "56px" }],
        "headline-lg": ["32px", { fontWeight: "600", letterSpacing: "-0.01em", lineHeight: "40px" }],
        "headline-lg-mobile": ["28px", { fontWeight: "600", lineHeight: "36px" }],
        "headline-md": ["24px", { fontWeight: "600", lineHeight: "32px" }],
        "body-lg": ["18px", { fontWeight: "400", lineHeight: "28px" }],
        "body-md": ["16px", { fontWeight: "400", lineHeight: "24px" }],
        "label-md": ["14px", { fontWeight: "500", letterSpacing: "0.02em", lineHeight: "20px" }],
        "label-sm": ["12px", { fontWeight: "600", letterSpacing: "0.05em", lineHeight: "16px" }]
      },
      maxWidth: {
        "container-max": "1280px"
      },
      spacing: {
        "margin-mobile": "20px",
        "margin-desktop": "64px",
        gutter: "24px"
      }
    }
  },
  plugins: []
};

export default config;
