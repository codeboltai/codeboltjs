'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CyberButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'cyan' | 'success' | 'error' | 'warning' | 'ghost' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

// Color map for inline styles
const variantColors = {
  cyan: { border: '#00d4ff', text: '#00d4ff', hoverBg: '#00d4ff' },
  success: { border: '#10b981', text: '#10b981', hoverBg: '#10b981' },
  error: { border: '#ef4444', text: '#ef4444', hoverBg: '#ef4444' },
  warning: { border: '#f59e0b', text: '#f59e0b', hoverBg: '#f59e0b' },
  purple: { border: '#a855f7', text: '#a855f7', hoverBg: '#a855f7' },
  ghost: { border: '#30363d', text: '#8b949e', hoverBg: 'transparent' },
};

const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  onClick,
  variant = 'cyan',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  fullWidth = false,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const colors = variantColors[variant];

  const variantStyles = {
    cyan: cn(
      'border-cyber-cyan text-cyber-cyan',
      'hover:bg-cyber-cyan hover:text-cyber-bg-primary',
      'focus:ring-cyber-cyan/50'
    ),
    success: cn(
      'border-cyber-success text-cyber-success',
      'hover:bg-cyber-success hover:text-cyber-bg-primary',
      'focus:ring-cyber-success/50'
    ),
    error: cn(
      'border-cyber-error text-cyber-error',
      'hover:bg-cyber-error hover:text-white',
      'focus:ring-cyber-error/50'
    ),
    warning: cn(
      'border-cyber-warning text-cyber-warning',
      'hover:bg-cyber-warning hover:text-cyber-bg-primary',
      'focus:ring-cyber-warning/50'
    ),
    purple: cn(
      'border-cyber-purple text-cyber-purple',
      'hover:bg-cyber-purple hover:text-cyber-bg-primary',
      'focus:ring-cyber-purple/50'
    ),
    ghost: cn(
      'border-cyber-border text-cyber-text-secondary',
      'hover:border-cyber-cyan hover:text-cyber-cyan',
      'focus:ring-cyber-cyan/50'
    ),
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative font-mono font-semibold border-2 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-cyber-bg-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95',
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      style={{
        borderColor: colors.border,
        color: isHovered && !disabled ? '#0a0a0f' : colors.text,
        backgroundColor: isHovered && !disabled ? colors.hoverBg : 'transparent',
        boxShadow: isHovered && !disabled ? `0 0 15px ${colors.border}50` : 'none',
      }}
    >
      <span className={cn('relative z-10 flex items-center justify-center gap-2', loading && 'opacity-0')}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </span>
      )}
    </button>
  );
};

export default CyberButton;
