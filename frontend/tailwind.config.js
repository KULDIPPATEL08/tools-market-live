/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#06090F',
          900: '#090D16',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
        },
        intel: {
          cyan: '#38BDF8',
          blue: '#2563EB',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'antigravity': '0 12px 32px -4px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(56, 189, 248, 0.08)',
        'antigravity-hover': '0 20px 40px -6px rgba(0, 0, 0, 0.55), 0 8px 20px -3px rgba(56, 189, 248, 0.16)',
        'glass-rim': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
