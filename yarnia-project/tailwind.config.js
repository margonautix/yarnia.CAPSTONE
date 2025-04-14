/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    safelist: [
      'bg-pakistan_green',
      'bg-dark_moss_green',
      'dark:bg-pakistan_green',
      'dark:bg-dark_moss_green',
      'text-pakistan_green',
      'text-pearl',
      'dark:text-pearl',
      'dark:text-ecru',
    ],
    theme: {
      extend: {
        colors: {
          pearl: '#f1e5c7',
          ecru: '#dcc790',
          satin_sheen_gold: '#c7a859',
          sage: '#b2b35a',
          olivine: '#9cbd5a',
          mantis: '#71d15b',
          kelly_green: '#57ad43',
          forest_green: '#3c892a',
          dark_moss_green: '#2c671e',
          pakistan_green: '#1b4412',
        },
      },
    },
    plugins: [],
  };
  