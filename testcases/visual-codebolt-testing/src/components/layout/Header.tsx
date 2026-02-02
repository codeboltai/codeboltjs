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
    <header
      className="border-b bg-cyber-bg-primary/95 backdrop-blur-sm sticky top-0 z-50"
      style={{ borderColor: '#00d4ff40' }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6" style={{ color: '#00d4ff' }} />
              <h1 className="text-lg font-mono font-bold tracking-wider" style={{ color: '#00d4ff' }}>
                CODEBOLT<span style={{ color: '#a855f7' }}>_JS_</span>TESTER
              </h1>
            </div>
            <span className="text-xs font-mono" style={{ color: '#10b981' }}>v2.0</span>
            <div
              className="hidden md:flex items-center gap-1 px-2 py-1 border bg-cyber-bg-secondary"
              style={{ borderColor: '#a855f740' }}
            >
              <span className="text-xs font-mono" style={{ color: '#a855f7' }}>
                {moduleCount} MODULES
              </span>
              <span style={{ color: '#484f58' }}>|</span>
              <span className="text-xs font-mono" style={{ color: '#10b981' }}>
                {functionCount} FUNCTIONS
              </span>
            </div>
          </div>

          {/* Center - Search shortcut */}
          <button
            onClick={onSearchClick}
            className="hidden md:flex items-center gap-2 px-4 py-1.5 border bg-cyber-bg-secondary hover:opacity-80 transition-colors"
            style={{ borderColor: '#3b82f640' }}
          >
            <Search className="w-4 h-4" style={{ color: '#3b82f6' }} />
            <span className="text-xs font-mono" style={{ color: '#8b949e' }}>Search functions...</span>
            <kbd
              className="px-1.5 py-0.5 text-[10px] font-mono rounded"
              style={{ backgroundColor: '#00d4ff20', borderColor: '#00d4ff40', color: '#00d4ff', border: '1px solid' }}
            >
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
                  'p-1 transition-colors',
                  connectionStatus === 'checking' && 'animate-spin'
                )}
                style={{ color: connectionStatus === 'checking' ? '#f59e0b' : '#00d4ff' }}
                title="Refresh connection status"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* Port info */}
            <div className="hidden sm:flex items-center gap-1">
              <span style={{ color: '#8b949e' }}>PORT:</span>
              <span style={{ color: connectionStatus === 'connected' ? '#10b981' : '#8b949e' }}>
                {socketPort}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1">
              <span style={{ color: '#8b949e' }}>CYCLE:</span>
              <span style={{ color: '#a855f7' }}>{cycleCount}</span>
            </div>
            <div className="hidden sm:block" style={{ color: '#f59e0b' }}>
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
