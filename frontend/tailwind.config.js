/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070D1E',
          900: '#0B1528',
          850: '#101F38',
          800: '#162847',
          700: '#1E3A5F',
          600: '#2A4E7F',
          500: '#3B66A3',
        },
        gold: {
          50: '#FFFDF5',
          100: '#FEF9E7',
          200: '#FDF0C5',
          300: '#FCE39E',
          400: '#F5A623',
          500: '#D4AF37',
          600: '#C59B27',
          700: '#A67C1E',
          800: '#7E5B14',
          900: '#4D360B',
        },
      },
      boxShadow: {
        'gold-glow': '0 0 15px -3px rgba(245, 166, 35, 0.25)',
        'navy-card': '0 4px 20px -2px rgba(7, 13, 30, 0.7)',
      }
    },
  },
  plugins: [],
}
