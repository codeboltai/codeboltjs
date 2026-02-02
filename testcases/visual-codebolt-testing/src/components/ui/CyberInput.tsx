'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CyberInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  variant?: 'cyan' | 'success' | 'error' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'text' | 'password' | 'number' | 'email';
  multiline?: boolean;
  rows?: number;
  label?: string;
  required?: boolean;
  error?: string;
}

const CyberInput: React.FC<CyberInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter value...',
  variant = 'cyan',
  size = 'md',
  disabled = false,
  className = '',
  type = 'text',
  multiline = false,
  rows = 3,
  label,
  required = false,
  error,
}) => {
  const variantStyles = {
    cyan: cn(
      'border-cyber-cyan/40 text-cyber-text-primary',
      'focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan/30',
      'placeholder:text-cyber-text-muted'
    ),
    success: cn(
      'border-cyber-success/40 text-cyber-text-primary',
      'focus:border-cyber-success focus:ring-1 focus:ring-cyber-success/30',
      'placeholder:text-cyber-text-muted'
    ),
    error: cn(
      'border-cyber-error/40 text-cyber-text-primary',
      'focus:border-cyber-error focus:ring-1 focus:ring-cyber-error/30',
      'placeholder:text-cyber-text-muted'
    ),
    muted: cn(
      'border-cyber-border text-cyber-text-primary',
      'focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan/30',
      'placeholder:text-cyber-text-muted'
    ),
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const baseStyles = cn(
    'w-full font-mono border bg-cyber-bg-primary/50 backdrop-blur-sm',
    'transition-all duration-200',
    'focus:outline-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    error ? variantStyles.error : variantStyles[variant],
    sizeStyles[size],
    className
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="flex items-center gap-1 text-sm font-mono text-cyber-cyan">
          {label}
          {required && <span className="text-cyber-error">*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={cn(baseStyles, 'resize-none')}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={baseStyles}
        />
      )}
      {error && (
        <p className="text-xs font-mono text-cyber-error">{error}</p>
      )}
    </div>
  );
};

export default CyberInput;
