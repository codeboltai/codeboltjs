'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import StatusDot from '../ui/StatusDot';
import { CodeboltAPI } from '@/lib/modules';
import { Search, Zap, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onSearchClick: () => void;
}

type ConnectionStatus = 'checking' | 'connected' | 'disconnected' | 'error';

const Header: React.FC<HeaderProps> = ({ onSearchClick }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [cycleCount, setCycleCount] = useState(847);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [socketPort, setSocketPort] = useState<string>('12345');

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().split('T')[1].split('.')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Increment cycle count
  useEffect(() => {
    const interval = setInterval(() => {
      setCycleCount(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check connection status
  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch('/api/execute', {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await response.json();
      setConnectionStatus(data.status === 'connected' ? 'connected' : 'disconnected');
      if (data.socketPort) {
        setSocketPort(data.socketPort);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('error');
    }
  };

  // Check connection on mount and periodically
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const moduleCount = CodeboltAPI.getModuleCount();
  const functionCount = CodeboltAPI.getTotalFunctionCount();

  const getStatusLabel = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'CHECKING...';
      case 'connected':
        return 'CONNECTED';
      case 'disconnected':
        return 'DISCONNECTED';
      case 'error':
        return 'ERROR';
    }
  };

  const getStatusType = (): 'online' | 'offline' | 'error' | 'warning' | 'pending' => {
    switch (connectionStatus) {
      case 'checking':
        return 'pending';
      case 'connected':
        return 'online';
      case 'disconnected':
        return 'offline';
      case 'error':
        return 'error';
    }
  };

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
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Connection status with refresh button */}
            <div className="flex items-center gap-2">
              <StatusDot
                status={getStatusType()}
                label={getStatusLabel()}
                pulse={connectionStatus === 'checking'}
              />
              <button
                onClick={checkConnection}
                className={cn(
                  'p-1 text-cyber-text-muted hover:text-cyber-cyan transition-colors',
                  connectionStatus === 'checking' && 'animate-spin'
                )}
                title="Refresh connection status"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* Port info */}
            <div className="hidden sm:flex items-center gap-1 text-cyber-text-secondary">
              <span className="text-cyber-text-muted">PORT:</span>
              <span className={connectionStatus === 'connected' ? 'text-cyber-success' : 'text-cyber-text-muted'}>
                {socketPort}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-cyber-text-secondary">
              <span className="text-cyber-text-muted">CYCLE:</span>
              <span className="text-cyber-cyan">{cycleCount}</span>
            </div>
            <div className="hidden sm:block text-cyber-warning">
              {currentTime}
            </div>
          </div>
        </div>

        {/* Connection warning banner */}
        {connectionStatus === 'disconnected' && (
          <div className="mt-2 px-3 py-2 bg-cyber-warning/10 border border-cyber-warning/30 text-cyber-warning text-xs font-mono">
            Not connected to Codebolt server. Make sure Codebolt is running on port {socketPort}.
          </div>
        )}
        {connectionStatus === 'error' && (
          <div className="mt-2 px-3 py-2 bg-cyber-error/10 border border-cyber-error/30 text-cyber-error text-xs font-mono">
            Failed to check connection status. API endpoint may be unavailable.
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
