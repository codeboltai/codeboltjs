'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import StatusDot from '../ui/StatusDot';
import { CodeboltAPI } from '@/lib/modules';
import { Search, Zap } from 'lucide-react';

interface HeaderProps {
  onSearchClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchClick }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [cycleCount, setCycleCount] = useState(847);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().split('T')[1].split('.')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleCount(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const moduleCount = CodeboltAPI.getModuleCount();
  const functionCount = CodeboltAPI.getTotalFunctionCount();

  return (
    <header className="border-b border-cyber-cyan/30 bg-cyber-bg-primary/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-cyber-cyan" />
              <h1 className="text-lg font-mono font-bold text-cyber-cyan tracking-wider">
                CODEBOLT_JS_TESTER
              </h1>
            </div>
            <span className="text-xs font-mono text-cyber-text-muted">v2.0</span>
            <div className="hidden md:flex items-center gap-1 px-2 py-1 border border-cyber-border bg-cyber-bg-secondary">
              <span className="text-xs font-mono text-cyber-text-secondary">
                {moduleCount} MODULES
              </span>
              <span className="text-cyber-text-muted">|</span>
              <span className="text-xs font-mono text-cyber-cyan">
                {functionCount} FUNCTIONS
              </span>
            </div>
          </div>

          {/* Center - Search shortcut */}
          <button
            onClick={onSearchClick}
            className={cn(
              'hidden md:flex items-center gap-2 px-4 py-1.5 border border-cyber-border',
              'bg-cyber-bg-secondary hover:border-cyber-cyan/50 transition-colors',
              'text-cyber-text-muted hover:text-cyber-text-secondary'
            )}
          >
            <Search className="w-4 h-4" />
            <span className="text-xs font-mono">Search functions...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-cyber-bg-tertiary border border-cyber-border rounded">
              Cmd+K
            </kbd>
          </button>

          {/* Right side - Status indicators */}
          <div className="flex items-center gap-6 text-xs font-mono">
            <StatusDot status="online" label="CONNECTED" />
            <div className="hidden sm:flex items-center gap-1 text-cyber-text-secondary">
              <span className="text-cyber-text-muted">CYCLE:</span>
              <span className="text-cyber-cyan">{cycleCount}</span>
            </div>
            <div className="hidden sm:block text-cyber-warning">
              {currentTime}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
