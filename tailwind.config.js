/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  future: {
    // Don't emit sticky hover styles on touch devices.
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        // Semantic aliases over the CSS variables in index.css.
        app: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
        },
        ink: {
          DEFAULT: 'var(--text-1)',
          2: 'var(--text-2)',
          3: 'var(--text-3)',
        },
        line: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          press: 'var(--accent-press)',
        },
        seg: {
          track: 'var(--seg-track)',
          thumb: 'var(--seg-thumb)',
        },
      },
    },
  },
  plugins: [],
}
