/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.3)',
        'glow-cyan-lg': '0 0 25px rgba(6, 182, 212, 0.4)',
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.3)',
        'glow-rose': '0 0 15px rgba(244, 63, 94, 0.3)',
        'glow-violet': '0 0 15px rgba(139, 92, 246, 0.3)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(6, 182, 212, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
