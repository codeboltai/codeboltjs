'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import CategoryTree from '../navigation/CategoryTree';
import CyberCard from '../ui/CyberCard';

interface SidebarProps {
  onFunctionSelect: (moduleName: string, functionName: string) => void;
  selectedModule?: string;
  selectedFunction?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  onFunctionSelect,
  selectedModule,
  selectedFunction,
}) => {
  return (
    <aside className="w-80 border-r border-cyber-border bg-cyber-bg-secondary/50 flex flex-col h-full">
      <div className="p-3 border-b border-cyber-cyan/30 bg-cyber-bg-tertiary/30">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: '#00d4ff' }}>
            CATEGORIES
          </h2>
          <span className="text-[10px] font-mono" style={{ color: '#a855f7' }}>
            NAV_PANEL
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <CategoryTree
          onFunctionSelect={onFunctionSelect}
          selectedModule={selectedModule}
          selectedFunction={selectedFunction}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
