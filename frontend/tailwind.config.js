/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fatima: {
          ivory: '#FBF6EE',
          sand: '#EFE2CB',
          gold: '#B8863B',
          bronze: '#8C5A2B',
          ink: '#2B2318',
          wine: '#6E1E2B',
          'wine-dark': '#4A1420',
          'wine-light': '#8C2E3D',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Inter', 'system-ui',
          'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(43,35,24,0.04), 0 4px 16px rgba(43,35,24,0.06)',
        panel: '-8px 0 32px rgba(43,35,24,0.12)',
      },
    },
  },
  plugins: [],
};
