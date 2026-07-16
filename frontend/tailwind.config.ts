import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ForaMetric Design Tokens
        accent: {
          blue:   '#0071e3',
          purple: '#af52de',
          gold:   '#ff9500',
          green:  '#34c759',
          red:    '#ff3b30',
        },
        bg: {
          primary:   '#f5f5f7',
          secondary: '#ffffff',
        },
        text: {
          primary: '#1d1d1f',
          muted:   '#6e6e73',
        },
        panel: {
          border:       'rgba(0,0,0,0.06)',
          borderHover:  'rgba(0,113,227,0.3)',
        },
        // shadcn/ui CSS variable bridge
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', 'sans-serif'],
        mono: ['SF Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'pulse-blue': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,113,227,0.2)' },
          '50%':       { boxShadow: '0 0 15px rgba(0,113,227,0.4)' },
        },
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(52,199,89,0.2)' },
          '50%':       { boxShadow: '0 0 15px rgba(52,199,89,0.4)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'pulse-blue':  'pulse-blue 2s ease-in-out infinite',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'fade-in':     'fade-in 0.3s ease-out',
        'spin-slow':   'spin-slow 0.7s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
