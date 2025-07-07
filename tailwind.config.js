/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#a259f7',
        secondary: '#23232b',
        accent: '#6c6c7a',
        background: '#181820',
        card: '#23232b',
        overlay: 'rgba(24,24,32,0.7)',
      },
      borderRadius: {
        'xl': '1.5rem',
        '2xl': '2rem',
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
