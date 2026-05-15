/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#050B14',
          800: '#0A1628',
          700: '#0F1F3A',
          600: '#152A4E',
        },
        sci: {
          cyan: '#4ECDC4',
          blue: '#5B7CFF',
          gold: '#FDB813',
          ice: '#AED6F1',
          white: '#E8F4FD',
          green: '#3BC9A0',
          success: '#3BC9A0',
          danger: '#FF6B6B',
          warning: '#FDB813',
          neutral: '#8899AA',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
      backdropBlur: {
        sci: '12px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
