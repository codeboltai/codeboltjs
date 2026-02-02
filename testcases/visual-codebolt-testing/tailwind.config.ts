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
        // Elegant cyberpunk color palette
        'cyber-black': '#0a0a0a',
        'cyber-dark': '#1a1a1a',
        'cyber-darker': '#0d0d0d',
        'cyber-green': '#00d75a',
        'cyber-blue': '#0e7490',
        'cyber-orange': '#ea580c',
        'cyber-purple': '#7c3aed',
        'cyber-red': '#dc2626',
        'cyber-cyan': '#0891b2',
        'cyber-gray': '#374151',
        'cyber-light-gray': '#6b7280',
        'neon-green': '#00ff41',
        'terminal-green': '#22c55e',
        'matrix-green': '#16a34a',
        'electric-blue': '#3b82f6',
        'warning-orange': '#f97316',
        'danger-red': '#ef4444',
        'text-primary': '#f3f4f6',
        'text-secondary': '#d1d5db',
        'text-muted': '#9ca3af',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
        'terminal': ['Courier New', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 3s infinite',
        'terminal-cursor': 'terminal-cursor 1s infinite',
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
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor'
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
      },
      backgroundImage: {
        'scanlines': 'repeating-linear-gradient(0deg, rgba(0, 255, 65, 0.03) 0px, transparent 1px, transparent 2px, rgba(0, 255, 65, 0.03) 3px)',
        'grid': 'linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="0.05"/%3E%3C/svg%3E")',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'medium': '0 4px 6px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.12)',
        'large': '0 10px 25px rgba(0, 0, 0, 0.19), 0 6px 10px rgba(0, 0, 0, 0.15)',
      },
      borderStyle: {
        'cyber': 'solid',
        'glitch': 'dashed',
      },
    },
  },
  plugins: [],
};

export default config;
