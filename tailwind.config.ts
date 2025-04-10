/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: ['class'],
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components-new-version/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    borderRadius: {
      DEFAULT: 'var(--radius-md)',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      button: 'var(--radius-button)',
      input: 'var(--radius-input)',
      card: 'var(--radius-card)',
      'popover-card': 'var(--radius-popover-card)',
      full: '9999px',
      none: '0px',
    },
    extend: {
      fontSize: {
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        card: 'var(--shadow-card)',
        toolkit: 'var(--shadow-toolkit)',
        'card-sm': 'var(--shadow-card-sm)',
      },
      height: {
        topbar: 'var(--topbar-height)',
        'screen-minus-topbar': 'calc(100vh - var(--topbar-height))',
      },
      width: {
        'sidebar-left': 'var(--sidebar-left-width)',
        'sidebar-right': 'var(--sidebar-right-width)',
        'main-content': 'var(--main-content-width)',
      },
      spacing: {
        topbar: 'var(--topbar-height)',
        'main-content': 'var(--main-content-width)',
      },
      colors: {
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        input: {
          DEFAULT: 'hsl(var(--input))',
          foreground: 'hsl(var(--input-foreground))',
          border: 'hsl(var(--input-border))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        tertiary: {
          DEFAULT: 'hsl(var(--tertiary))',
          foreground: 'hsl(var(--tertiary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        modal: {
          DEFAULT: 'hsl(var(--modal))',
          foreground: 'hsl(var(--modal-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          accent: 'hsl(var(--card-accent))',
          foreground: 'hsl(var(--card-foreground))',
          border: 'hsl(var(--card-border))',
        },
        progress: {
          DEFAULT: 'hsl(var(--progress))',
          foreground: 'hsl(var(--progress-foreground))',
        },
        switch: {
          DEFAULT: 'hsl(var(--switch))',
          foreground: 'hsl(var(--switch-foreground))',
          checked: {
            DEFAULT: 'hsl(var(--switch-checked))',
            foreground: 'hsl(var(--switch-checked-foreground))',
          },
        },

        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'slide-left': {
          '0%': {
            transform: 'translateX(100%)',
            opacity: 0,
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: 1,
          },
        },
        scroll: {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(-50%)',
          },
        },
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.3',
          },
        },
        scan: {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        blink: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.2',
          },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-25%)',
          },
        },
        'infinite-scroll-content': {
          '0%': {
            transform: 'translate3d(0, 0, 0)',
          },
          '100%': {
            transform: 'translate3d(-100%, 0, 0)',
          },
        },
      },
      animation: {
        'slide-left': 'slide-left 0.5s ease-out',
        scroll: 'scroll 30s linear infinite',
        pulse: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scan: 'scan 1.5s ease-in-out infinite',
        blink: 'blink 1s ease-in-out infinite',
        bounce: 'bounce 0.8s ease-in-out infinite',
        'infinite-scroll-content': 'infinite-scroll-content 7s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
  utilities: {
    '.animation-delay-200': {
      'animation-delay': '200ms',
    },
    '.animation-delay-400': {
      'animation-delay': '400ms',
    },
  },
}
