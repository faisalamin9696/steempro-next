import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const defaultTheme = require("tailwindcss/defaultTheme");

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        "full-minus-64": "calc(100vh - 64px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        appDark: "#09090b",
        white: "#FFFFFF",
        black: "#000000",
      },
    },
    screens: {
      "1lg": "1100px",
      "2lg": "1200px",
      "1md": "920px",
      "2md": "980px",
      xs: "350px",
      ...defaultTheme.screens,
    },
  },
  darkMode: "class",
  plugins: [
    require("tailwind-scrollbar"),
    require("daisyui"),
    require("@tailwindcss/typography"),
    heroui({
      themes: {
        light: {
          colors: {
            background: "#E4E4E7",
            foreground: "#11181C",
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#006FEE",
            },
          },
        },

        dark: {
          extend: "dark", // <- inherit default values from dark theme
          colors: {
            background: "#0F172A",
            foreground: "#ffffff",
            primary: {
              50: "#FAFAFA",
              100: "#F4F4F5",
              200: "#E4E4E7",
              300: "#D4D4D8",
              400: "#A1A1AA",
              500: "#71717A",
              // 600: "#52525B",
              700: "#3F3F46",
              800: "#27272A",
              900: "#18181B",
              // DEFAULT: "#09090b",
              // foreground: "#ffffff",
            },
            focus: "#F182F6",
          },
        },
      },
    }),
  ],
};
export default config;
