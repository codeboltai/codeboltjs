'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CyberBadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'success' | 'error' | 'warning' | 'muted';
  size?: 'sm' | 'md';
  className?: string;
}

const CyberBadge: React.FC<CyberBadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    cyan: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/40',
    success: 'bg-cyber-success/20 text-cyber-success border-cyber-success/40',
    error: 'bg-cyber-error/20 text-cyber-error border-cyber-error/40',
    warning: 'bg-cyber-warning/20 text-cyber-warning border-cyber-warning/40',
    muted: 'bg-cyber-bg-tertiary text-cyber-text-secondary border-cyber-border',
  };

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium border rounded',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default CyberBadge;
