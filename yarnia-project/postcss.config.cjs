// postcss.config.cjs
module.exports = {
  plugins: [
    require('postcss-nesting'),   // Must come FIRST
    require('tailwindcss'),
    require('autoprefixer')
  ]
};
