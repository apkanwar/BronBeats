/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx,mdx}',
    './pages/**/*.{ts,tsx,js,jsx,mdx}',
    './app/**/*.{ts,tsx,js,jsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        darkMode: '#252525',
        midnight: '#1B1C1E',
        arcticBlue: '#F0F8FF',
        breezy: {
          25: '#00c1ff80',
          50: '#00c1ff80',
          75: '#00c1ffbf',
          90: '#00c1ffe6',
          100: '#0099FF',
          faded: '#29B6F6',
          gray: '#888888'
        },
        superlight: '#00000066',
        lakersPurple: {
          50: '#f4edff',
          100: '#e6d6ff',
          200: '#c8a9ff',
          300: '#aa7cff',
          400: '#8c4ff4',
          500: '#6f2dbd',
          600: '#552583',
          700: '#3e1a62',
          800: '#271142',
          900: '#1a0a2e'
        },
        // Lakers Gold / Yellow
        lakersGold: {
          50: '#FFF9E6',
          100: '#FFF3CC',
          200: '#FFE399',
          300: '#FFD366',
          400: '#FFC233',
          500: '#FEBB1B',
          600: '#FDB927', // primary Lakers gold
          700: '#C9951F',
          800: '#947115',
          900: '#5E4710'
        },
      },
      fontFamily: {
        headings: ['Rubik', 'sans-serif'],
        main: ['Montserrat', 'sans-serif'],
        numbers: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: []
};
