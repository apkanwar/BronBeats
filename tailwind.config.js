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
