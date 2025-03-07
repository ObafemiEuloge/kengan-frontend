/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#121640',
          light: '#1A1B4B',
          dark: '#0A0C2A',
        },
        secondary: {
          DEFAULT: '#E63946',
          light: '#FF7F7F',
          dark: '#C81E2B',
        },
        accent: {
          DEFAULT: '#FFD700',
          light: '#FFEA80',
          dark: '#D4AF00',
        },
        neutral: {
          dark: '#0D0D0D',
          light: '#F5F5F5',
        },
      },
      fontFamily: {
        'heading': ['"Sigmar"', 'cursive'],
        'body': ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #121640 0%, #1A1B4B 100%)',
        'gradient-accent': 'linear-gradient(135deg, #E63946 0%, #FF7F7F 100%)',
      },
      scale: {
        '102': '1.02',
      }
    },
  },
  plugins: [],
}
