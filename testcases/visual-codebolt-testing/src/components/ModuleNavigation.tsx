'use client';

import React, { useState } from 'react';
import { CodeboltAPI, CodeboltModule } from '@/lib/codeboltjs';
import TerminalButton from './ui/TerminalButton';
import TerminalCard from './ui/TerminalCard';

interface ModuleNavigationProps {
  onModuleSelect: (moduleName: string, functionName: string) => void;
  selectedModule?: string;
  selectedFunction?: string;
}

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  onModuleSelect,
  selectedModule,
  selectedFunction,
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const modules = CodeboltAPI.getModules();

  const toggleModule = (moduleName: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleName)) {
      newExpanded.delete(moduleName);
    } else {
      newExpanded.add(moduleName);
    }
    setExpandedModules(newExpanded);
  };

  const handleFunctionClick = (moduleName: string, functionName: string) => {
    onModuleSelect(moduleName, functionName);
  };

  return (
    <TerminalCard title="MODULES" variant="blue" className="h-full">
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {modules.map((module) => (
          <div key={module.name} className="border border-cyber-blue/30 rounded">
            <TerminalButton
              onClick={() => toggleModule(module.name)}
              variant="blue"
              size="sm"
              className="w-full justify-start text-left"
            >
              <span className="flex items-center justify-between w-full">
                <span>{module.name}</span>
                <span className="text-xs">
                  {expandedModules.has(module.name) ? '▼' : '▶'}
                </span>
              </span>
            </TerminalButton>
            
            {expandedModules.has(module.name) && (
              <div className="ml-4 mt-2 space-y-1 pb-2">
                {module.functions.map((func) => (
                  <TerminalButton
                    key={func.name}
                    onClick={() => handleFunctionClick(module.name, func.name)}
                    variant={
                      selectedModule === module.name && selectedFunction === func.name
                        ? 'green'
                        : 'orange'
                    }
                    size="sm"
                    className="w-full justify-start text-left text-xs"
                  >
                    <div className="w-full">
                      <div>{func.name}</div>
                      <div className="text-xs opacity-70 truncate">
                        {func.description}
                      </div>
                    </div>
                  </TerminalButton>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </TerminalCard>
  );
};

export default ModuleNavigation;
