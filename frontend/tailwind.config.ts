import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        royal: "var(--royal)",
        "royal-hover": "var(--royal-hover)",
        "royal-active": "var(--royal-active)",
        "royal-light": "var(--royal-light)",
        "royal-pale": "var(--royal-pale)",
        "royal-mid": "var(--royal-mid)",
        pink: "var(--pink)",
        ink: "var(--ink)",
        "ink-60": "var(--ink-60)",
        "ink-30": "var(--ink-30)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",
        success: "var(--success)",
        "success-bg": "var(--success-bg)",
        warning: "var(--warning)",
        "warning-bg": "var(--warning-bg)",
        danger: "var(--danger)",
        "danger-bg": "var(--danger-bg)"
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)"
      },
      boxShadow: {
        focus: "var(--shadow-focus)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)"
      }
    }
  },
  plugins: []
};

export default config;
