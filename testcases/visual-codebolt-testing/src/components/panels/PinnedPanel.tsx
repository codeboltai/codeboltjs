'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import CyberCard from '../ui/CyberCard';
import { Pin, X } from 'lucide-react';

export interface PinnedFunction {
  moduleName: string;
  functionName: string;
}

interface PinnedPanelProps {
  pinnedFunctions: PinnedFunction[];
  onUnpin: (moduleName: string, functionName: string) => void;
  onSelect: (moduleName: string, functionName: string) => void;
  selectedModule?: string;
  selectedFunction?: string;
}

// Module color mapping for visual distinction
const moduleColors: Record<string, string> = {
  fs: '#00d4ff',
  browser: '#a855f7',
  chat: '#10b981',
  git: '#f59e0b',
  llm: '#a855f7',
  mcp: '#3b82f6',
  agent: '#3b82f6',
  swarm: '#3b82f6',
  job: '#f59e0b',
  task: '#f59e0b',
  todo: '#f59e0b',
  memory: '#10b981',
  project: '#00d4ff',
  autoTesting: '#ef4444',
  calendar: '#a855f7',
  search: '#f59e0b',
  terminal: '#10b981',
  mail: '#10b981',
  codeutils: '#00d4ff',
};

const getModuleColor = (moduleName: string): string => {
  return moduleColors[moduleName] || '#8b949e';
};

const PinnedPanel: React.FC<PinnedPanelProps> = ({
  pinnedFunctions,
  onUnpin,
  onSelect,
  selectedModule,
  selectedFunction,
}) => {
  if (pinnedFunctions.length === 0) {
    return null;
  }

  return (
    <CyberCard
      title="PINNED FUNCTIONS"
      variant="purple"
      subtitle={`${pinnedFunctions.length} pinned`}
      headerRight={
        <div className="flex items-center gap-1">
          <Pin className="w-4 h-4" style={{ color: '#a855f7' }} />
        </div>
      }
    >
      <div className="flex flex-wrap gap-2">
        {pinnedFunctions.map((pinned) => {
          const isSelected = selectedModule === pinned.moduleName && selectedFunction === pinned.functionName;
          const color = getModuleColor(pinned.moduleName);

          return (
            <div
              key={`${pinned.moduleName}.${pinned.functionName}`}
              className={cn(
                'group relative flex items-center gap-1.5 px-3 py-2 border transition-all cursor-pointer',
                'hover:opacity-90'
              )}
              style={{
                borderColor: isSelected ? color : `${color}40`,
                backgroundColor: isSelected ? `${color}20` : `${color}10`,
              }}
              onClick={() => onSelect(pinned.moduleName, pinned.functionName)}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: color }}
                />
              )}

              <span className="text-xs font-mono" style={{ color: color }}>
                {pinned.moduleName}
              </span>
              <span style={{ color: '#484f58' }}>.</span>
              <span className="text-xs font-mono font-medium" style={{ color: '#e6edf3' }}>
                {pinned.functionName}
              </span>

              {/* Unpin button on hover */}
              {/* <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnpin(pinned.moduleName, pinned.functionName);
                }}
                className="ml-1 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 rounded"
                title="Unpin"
              >
                <X className="w-3 h-3" style={{ color: '#ef4444' }} />
              </button> */}
            </div>
          );
        })}
      </div>
    </CyberCard>
  );
};

export default PinnedPanel;
