/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0A0A0A',
        elevated: '#141414',
        teal: {
          DEFAULT: '#0683a1',
          hover: '#057a96',
        },
        mint: '#00D4AA',
        secondary: '#A0A0A0',
      },
    },
  },
  plugins: [],
}
