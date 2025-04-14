/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-library_leather', 'text-worn_oak', 'bg-night_bark', 'text-birch_parchment',
    'bg-deep_grove', 'text-dry_grass', 'text-ink_brown', 'bg-dusty_fern', 'bg-mist_fern',
    'hover:bg-fresh_sage', 'hover:bg-bright_moss', 'border-worn_page', 'border-dark_olive'
  ],
  theme: {
    extend: {
      colors: {
        birch_parchment: '#f6f4ef',
        night_bark: '#1b1f1a',
        linen_moss: '#e4ded0',
        deep_grove: '#2b332a',
        ink_brown: '#2c2c2c',
        aged_parchment: '#716c5f',
        dry_grass: '#bfb9a4',
        antique_gold: '#c4a76f',
        warm_brass: '#e6cfa1',
        dusty_fern: '#6c9a7b',
        mist_fern: '#90cba5',
        fresh_sage: '#8aae82',
        bright_moss: '#a6ddbc',
        worn_page: '#cfcac0',
        dark_olive: '#3b453d',
        library_leather: '#d2bfa5',
        worn_oak: '#1a1d18'
      },
    },
  },
  plugins: [],
};
