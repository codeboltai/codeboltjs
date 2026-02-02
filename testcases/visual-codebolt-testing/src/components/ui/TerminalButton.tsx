'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TerminalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'green' | 'blue' | 'orange' | 'purple' | 'red';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const TerminalButton: React.FC<TerminalButtonProps> = ({
  children,
  onClick,
  variant = 'green',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const variantStyles = {
    green: 'border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-cyber-black',
    blue: 'border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-white',
    orange: 'border-cyber-orange text-cyber-orange hover:bg-cyber-orange hover:text-white',
    purple: 'border-cyber-purple text-cyber-purple hover:bg-cyber-purple hover:text-white',
    red: 'border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative font-mono font-semibold border-2 transition-all duration-300',
        'bg-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'hover:scale-105 active:scale-95',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default TerminalButton;
