/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#1a1a1a',
          secondary: '#232323',
          admin: '#111111',
          nudge: '#1c1812',
        },
        accent: {
          DEFAULT: '#CF643F',
          hover: '#e07348',
          muted: 'rgba(207, 100, 63, 0.15)',
        },
        surface: {
          DEFAULT: '#2a2a2a',
          raised: '#303030',
          border: 'rgba(255,255,255,0.06)',
        },
        text: {
          primary: '#f0ede8',
          secondary: '#9a9590',
          muted: '#5a5550',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        pill: '999px',
      },
      boxShadow: {
        nudge: '0 4px 24px rgba(207, 100, 63, 0.18)',
        card: '0 2px 12px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
