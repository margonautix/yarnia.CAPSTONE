/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-library_leather', 'text-worn_oak', 'bg-night_bark', 'text-birch_parchment',
    'bg-deep_grove', 'text-dry_grass', 'text-ink_brown', 'bg-dusty_fern', 'bg-mist_fern',
    'hover:bg-fresh_sage', 'hover:bg-bright_moss', 'border-worn_page', 'border-dark_olive',
    'text-muted_indigo', 'text-dusty_rose', 'text-desaturated_plum',   'placeholder:text-dusty_rose',
    'dark:placeholder:text-dusty_rose',
  ],
  theme: {
    extend: {
      colors: {
        birch_parchment: '#d7d3c5', // dusty cream glow from the light rays
        night_bark: '#151812', // deep, shadowed wood
        linen_moss: '#bcb7a1', // soft light hitting the mossy stone
        deep_grove: '#1f261e', // dark green-black background foliage
        ink_brown: '#2a251c', // book spines and old pages
        aged_parchment: '#7a7464', // aged, muddy parchment tones
        dry_grass: '#968d74', // scattered, dry pages and debris
        antique_gold: '#b5985a', // warm highlights on carvings
        warm_brass: '#c5b27e', // ornate wood reflections under light
        dusty_fern: '#4b6448', // midtone mossy green
        mist_fern: '#6a8f6a', // slightly brighter vine greens
        fresh_sage: '#7da77a', // softened highlight greens
        bright_moss: '#98bc8f', // glowing moss where the light hits
        worn_page: '#ada793', // muted paper or faded walls
        dark_olive: '#3b4535', // library shadows & carved wood trim
        library_leather: '#7e6a52', // book covers and old binding leather
        worn_oak: '#2c2319', // deep, polished wood of the shelves
        dusty_rose: '#7e6a5d', // aged velvet-like hints
        muted_indigo: '#5d5e6b', // dusky shadow corners
        desaturated_plum: '#5f4a4d', // hidden decorative tones in shadows
      },
    },    
  },
  plugins: [],
};
