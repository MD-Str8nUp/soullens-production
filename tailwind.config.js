/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B3D91',
          gold: '#FFC857',
          purple: '#A56CC1',
          white: '#FFFFFF',
          gray: '#F0F0F0',
        },
        primary: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d8ff',
          300: '#a4bcff',
          400: '#8199ff',
          500: '#5c76ff',
          600: '#0B3D91',
          700: '#0a3580',
          800: '#092d6f',
          900: '#08255e',
        },
        secondary: {
          50: '#fffbf0',
          100: '#fff5d6',
          200: '#ffebad',
          300: '#ffdd7a',
          400: '#FFC857',
          500: '#ffb82e',
          600: '#f59e0b',
          700: '#d97706',
          800: '#b45309',
          900: '#92400e',
        },
        accent: {
          50: '#faf7ff',
          100: '#f4edff',
          200: '#e9dbff',
          300: '#dbc4ff',
          400: '#c9a9ff',
          500: '#A56CC1',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'typing': 'typing 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        typing: {
          '0%, 60%, 100%': { opacity: '0' },
          '30%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}