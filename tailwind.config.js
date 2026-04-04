/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0f0f1a',
          card: '#1a1a2e',
          elevated: '#242440',
          input: '#2a2a45',
        },
        content: {
          primary: '#f1f1f3',
          secondary: '#9ca3af',
          muted: '#6b7280',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          subtle: 'rgba(99, 102, 241, 0.15)',
        },
        status: {
          available: '#10b981',
          partial: '#f59e0b',
          pending: '#6366f1',
          processing: '#3b82f6',
          declined: '#ef4444',
          unknown: '#6b7280',
        },
        border: {
          DEFAULT: '#2d2d50',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '48px',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      fontSize: {
        display: ['32px', { fontWeight: '700', lineHeight: '38px' }],
        h1: ['24px', { fontWeight: '700', lineHeight: '29px' }],
        h2: ['20px', { fontWeight: '600', lineHeight: '24px' }],
        h3: ['17px', { fontWeight: '600', lineHeight: '20px' }],
        body: ['15px', { fontWeight: '400', lineHeight: '22px' }],
        'body-sm': ['13px', { fontWeight: '400', lineHeight: '20px' }],
        caption: ['11px', { fontWeight: '500', lineHeight: '11px' }],
      },
    },
  },
  plugins: [],
};
