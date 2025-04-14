/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Optional: keep if you're adding dark mode support later
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 🕊️ Light foundations
        pearl: '#f5f3ef',        // main background
        worn_page: '#eae4d9',    // light layer, cards or sections

        // 🌲 Earthy contrast
        ink_brown: '#3b352f',    // main text / primary dark
        deep_grove: '#2f3428',   // nav bar, footer, bold background blocks
        dark_olive: '#494b3c',   // lines, borders

        // 🌿 Natural greens
        dusty_fern: '#5e7a5a',   // hover states, tags
        fresh_sage: '#a3b79b',   // secondary actions, soft buttons

        // ✒️ Minimal accents
        antique_gold: '#aa9263', // links, icons, focus rings
        muted_indigo: '#64656f', // alt text, tiny headers, active states

      },
    },    
  },
  plugins: [],
};
