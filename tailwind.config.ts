import type { Config } from "tailwindcss";
import { heroui } from "@heroui/theme";
import defaultTheme from "tailwindcss/defaultTheme";

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
    require("@tailwindcss/typography"),
    heroui({
      addCommonColors: false, // override common colors (e.g. "blue", "green", "pink").
      defaultTheme: "light", // default theme from the themes object
      defaultExtendTheme: "light", // default theme to extend on custom themes
      themes: {
        light: {
          colors: {
            background: "#E4E4E7",
            foreground: "#11181C",
            primary: {
              "50": "#dfedfd",
              "100": "#b3d4fa",
              "200": "#86bbf7",
              "300": "#59a1f4",
              "400": "#2d88f1",
              "500": "#006fee",
              "600": "#005cc4",
              "700": "#00489b",
              "800": "#003571",
              "900": "#002147",
              foreground: "#fff",
              DEFAULT: "#006fee",
            },
            focus: "#006FEE",
            overlay: "#000000",
          },
        },

        dark: {
          extend: "dark", // <- inherit default values from dark theme
          colors: {
            background: "#0F172A",
            foreground: "#ffffff",
            primary: {
              "50": "#dfedfd",
              "100": "#b3d4fa",
              "200": "#86bbf7",
              "300": "#59a1f4",
              "400": "#2d88f1",
              "500": "#006fee",
              "600": "#005cc4",
              "700": "#00489b",
              "800": "#003571",
              "900": "#002147",
              foreground: "#fff",
              DEFAULT: "#006fee",
            },
            focus: "#006FEE",
          },
        },
      },
    }),
  ],
};
export default config;
