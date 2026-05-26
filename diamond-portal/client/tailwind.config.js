/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1a1510',
          navy: '#2a3d47',
          teal: '#3f748a',
          gold: '#e7bf69',
          cream: '#f2f0eb',
          sand: '#e8e4da',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
