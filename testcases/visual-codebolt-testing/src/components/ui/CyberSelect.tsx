'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CyberSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
}

const CyberSelect: React.FC<CyberSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  label,
  required = false,
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="flex items-center gap-1 text-sm font-mono text-cyber-cyan">
          {label}
          {required && <span className="text-cyber-error">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            'w-full font-mono text-sm px-3 py-2 pr-10 border bg-cyber-bg-primary/50 backdrop-blur-sm',
            'border-cyber-cyan/40 text-cyber-text-primary',
            'focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan/30 focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'appearance-none cursor-pointer',
            'transition-all duration-200',
            className
          )}
        >
          <option value="" className="bg-cyber-bg-primary text-cyber-text-muted">
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-cyber-bg-primary text-cyber-text-primary"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-cyan pointer-events-none"
        />
      </div>
    </div>
  );
};

export default CyberSelect;
