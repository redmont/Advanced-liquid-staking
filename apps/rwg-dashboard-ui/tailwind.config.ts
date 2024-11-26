import { type Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-aeonik)', ...fontFamily.sans],
        tusker: ['var(--font-tusker-grotesk)', ...fontFamily.sans],
        monoline: ['var(--font-monoline)', ...fontFamily.sans],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      transitionDelay: {
        '400': '400ms',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        light: {
          DEFAULT: 'hsl(var(--background-light))',
          foreground: 'hsl(var(--background-light-foreground))',
        },
        lighter: {
          DEFAULT: 'hsl(var(--background-lighter))',
          foreground: 'hsl(var(--background-lighter-foreground))',
        },
        lightest: {
          DEFAULT: 'hsl(var(--background-lightest))',
          foreground: 'hsl(var(--background-lightest-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        'primary-intermediate': {
          1: 'hsl(var(--primary-intermediate-1))',
          2: 'hsl(var(--primary-intermediate-2))',
          3: 'hsl(var(--primary-intermediate-3))',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'accent-2': {
          DEFAULT: 'hsla(0, 94%, 33%, 1)',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        'input-border': 'hsl(var(--input-border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      boxShadow: {
        dark: '3px 3px 3px rgba(0, 0, 0, 0.6)', // Darker and more pronounced shadow
      },
      dropShadow: {
        primary: '0 0 10px hsl(var(--primary) / 0.35)', // Glow-like drop shadow with primary color
      },
      backgroundImage: {
        vignette:
          'radial-gradient(circle, rgba(0, 0, 0, 0.8) 20%, rgba(0, 0, 0, 1) 100%)',
      },
      keyframes: {
        skeleton: {
          '0%, 100%': { backgroundColor: 'hsl(0 0% 6%)' },
          '50%': { backgroundColor: 'hsl(0 0% 10%)' },
        },
        shake: {
          '10%': {
            transform: 'scale(1.25) translate3d(0, 2px, 0)',
          },
          '20%': {
            transform: 'scale(1.3) translate3d(4px, -4px, 0)',
          },
          '30%': {
            transform: 'scale(1.35) translate3d(-8px, 0px, 0)',
          },
          '40%': {
            transform: 'scale(1.4) translate3d(8px, 4px, 0)',
          },
          '50%': {
            transform: 'scale(1.45) translate3d(-8px, -8px, 0)',
          },
          '60%': {
            transform: 'scale(1.5) translate3d(8px, 6px, 0)',
          },
          '70%': {
            transform: 'scale(1.55) translate3d(-8px, 8px, 0)',
          },
          '80%': {
            transform: 'scale(1.6) translate3d(8px, -8px, 0)',
          },
          '90%': {
            transform: 'scale(1.65) translate3d(-8px, 10px, 0)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(5) translate3d(0, 0, 0)',
            opacity: '0',
          },
        },
      },
      animation: {
        pulse: 'pulse 1.25s infinite',
        skeleton: 'skeleton 1.25s infinite',
        shake: 'shake 1.25s ease forwards',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
