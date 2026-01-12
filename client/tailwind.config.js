const { error } = require('console')
const palette = require('./src/design/palette')


const plugin = require('tailwindcss/plugin');

module.exports = {
  darkMode: 'media',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...palette,
        d: {
          ink: '#e2e2e2',
          sand300: '#0a0a0a',
          bg: '#121212',

          lime: {
            700: '#660000',
            800: '#700c0d',
            850: '#65040e',
            900: '#b81d1d',
          },

          warn: {
            100: '#fe4241',
            50: '#ffc7c8'
          }
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    }
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.bg-gradient-brand': { backgroundImage: 'var(--c-gradient)' },
      });
    }),
  ],
};
