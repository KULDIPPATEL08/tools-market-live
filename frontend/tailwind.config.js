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
        surface: {
          0: '#09090B', // Root canvas (Zinc 950)
          1: '#121215', // Sidebar, elevated panels
          2: '#18181B', // Cards, inputs, table rows
          3: '#222227', // Hover states, dropdowns
        },
        border: {
          subtle: '#27272A', // Primary 1px divider
          strong: '#3F3F46', // Highlighted or focused border
          active: '#52525B',
        },
        accent: {
          DEFAULT: '#6366F1', // Refined Linear Indigo
          hover: '#4F46E5',
          subtle: 'rgba(99, 102, 241, 0.1)',
        },
        signal: {
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
          sky: '#38BDF8',
          zinc: '#71717A',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'Fira Code',
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'monospace'
        ],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'panel': '0 4px 12px 0 rgba(0, 0, 0, 0.3)',
        'popover': '0 8px 24px -4px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
