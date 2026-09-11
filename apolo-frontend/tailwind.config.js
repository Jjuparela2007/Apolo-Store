/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        apolo: {
          navy: "#0A1830",
          "navy-light": "#12244A",
          blue: "#1E7FE8",
          "blue-light": "#4FA0FF",
          ice: "#F4F7FB",
          steel: "#5B6B85",
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
