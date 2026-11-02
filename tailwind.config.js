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
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        'surface-active': 'var(--surface-active)',
        border: 'var(--border)',
        foreground: 'var(--foreground)',
        'fg-secondary': 'var(--fg-secondary)',
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        }
      }
    },
  },
  plugins: [],
}

