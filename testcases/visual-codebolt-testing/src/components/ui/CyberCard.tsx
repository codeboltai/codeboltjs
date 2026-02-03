'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CyberCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'cyan' | 'success' | 'error' | 'warning' | 'muted' | 'purple' | 'info';
  className?: string;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
}

// Using inline styles for colors to ensure they work
const variantColorMap = {
  cyan: { border: '#00d4ff', title: '#00d4ff' },
  success: { border: '#10b981', title: '#10b981' },
  error: { border: '#ef4444', title: '#ef4444' },
  warning: { border: '#f59e0b', title: '#f59e0b' },
  purple: { border: '#a855f7', title: '#a855f7' },
  info: { border: '#3b82f6', title: '#3b82f6' },
  muted: { border: '#30363d', title: '#8b949e' },
};

const CyberCard: React.FC<CyberCardProps> = ({
  children,
  title,
  subtitle,
  variant = 'cyan',
  className = '',
  headerRight,
  noPadding = false,
}) => {
  const colors = variantColorMap[variant];

  const variantStyles = {
    cyan: {
      border: 'border-cyber-cyan/40',
      title: 'text-cyber-cyan',
      glow: 'shadow-cyber',
    },
    success: {
      border: 'border-cyber-success/40',
      title: 'text-cyber-success',
      glow: 'shadow-cyber-success',
    },
    error: {
      border: 'border-cyber-error/40',
      title: 'text-cyber-error',
      glow: 'shadow-cyber-error',
    },
    warning: {
      border: 'border-cyber-warning/40',
      title: 'text-cyber-warning',
      glow: '',
    },
    purple: {
      border: 'border-cyber-purple/40',
      title: 'text-cyber-purple',
      glow: '',
    },
    info: {
      border: 'border-cyber-info/40',
      title: 'text-cyber-info',
      glow: '',
    },
    muted: {
      border: 'border-cyber-border',
      title: 'text-cyber-text-secondary',
      glow: '',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'relative border bg-cyber-bg-secondary/80 backdrop-blur-sm',
        'transition-all duration-300',
        styles.glow,
        className
      )}
      style={{ borderColor: `${colors.border}60` }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: colors.border }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: colors.border }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: colors.border }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: colors.border }} />

      {/* Header */}
      {title && (
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{ borderColor: `${colors.border}60` }}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ef4444' }} />
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#f59e0b', animationDelay: '75ms' }} />
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10b981', animationDelay: '150ms' }} />
            </div>
            <div>
              <h3
                className="font-mono font-bold text-sm uppercase tracking-wider"
                style={{ color: colors.title }}
              >
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs font-mono" style={{ color: '#8b949e' }}>{subtitle}</p>
              )}
            </div>
          </div>
          {headerRight && (
            <div className="flex items-center gap-2">
              {headerRight}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn('relative z-10', !noPadding && 'p-4')}>
        {children}
      </div>
    </div>
  );
};

export default CyberCard;
