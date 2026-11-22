/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#143029',
        mist: '#F3F7F5',
        pine: { DEFAULT: '#0D5C4D', dark: '#094539', soft: '#DDEEE8' },
        sun: { DEFAULT: '#F5A524', soft: '#FDEBC8' },
        coral: '#D8452A',
      },
    },
  },
  plugins: [],
};
