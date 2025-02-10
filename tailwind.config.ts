export const content = [
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
]

export const theme = {
  extend: {
    colors: {
      background: 'var(--background)',
      foreground: 'var(--foreground)',
    },
    animation: {
      pulse: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    keyframes: {
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.3' },
      },
    },
    utilities: {
      '.animation-delay-200': {
        'animation-delay': '200ms',
      },
      '.animation-delay-400': {
        'animation-delay': '400ms',
      },
    },
  },
}
