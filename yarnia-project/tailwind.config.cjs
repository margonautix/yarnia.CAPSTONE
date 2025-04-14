/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-surface', 'bg-layer', 'bg-card',
    'text-primary', 'text-secondary', 'text-accent',
    'border-primary', 'input-bg', 'input-text', 'input-placeholder',
    'button-bg', 'button-hover', 'link', 'nav-bg', 'footer-bg',
    'modal-bg', 'tag-bg', 'badge-bg',
    'dark:bg-surface-dark', 'dark:text-primary-dark', 'dark:bg-layer-dark'
  ],
  theme: {
    extend: {
      colors: {
        // Original Forested Library Palette
        pearl: '#f1e5c7',              // backgrounds, app body, modals
        ecru: '#dcc790',               // input fields, secondary card background
        satin_gold: '#c7a859',         // borders, premium/active markers, hover elements
        sage: '#b2b35a',               // tertiary buttons, tag backgrounds
        olivine: '#9cbd5a',            // secondary buttons, subtle badges
        mantis: '#71d15b',             // main CTA buttons
        kelly_green: '#57ad43',        // action button hover/focus
        forest: '#3c892a',             // icons, small text accents
        dark_moss: '#2c671e',          // confirmed states, outlines, hover variants
        pakistan_green: '#1b4412',     // footer, heading text, nav in dark mode

        // Light Mode Theme Tokens
        surface: '#f1e5c7',
        layer: '#dcc790',
        card: '#ffffff',
        primary: '#2c2c2c',
        secondary: '#dcc790',
        accent: '#3c892a',
        border: '#c7a859',
        input: '#dcc790',
        'input-text': '#2c2c2c',
        'input-placeholder': '#2c2c2c',
        button: '#71d15b',
        'button-hover': '#57ad43',
        link: '#3c892a',
        nav: '#dcc790',
        footer: '#f1e5c7',
        modal: '#ffffff',
        tag: '#b2b35a',
        badge: '#9cbd5a',

        // Dark Mode Theme Tokens
        'surface-dark': '#1b4412',
        'layer-dark': '#2c671e',
        'card-dark': '#2c671e',
        'primary-dark': '#f1e5c7',
        'secondary-dark': '#dcc790',
        'accent-dark': '#b2b35a',
        'border-dark': '#c7a859',
        'input-dark': '#2c671e',
        'input-text-dark': '#f1e5c7',
        'input-placeholder-dark': '#968d74',
        'button-dark': '#71d15b',
        'button-hover-dark': '#9cbd5a',
        'link-dark': '#98bc8f',
        'nav-dark': '#2c671e',
        'footer-dark': '#1b4412',
        'modal-dark': '#1f261e',
        'tag-dark': '#4b6448',
        'badge-dark': '#98bc8f',
      },
    },
  },
};