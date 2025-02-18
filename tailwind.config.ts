/** @type {import('tailwindcss').Config} */

import tailwindDefaultConfig from './src/styles/tailwind.default.config'

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [tailwindDefaultConfig],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'text-body': 'var(--text-body)',
        'text-header': 'var(--text-header)',
      },
      keyframes: {
        'slide-left': {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        'slide-left': 'slide-left 0.5s ease-out',
        scroll: 'scroll 30s linear infinite',
        pulse: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
  utilities: {
    '.animation-delay-200': {
      'animation-delay': '200ms',
    },
    '.animation-delay-400': {
      'animation-delay': '400ms',
    },
  },
}
