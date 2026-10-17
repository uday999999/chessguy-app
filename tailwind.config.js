/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        board: {
          light: '#EBECD0',
          dark: '#739552',
          woodLight: '#d2b48c',
          woodDark: '#8b5a2b',
          blueLight: '#dee3e6',
          blueDark: '#8ca2ad',
          midnightLight: '#475569',
          midnightDark: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
