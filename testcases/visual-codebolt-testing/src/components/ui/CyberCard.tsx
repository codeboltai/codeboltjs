'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CyberCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'cyan' | 'success' | 'error' | 'warning' | 'muted';
  className?: string;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
}

const CyberCard: React.FC<CyberCardProps> = ({
  children,
  title,
  subtitle,
  variant = 'cyan',
  className = '',
  headerRight,
  noPadding = false,
}) => {
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
        styles.border,
        styles.glow,
        className
      )}
    >
      {/* Corner decorations */}
      <div className={cn('absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2', styles.border)} />
      <div className={cn('absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2', styles.border)} />
      <div className={cn('absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2', styles.border)} />
      <div className={cn('absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2', styles.border)} />

      {/* Header */}
      {title && (
        <div className={cn(
          'flex items-center justify-between px-4 py-2 border-b',
          styles.border
        )}>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-cyber-error animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-cyber-warning animate-pulse delay-75" />
              <div className="w-2 h-2 rounded-full bg-cyber-success animate-pulse delay-150" />
            </div>
            <div>
              <h3 className={cn(
                'font-mono font-bold text-sm uppercase tracking-wider',
                styles.title
              )}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-cyber-text-muted font-mono">{subtitle}</p>
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
