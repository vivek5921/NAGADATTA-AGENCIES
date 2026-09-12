/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36aef8',
          500: '#0c92eb',
          600: '#0074ca',
          700: '#015da5',
          800: '#064f89',
          900: '#0b4272',
          950: '#072a4b',
        },
        accent: {
          orange: '#ff6b00',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
