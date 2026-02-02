'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TerminalInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  variant?: 'green' | 'blue' | 'orange' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'text' | 'password' | 'number';
  multiline?: boolean;
  rows?: number;
}

const TerminalInput: React.FC<TerminalInputProps> = ({
  value,
  onChange,
  placeholder = 'ENTER_COMMAND>',
  variant = 'green',
  size = 'md',
  disabled = false,
  className = '',
  type = 'text',
  multiline = false,
  rows = 3,
}) => {
  const variantStyles = {
    green: 'border-cyber-green text-cyber-green focus:border-cyber-green focus:ring-1 focus:ring-cyber-green',
    blue: 'border-cyber-blue text-cyber-blue focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue',
    orange: 'border-cyber-orange text-cyber-orange focus:border-cyber-orange focus:ring-1 focus:ring-cyber-orange',
    purple: 'border-cyber-purple text-cyber-purple focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const baseStyles = cn(
    'font-mono font-medium border-2 bg-cyber-darker',
    'transition-all duration-300 placeholder:text-cyber-gray',
    'focus:outline-none focus:scale-[1.01]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={cn(baseStyles, 'resize-none')}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={baseStyles}
    />
  );
};

export default TerminalInput;
