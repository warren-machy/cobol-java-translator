/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-blue': '#00f6ff',
        'cyber-pink': '#ff00ff',
        'cyber-dark': '#0a0a0a',
        'cyber-gray': '#1a1a1a',
      },
      boxShadow: {
        'neon-blue': '0 0 5px #00f6ff, 0 0 20px #00f6ff',
        'neon-pink': '0 0 5px #ff00ff, 0 0 20px #ff00ff',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}