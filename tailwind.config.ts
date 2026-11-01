import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        mehfil: {
          50: '#fdf4f5',
          100: '#fbe8ea',
          200: '#f7d5d8',
          300: '#f0b3b9',
          400: '#e5838d',
          500: '#d75664',
          600: '#c23b4a',
          700: '#a32b39',
          800: '#872733',
          900: '#72252f',
          950: '#400f16',
        },
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
} satisfies Config;
