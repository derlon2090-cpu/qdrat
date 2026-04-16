import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "2.25rem",
      },
      boxShadow: {
        soft: "0 24px 60px rgba(16, 24, 47, 0.08)",
        luxe: "0 34px 90px rgba(16, 24, 47, 0.18)",
      },
      backgroundImage: {
        "miyaar-grid":
          "linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
        "miyaar-hero":
          "radial-gradient(circle at top right, rgba(117, 104, 255, 0.14), transparent 24%), radial-gradient(circle at 20% 10%, rgba(210, 168, 90, 0.13), transparent 20%), linear-gradient(180deg, #f7f7fb 0%, #fbfbfe 34%, #f2f4f9 100%)",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        sans: ["var(--font-body)"],
        display: ["var(--font-heading)"],
      },
    },
  },
  plugins: [],
};

export default config;
