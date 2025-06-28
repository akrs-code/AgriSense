/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Color - Forest Green
        primary: {
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          light: '#E8F5E9',
        },
        // Secondary Color - Golden Maize
        secondary: {
          DEFAULT: '#F9A825',
          dark: '#F57F17',
          light: '#FFFDE7',
        },
        // Accent Color - Earth Brown
        accent: {
          DEFAULT: '#6D4C41',
          dark: '#4E342E',
          light: '#EFEBE9',
        },
        // Neutral Color - Soft Grey
        neutral: {
          DEFAULT: '#F4F4F4',
          border: '#E0E0E0',
        },
        // Text Color - Charcoal
        text: {
          DEFAULT: '#333333',
          muted: '#666666',
        },
        // Info Color - Sky Blue
        info: {
          DEFAULT: '#0288D1',
          bg: '#B3E5FC',
        },
        // Error Color - Tomato Red
        error: {
          DEFAULT: '#D32F2F',
          bg: '#FFEBEE',
        },
        // Success Color - Olive Green
        success: {
          DEFAULT: '#689F38',
          bg: '#DCEDC8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};