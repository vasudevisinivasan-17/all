
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{ts,tsx}",
    "./constants.ts"
  ],
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'pop-selection': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(0.95)' },
        },
        'ring-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(165, 180, 252, 0.6)' },
          '70%': { boxShadow: '0 0 0 10px rgba(165, 180, 252, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(165, 180, 252, 0)' },
        }
      },
      animation: {
        'pop-selection': 'pop-selection 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'ring-pulse': 'ring-pulse 1.5s infinite',
      }
    },
  },
  plugins: [],
}
