/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0F0F11',
        card:     '#17181C',
        elevated: '#1D1F24',
        border:   '#2A2D35',
        primary:  '#F5F5F7',
        secondary:'#A1A1AA',
        muted:    '#71717A',
        amber:    '#FFB86A',
        orange:   '#FF8A4C',
        success:  '#4ADE80',
        danger:   '#F87171',
      },
      fontFamily: {
        sans:     ['Inter', 'sans-serif'],
        display:  ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
