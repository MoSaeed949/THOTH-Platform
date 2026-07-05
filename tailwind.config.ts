import type { Config } from "tailwindcss";

// Every color below resolves through a CSS custom property (defined per
// theme in app/globals.css), so the same class names (bg-obsidian,
// text-gold, etc.) automatically repaint when [data-theme] flips between
// "dark" and "light". The rgb(var(...) / <alpha-value>) pattern preserves
// Tailwind's opacity modifiers (e.g. bg-gold/10).
function themed(name: string) {
  return `rgb(var(${name}) / <alpha-value>)`;
}

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: themed("--c-obsidian"),
          soft: themed("--c-obsidian-soft"),
          softer: themed("--c-obsidian-softer"),
          line: themed("--c-obsidian-line"),
        },
        gold: {
          DEFAULT: themed("--c-gold"),
          soft: themed("--c-gold-soft"),
          deep: themed("--c-gold-deep"),
          dim: themed("--c-gold-dim"),
        },
        lapis: {
          DEFAULT: themed("--c-lapis"),
          soft: themed("--c-lapis-soft"),
          deep: themed("--c-lapis-deep"),
        },
        papyrus: themed("--c-papyrus"),
        carnelian: themed("--c-carnelian"),
        dusty: themed("--c-dusty"),
        fail: themed("--c-fail"),
        // Fixed dark ink used for text sitting on gold/light-colored
        // buttons — stays dark in BOTH themes (unlike `obsidian`, which is
        // the page background and flips light/dark).
        ink: "#14100A",
        // Color of the decorative vertical embroidery motif — gold in
        // dark mode, black in light mode.
        embroidery: themed("--c-embroidery"),
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jbmono)", "monospace"],
      },
      boxShadow: {
        ring: "0 0 0 1px rgb(var(--c-gold) / 0.2)",
        gold: "0 0 24px rgb(var(--c-gold) / 0.25)",
      },
      keyframes: {
        dash: {
          "0%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
