module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blueDark: '#101C2C',
        blueBase: '#162346',
        bluePri: '#1E3A8A',
        accent: '#3B82F6',
        white: '#FFFFFF',
        slate400: '#94a3b8',
        slate600: '#475569',
        slate700: '#334155',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
