/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#C9A962',
          'gold-light': '#E8D5A3',
          'gold-dark': '#A68B4B',
          black: '#0A0A0A',
          charcoal: '#1A1A1A',
          gray: '#2A2A2A',
          white: '#FAFAFA',
          cream: '#F5F0E8',
        },
        text: {
          primary: '#FAFAFA',
          secondary: '#B0B0B0',
          muted: '#707070',
          dark: '#1A1A1A',
        },
        surface: {
          dark: '#0A0A0A',
          card: '#1A1A1A',
          elevated: '#2A2A2A',
          light: '#F5F0E8',
        },
        functional: {
          scarcity: '#C0392B',
          trust: '#27AE60',
          star: '#F1C40F',
          error: '#E74C3C',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        'display-ar': ['var(--font-amiri)', 'serif'],
        sans: ['var(--font-dm-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        tajawal: ['var(--font-tajawal)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        amiri: ['var(--font-amiri)', 'serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.4' }],
        sm: ['14px', { lineHeight: '1.5' }],
        base: ['16px', { lineHeight: '1.6' }],
        lg: ['18px', { lineHeight: '1.6' }],
        xl: ['20px', { lineHeight: '1.7' }],
        '2xl': ['24px', { lineHeight: '1.7' }],
        '3xl': ['28px', { lineHeight: '1.8' }],
        '4xl': ['32px', { lineHeight: '1.8' }],
        '5xl': ['36px', { lineHeight: '1.9' }],
        '6xl': ['48px', { lineHeight: '1.9' }],
      },
      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
        24: '96px',
      },
      animation: {
        'slide-in-start': 'slide-in-start 0.3s ease-out',
      },
      keyframes: {
        'slide-in-start': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
