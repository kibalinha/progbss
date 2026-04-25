/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0f172a',
        'bg-secondary': '#1e293b',
        'bg-card': '#1e293b',
        'accent-orange': '#f97316',
        'accent-green': '#22c55e',
        'accent-yellow': '#eab308',
        'accent-red': '#ef4444',
        'text-primary': '#f1f5f9',
        'text-muted': '#94a3b8',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
