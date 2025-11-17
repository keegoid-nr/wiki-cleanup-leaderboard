/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nr': {
          'dark': '#16191C',
          'dark-card': '#2A2E33',
          'dark-light': '#3E4249',
          'green': '#00B365',
          'green-dark': '#007E48',
          'green-accent': '#68FFC2',
          'font': '#F0F2F3',
        },
      },
    },
  },
  plugins: [],
}
