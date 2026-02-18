import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
        appDark: "#01060c",
        white: "#FFFFFF",
        black: "#000000",
        steem: "#07d7aacb",
        muted: "hsl(var(--heroui-default-600))",
        card: "hsl(var(--heroui-content1))",
        border: "hsl(var(--heroui-default-200))",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
    },
    screens: {
      "1xl": "1400px",
      "1lg": "1100px",
      "2lg": "1200px",
      "1md": "920px",
      "2md": "980px",
      xs: "350px",
      "1xs": "450px",

      ...defaultTheme.screens,
    },
  },
  darkMode: "class",
  plugins: [require("tailwind-scrollbar")],
};
export default config;
