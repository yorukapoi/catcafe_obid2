/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka"', 'sans-serif'],
        body: ['"Nunito"', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fffdf9',
          100: '#fdf6ec',
          200: '#faecd6',
          300: '#f5dab0',
          400: '#eec394',
          500: '#e3a874',
        },
        rose: {
          50: '#fff5f7',
          100: '#ffe4ea',
          200: '#ffc9d6',
          300: '#ff9fb5',
          400: '#ff7197',
          500: '#f94f7f',
          600: '#e0366a',
          700: '#b82756',
        },
        mint: {
          50: '#f0fdf7',
          100: '#dcfce9',
          200: '#bbf7d6',
          300: '#86efb4',
          400: '#4ade85',
          500: '#22c562',
          600: '#16a34d',
          700: '#15803d',
        },
        lavender: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        warm: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        bounceEar: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pawWalk: {
          '0%': { opacity: '0', transform: 'translateX(-20px) rotate(-15deg) scale(0.8)' },
          '30%': { opacity: '0.4' },
          '60%': { opacity: '0.2' },
          '100%': { opacity: '0', transform: 'translateX(20px) rotate(15deg) scale(1.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        dance: {
          '0%, 100%': { transform: 'translateY(0) rotate(-5deg)' },
          '25%': { transform: 'translateY(-10px) rotate(5deg)' },
          '50%': { transform: 'translateY(0) rotate(-5deg)' },
          '75%': { transform: 'translateY(-6px) rotate(5deg)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        floatSlow: 'floatSlow 7s ease-in-out infinite',
        bounceEar: 'bounceEar 0.6s ease-in-out infinite',
        wiggle: 'wiggle 0.5s ease-in-out infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        scaleIn: 'scaleIn 0.3s ease-out forwards',
        slideUp: 'slideUp 0.3s ease-out forwards',
        pawWalk: 'pawWalk 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
        dance: 'dance 0.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
