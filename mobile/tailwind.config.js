/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Reprise de l'identité du site : vert profond du héros, encre des titres.
      colors: {
        brand: {
          DEFAULT: '#0f766e',
          dark: '#115e52',
          deep: '#0b4f47',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#64748b',
        },
      },
    },
  },
  plugins: [],
};
