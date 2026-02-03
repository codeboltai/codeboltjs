'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface ThreePaneLayoutProps {
  sidebar: React.ReactNode;
  executionPane: React.ReactNode;
  contextPane: React.ReactNode;
  sidebarWidth?: number;
  executionPaneWidth?: number;
}

const ThreePaneLayout: React.FC<ThreePaneLayoutProps> = ({
  sidebar,
  executionPane,
  contextPane,
  sidebarWidth = 240,
  executionPaneWidth = 400,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isContextPaneCollapsed, setIsContextPaneCollapsed] = useState(false);

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'border-r border-cyber-border bg-cyber-bg-secondary/50 flex flex-col transition-all duration-300 overflow-hidden',
          isSidebarCollapsed ? 'w-0' : ''
        )}
        style={{ width: isSidebarCollapsed ? 0 : sidebarWidth }}
      >
        {!isSidebarCollapsed && sidebar}
      </aside>

      {/* Sidebar collapse toggle */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute left-0 top-1/2 z-20 p-1 border border-l-0 bg-cyber-bg-secondary hover:bg-cyber-bg-tertiary transition-colors"
        style={{
          borderColor: '#00d4ff40',
          transform: 'translateY(-50%)',
          left: isSidebarCollapsed ? 0 : sidebarWidth - 1,
        }}
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isSidebarCollapsed ? (
          <PanelLeftOpen className="w-4 h-4" style={{ color: '#00d4ff' }} />
        ) : (
          <PanelLeftClose className="w-4 h-4" style={{ color: '#00d4ff' }} />
        )}
      </button>

      {/* Execution Pane */}
      <div
        className="border-r border-cyber-border bg-cyber-bg-primary overflow-y-auto flex-shrink-0"
        style={{ width: executionPaneWidth }}
      >
        <div className="p-4">
          {executionPane}
        </div>
      </div>

      {/* Resizer between Execution and Context panes */}
      <div
        className="w-1 bg-cyber-border hover:bg-cyber-cyan cursor-col-resize flex-shrink-0 transition-colors"
        style={{ minWidth: 4 }}
      />

      {/* Context Pane */}
      <div
        className={cn(
          'flex-1 bg-cyber-bg-primary overflow-hidden flex flex-col transition-all duration-300',
          isContextPaneCollapsed ? 'w-0 flex-none' : ''
        )}
        style={{ minWidth: isContextPaneCollapsed ? 0 : 300 }}
      >
        {!isContextPaneCollapsed && contextPane}
      </div>

      {/* Context pane collapse toggle (when collapsed) */}
      {isContextPaneCollapsed && (
        <button
          onClick={() => setIsContextPaneCollapsed(false)}
          className="p-2 border border-r-0 bg-cyber-bg-secondary hover:bg-cyber-bg-tertiary transition-colors"
          style={{ borderColor: '#a855f740' }}
          title="Expand context pane"
        >
          <span className="writing-mode-vertical text-xs font-mono" style={{ color: '#a855f7' }}>
            CONTEXT
          </span>
        </button>
      )}
    </div>
  );
};

export default ThreePaneLayout;
