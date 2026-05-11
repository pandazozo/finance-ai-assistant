/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A365D',
          light: '#3182CE',
        },
        accent: '#D69E2E',
        up: '#E53E3E',
        down: '#38A169',
        bg: {
          dark: '#1A1A2E',
          card: '#16213E',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0AEC0',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
