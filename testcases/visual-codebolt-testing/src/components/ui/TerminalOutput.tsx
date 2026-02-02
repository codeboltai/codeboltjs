'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TerminalOutputProps {
  content: string | object;
  variant?: 'success' | 'error' | 'info' | 'warning';
  className?: string;
  maxHeight?: string;
  showTimestamp?: boolean;
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({
  content,
  variant = 'info',
  className = '',
  maxHeight = '400px',
  showTimestamp = true,
}) => {
  const variantStyles = {
    success: 'border-cyber-green text-cyber-green',
    error: 'border-cyber-red text-cyber-red',
    info: 'border-cyber-blue text-cyber-blue',
    warning: 'border-cyber-orange text-cyber-orange',
  };

  const formatContent = (data: string | object): string => {
    if (typeof data === 'string') {
      return data;
    }
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const timestamp = new Date().toISOString();
  const formattedContent = formatContent(content);

  return (
    <div
      className={cn(
        'font-mono text-sm border-2 bg-cyber-black/70 backdrop-blur-sm p-4 overflow-auto',
        'relative before:absolute before:top-0 before:left-0 before:w-full before:h-[1px]',
        'before:bg-gradient-to-r before:from-transparent before:via-cyber-green before:to-transparent',
        variantStyles[variant],
        className
      )}
      style={{
        maxHeight,
        boxShadow: `inset 0 0 10px rgba(0, 0, 0, 0.5), 0 0 5px currentColor`,
      }}
    >
      {showTimestamp && (
        <div className="text-xs text-gray-500 mb-2 font-bold">
          [{timestamp}]
        </div>
      )}
      <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
        {formattedContent}
      </pre>
    </div>
  );
};

export default TerminalOutput;
