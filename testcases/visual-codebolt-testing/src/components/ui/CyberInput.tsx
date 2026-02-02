'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface CyberInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  variant?: 'cyan' | 'success' | 'error' | 'warning' | 'purple' | 'muted';
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

// Color map for inline styles
const variantColors = {
  cyan: { border: '#00d4ff', focusBorder: '#00d4ff', focusGlow: '#00d4ff' },
  success: { border: '#10b981', focusBorder: '#10b981', focusGlow: '#10b981' },
  error: { border: '#ef4444', focusBorder: '#ef4444', focusGlow: '#ef4444' },
  warning: { border: '#f59e0b', focusBorder: '#f59e0b', focusGlow: '#f59e0b' },
  purple: { border: '#a855f7', focusBorder: '#a855f7', focusGlow: '#a855f7' },
  muted: { border: '#30363d', focusBorder: '#00d4ff', focusGlow: '#00d4ff' },
};

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
  const [isFocused, setIsFocused] = useState(false);

  const colors = error ? variantColors.error : variantColors[variant];

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const baseStyles = cn(
    'w-full font-mono border transition-all duration-200',
    'focus:outline-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeStyles[size],
    className
  );

  const inputStyle = {
    borderColor: isFocused ? colors.focusBorder : `${colors.border}60`,
    backgroundColor: 'rgba(10, 10, 15, 0.5)',
    color: '#e6edf3',
    boxShadow: isFocused ? `0 0 8px ${colors.focusGlow}30` : 'none',
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="flex items-center gap-1 text-sm font-mono" style={{ color: '#00d4ff' }}>
          {label}
          {required && <span style={{ color: '#ef4444' }}>*</span>}
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
          style={inputStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={baseStyles}
          style={inputStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      )}
      {error && (
        <p className="text-xs font-mono" style={{ color: '#ef4444' }}>{error}</p>
      )}
    </div>
  );
};

export default CyberInput;
