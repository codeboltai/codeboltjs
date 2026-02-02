'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: 'online' | 'offline' | 'error' | 'warning' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  label?: string;
  className?: string;
}

const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  pulse = true,
  label,
  className = '',
}) => {
  const statusStyles = {
    online: 'bg-cyber-success',
    offline: 'bg-cyber-text-muted',
    error: 'bg-cyber-error',
    warning: 'bg-cyber-warning',
    pending: 'bg-cyber-cyan',
  };

  const sizeStyles = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const labelStyles = {
    online: 'text-cyber-success',
    offline: 'text-cyber-text-muted',
    error: 'text-cyber-error',
    warning: 'text-cyber-warning',
    pending: 'text-cyber-cyan',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-full',
          statusStyles[status],
          sizeStyles[size],
          pulse && 'animate-pulse'
        )}
      />
      {label && (
        <span className={cn('text-xs font-mono uppercase', labelStyles[status])}>
          {label}
        </span>
      )}
    </div>
  );
};

export default StatusDot;
