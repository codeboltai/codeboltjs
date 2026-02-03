import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk Dark Backgrounds
        'cyber-bg': {
          primary: '#0a0a0f',
          secondary: '#0d1117',
          tertiary: '#161b22',
          elevated: '#1c2128',
        },
        // Primary Accent - Cyan/Teal
        'cyber-cyan': {
          DEFAULT: '#00d4ff',
          bright: '#00e5ff',
          muted: '#0891b2',
          dark: '#164e63',
        },
        // Status Colors
        'cyber-success': '#10b981',
        'cyber-error': '#ef4444',
        'cyber-warning': '#f59e0b',
        'cyber-info': '#3b82f6',
        // Text Colors
        'cyber-text': {
          primary: '#e6edf3',
          secondary: '#8b949e',
          muted: '#484f58',
        },
        // Border Colors
        'cyber-border': {
          DEFAULT: '#30363d',
          accent: 'rgba(0, 212, 255, 0.2)',
          strong: '#444d56',
        },
        // Legacy color mappings (for backward compatibility)
        'cyber-black': '#0a0a0f',
        'cyber-dark': '#0d1117',
        'cyber-darker': '#161b22',
        'cyber-green': '#10b981',
        'cyber-blue': '#00d4ff',
        'cyber-orange': '#f59e0b',
        'cyber-purple': '#a855f7',
        'cyber-red': '#ef4444',
        'neon-cyan': '#00d4ff',
        'text-primary': '#e6edf3',
        'text-secondary': '#8b949e',
        'text-muted': '#484f58',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        'terminal': ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 3s infinite',
        'terminal-cursor': 'terminal-cursor 1s infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        glitch: {
          '0%, 100%': {
            textShadow: '2px 2px 0 #ff00ff, -2px -2px 0 #00d4ff',
            transform: 'translate(0)'
          },
          '25%': {
            textShadow: '-2px 2px 0 #ff00ff, 2px -2px 0 #00d4ff',
            transform: 'translate(-2px, 2px)'
          },
          '50%': {
            textShadow: '2px -2px 0 #ff00ff, -2px 2px 0 #00d4ff',
            transform: 'translate(2px, -2px)'
          },
          '75%': {
            textShadow: '-2px -2px 0 #ff00ff, 2px 2px 0 #00d4ff',
            transform: 'translate(-2px, -2px)'
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor'
          },
          '50%': {
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor'
          },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
          '75%': { opacity: '0.9' },
        },
        'terminal-cursor': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'scanlines': 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0, 212, 255, 0.015) 2px, rgba(0, 212, 255, 0.015) 4px)',
        'grid': 'linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px)',
        'cyber-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #161b22 100%)',
      },
      boxShadow: {
        'cyber': '0 0 10px rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.1)',
        'cyber-strong': '0 0 15px rgba(0, 212, 255, 0.5), 0 0 30px rgba(0, 212, 255, 0.2)',
        'cyber-error': '0 0 10px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.1)',
        'cyber-success': '0 0 10px rgba(16, 185, 129, 0.3), 0 0 20px rgba(16, 185, 129, 0.1)',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'medium': '0 4px 6px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.12)',
        'large': '0 10px 25px rgba(0, 0, 0, 0.19), 0 6px 10px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'cyber': '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
};

export default config;
