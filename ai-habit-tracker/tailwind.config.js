/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0F172A', // slate-900
        surface: '#1E293B',    // slate-800
        surfaceLight: '#334155', // slate-700
        primary: '#8B5CF6',    // violet-500
        primaryHover: '#7C3AED', // violet-600
        success: '#10B981',    // emerald-500
        danger: '#EF4444',     // red-500
        text: '#F8FAFC',       // slate-50
        textMuted: '#94A3B8',  // slate-400
        border: '#334155',     // slate-700
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
