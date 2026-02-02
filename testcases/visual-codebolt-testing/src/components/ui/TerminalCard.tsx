'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TerminalCardProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'green' | 'blue' | 'orange' | 'purple';
  className?: string;
}

const TerminalCard: React.FC<TerminalCardProps> = ({
  children,
  title,
  variant = 'green',
  className = '',
}) => {
  const variantStyles = {
    green: 'border-cyber-green',
    blue: 'border-cyber-blue',
    orange: 'border-cyber-orange',
    purple: 'border-cyber-purple',
  };

  return (
    <div
      className={cn(
        'relative border-2 bg-cyber-darker p-4',
        'transition-all duration-300',
        variantStyles[variant],
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-current/30">
          <h3 className="font-mono font-bold text-sm uppercase tracking-wider">
            {title}
          </h3>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-cyber-orange rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-cyber-blue rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-current"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-current"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-current"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-current"></div>
    </div>
  );
};

export default TerminalCard;
