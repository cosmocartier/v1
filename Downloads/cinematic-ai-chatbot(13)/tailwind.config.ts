import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px", // Custom max width
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Neo-brutalist accent colors
        "neo-accent": "hsl(var(--neo-accent))",
        "neo-warning": "hsl(var(--neo-warning))",
        "neo-success": "hsl(var(--neo-success))",
        "neo-error": "hsl(var(--neo-error))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      spacing: {
        // Consistent vertical rhythm
        "rhythm-xs": "0.5rem", // 8px
        "rhythm-sm": "1rem", // 16px
        "rhythm-md": "1.5rem", // 24px
        "rhythm-lg": "2rem", // 32px
        "rhythm-xl": "3rem", // 48px
      },
      fontSize: {
        // Neo-brutalist type scale
        "neo-xs": ["0.6875rem", { lineHeight: "1", letterSpacing: "0.01em" }], // 11px
        "neo-sm": ["0.8125rem", { lineHeight: "1.2", letterSpacing: "0" }], // 13px
        "neo-base": ["0.875rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }], // 14px
        "neo-lg": ["1rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }], // 16px
        "neo-xl": ["1.125rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }], // 18px
        "neo-2xl": ["1.375rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }], // 22px
        "neo-3xl": ["1.75rem", { lineHeight: "1", letterSpacing: "-0.03em" }], // 28px
      },
      keyframes: {
        // Minimal, sharp animations
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(4px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.98)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.1s ease-out forwards",
        "slide-up": "slide-up 0.15s ease-out forwards",
        "scale-in": "scale-in 0.1s ease-out forwards",
      },
      boxShadow: {
        // Minimal shadows for depth
        "neo-sm": "0 1px 0 0 hsl(var(--border))",
        "neo-md": "0 2px 0 0 hsl(var(--border))",
        "neo-lg": "0 4px 0 0 hsl(var(--border))",
      },
      backdropBlur: {
        neo: "1px",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom plugin for neo-brutalist utilities
    ({ addUtilities }: any) => {
      const newUtilities = {
        ".neo-focus": {
          "&:focus-visible": {
            outline: "1px solid hsl(var(--foreground))",
            outlineOffset: "1px",
          },
        },
        ".neo-border": {
          border: "1px solid hsl(var(--border))",
        },
        ".neo-divide-y > * + *": {
          borderTop: "1px solid hsl(var(--border))",
        },
        ".tabular-nums": {
          fontVariantNumeric: "tabular-nums",
        },
      }
      addUtilities(newUtilities)
    },
  ],
} satisfies Config

export default config
