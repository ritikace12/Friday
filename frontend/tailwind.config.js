/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          primary: '#00f2ff',
          secondary: '#ff00ff',
          accent: '#ffd700',
          dark: '#0a0a2a',
          light: '#e6f6ff',
        },
        'jarvis-primary': '#00F5FF',
        'jarvis-secondary': '#7B61FF',
        'jarvis-accent': '#FF3366',
        'jarvis-gray': '#1A1A1A',
        'jarvis-blue': '#003554',
        'jarvis-cyan': '#00F5FF',
        'jarvis-purple': '#7B61FF',
        'jarvis-pink': '#FF3366',
        'jarvis-glow': 'rgba(0, 245, 255, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(to right, rgba(0, 245, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 245, 255, 0.1) 1px, transparent 1px)',
        'gradient-ai': 'linear-gradient(135deg, #003554 0%, #1A1A1A 100%)',
      },
      animation: {
        'pulse': 'pulse 2s infinite',
        'shine': 'shine 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'loading': 'loading 1.5s infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,242,255,0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(0,242,255,0.8)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.2)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        loading: {
          '0%': { content: '""' },
          '25%': { content: '"."' },
          '50%': { content: '".."' },
          '75%': { content: '"..."' },
          '100%': { content: '""' },
        },
      },
    },
  },
  plugins: [],
} 