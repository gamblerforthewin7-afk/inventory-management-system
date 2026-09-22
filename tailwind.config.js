/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          base: '#09090B',
          card: '#121215',
          panel: '#18181B',
          border: '#27272A',
          hover: '#27272A',
          muted: '#3F3F46',
        },
        red: {
          accent: '#DC2626',
          hover: '#B91C1C',
          bright: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.15)',
          muted: 'rgba(220, 38, 38, 0.10)',
          dark: '#7F1D1D',
          light: '#FCA5A5',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          muted: '#71717A',
        }
      },
      boxShadow: {
        'red-glow': '0 0 20px -3px rgba(220, 38, 38, 0.35)',
        'red-border': '0 0 0 1px rgba(220, 38, 38, 0.5)',
        'dark-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
