import type { Config } from "tailwindcss";
import * as tailwindcssAnimate from "tailwindcss-animate"

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: ["tailwindcssAnimate"],
};

export default config;
