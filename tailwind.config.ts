import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#E1F5EE",
          100: "#9FE1CB",
          200: "#5DCAA5",
          500: "#1D9E75",
          700: "#0F6E56",
          900: "#04342C",
        },
        cream: {
          50:  "#FFFCF4", // superficies (tarjetas, navbar) — blanco cálido
          100: "#F7F0E1", // fondo de página — crema visible
          200: "#EDE3CE", // inputs / hover / bordes suaves
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "sans-serif"],
        display: ["var(--font-nunito)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
