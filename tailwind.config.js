/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:        '#07090D',
        bg2:       '#0D1117',
        bg3:       '#111827',
        surface:   '#151922',
        surface2:  '#1A1F2B',
        border:    'rgba(255,255,255,0.06)',
        borderHi:  'rgba(255,255,255,0.10)',
        primary:   '#F8FAFC',
        secondary: '#C9D0DE',
        muted:     '#8B93A7',
        lime:      '#D9FF3F',
        limeHi:    '#C7F731',
        limeSoft:  '#B8FF5C',
        danger:    '#FF6B7A',
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow:    '0 0 24px rgba(217,255,63,0.35), 0 0 60px rgba(217,255,63,0.15)',
        glowSm:  '0 0 12px rgba(217,255,63,0.45)',
        card:    '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px -20px rgba(0,0,0,0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
