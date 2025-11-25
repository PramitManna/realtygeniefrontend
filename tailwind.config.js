/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          soft: '#E2C675',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        float1: {
          '0%, 100%': { transform: 'translate(0, 0)', opacity: '0' },
          '50%': { transform: 'translate(-5px, -20px)', opacity: '0.6' },
        },
        float2: {
          '0%, 100%': { transform: 'translate(0, 0)', opacity: '0' },
          '50%': { transform: 'translate(0px, -25px)', opacity: '0.6' },
        },
        float3: {
          '0%, 100%': { transform: 'translate(0, 0)', opacity: '0' },
          '50%': { transform: 'translate(5px, -20px)', opacity: '0.6' },
        },
        shine: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out 1s infinite',
        'float-1': 'float1 3s infinite',
        'float-2': 'float2 3s infinite',
        'float-3': 'float3 3s infinite',
        'shine': 'shine 3s infinite',
      },
    },
  },
  plugins: [],
}