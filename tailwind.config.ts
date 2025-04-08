import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./screens/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
          "foreground-secondary": "var(--muted-foreground-secondary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        brand: {
          50: "var(--brand-50)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        scale: {
          "0%": { transform: "scale(0.7)" },
          "50%": { transform: "scale(1.0)" },
          "100%": { transform: "scale(0.85)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        scale: "scale 0.3s ease-in-out infinite",
      },
      fontSize: {
        "heading-1": [
          "60px",
          {
            lineHeight: "64px",
            fontWeight: "500",
            letterSpacing: "0px",
          },
        ],
        "heading-2": [
          "48px",
          {
            lineHeight: "56px",
            fontWeight: "500",
            letterSpacing: "0px",
          },
        ],
        "heading-3": [
          "40px",
          {
            lineHeight: "48px",
            fontWeight: "500",
            letterSpacing: "0px",
          },
        ],
        "heading-4": [
          "32px",
          {
            lineHeight: "40px",
            fontWeight: "500",
            letterSpacing: "0px",
          },
        ],
        "heading-5": [
          "24px",
          {
            lineHeight: "32px",
            fontWeight: "500",
            letterSpacing: "0px",
          },
        ],
        "heading-6": [
          "18px",
          {
            lineHeight: "24px",
            fontWeight: "500",
            letterSpacing: "0px",
          },
        ],
        "body-large": [
          "18px",
          {
            lineHeight: "28px",
            fontWeight: "400",
            letterSpacing: "0px",
          },
        ],
        "body-medium": [
          "16px",
          {
            lineHeight: "24px",
            fontWeight: "400",
            letterSpacing: "0px",
          },
        ],
        "body-small": [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "400",
            letterSpacing: "0px",
          },
        ],
        "body-xsmall": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "400",
            letterSpacing: "0px",
          },
        ],
        "label-large": [
          "18px",
          {
            lineHeight: "28px",
            fontWeight: "500",
            letterSpacing: "0px",
          },
        ],
        "label-medium": [
          "16px",
          {
            lineHeight: "24px",
            fontWeight: "500",
            letterSpacing: "0px",
          },
        ],
        "label-small": [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "500",
            letterSpacing: "0px",
          },
        ],
        "label-xsmall": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "500",
            letterSpacing: "0px",
          },
        ],
        "label-2xsmall": [
          "10px",
          {
            lineHeight: "12px",
            fontWeight: "500",
            letterSpacing: "0px",
          },
        ],
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
