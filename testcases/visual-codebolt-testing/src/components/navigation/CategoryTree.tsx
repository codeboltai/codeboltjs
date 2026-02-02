'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { CodeboltAPI, ModuleCategory, CodeboltModule, CodeboltFunction } from '@/lib/modules';
import { ChevronDown, ChevronRight, FolderOpen, Globe, MessageSquare, GitBranch, Brain, Bot, ListTodo, Database, FolderKanban, TestTube, Calendar, Search, Settings, Network, GitPullRequest, Wrench } from 'lucide-react';
import CyberBadge from '../ui/CyberBadge';

interface CategoryTreeProps {
  onFunctionSelect: (moduleName: string, functionName: string) => void;
  selectedModule?: string;
  selectedFunction?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FolderOpen,
  Globe,
  MessageSquare,
  GitBranch,
  Brain,
  Bot,
  ListTodo,
  Database,
  FolderKanban,
  TestTube,
  Calendar,
  Search,
  Settings,
  Network,
  GitPullRequest,
  Wrench,
};

const CategoryTree: React.FC<CategoryTreeProps> = ({
  onFunctionSelect,
  selectedModule,
  selectedFunction,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['file-system']));
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const categories = CodeboltAPI.getCategories();

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

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
    onFunctionSelect(moduleName, functionName);
  };

  const renderFunction = (module: CodeboltModule, fn: CodeboltFunction) => {
    const isSelected = selectedModule === module.name && selectedFunction === fn.name;

    return (
      <button
        key={fn.name}
        onClick={() => handleFunctionClick(module.name, fn.name)}
        className={cn(
          'w-full text-left px-3 py-1.5 text-xs font-mono transition-all duration-150',
          'border-l-2 ml-4',
          isSelected
            ? 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan'
            : 'border-transparent hover:border-cyber-cyan/50 hover:bg-cyber-bg-tertiary text-cyber-text-secondary hover:text-cyber-text-primary'
        )}
      >
        <div className="truncate">{fn.name}</div>
      </button>
    );
  };

  const renderModule = (module: CodeboltModule) => {
    const isExpanded = expandedModules.has(module.name);
    const hasSelectedFunction = selectedModule === module.name;

    return (
      <div key={module.name} className="ml-2">
        <button
          onClick={() => toggleModule(module.name)}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 text-xs font-mono',
            'transition-colors duration-150',
            hasSelectedFunction
              ? 'text-cyber-cyan'
              : 'text-cyber-text-secondary hover:text-cyber-text-primary'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
          )}
          <span className="truncate flex-1 text-left">{module.displayName}</span>
          <CyberBadge variant="muted" size="sm">
            {module.functions.length}
          </CyberBadge>
        </button>

        {isExpanded && (
          <div className="mt-1 space-y-0.5">
            {module.functions.map(fn => renderFunction(module, fn))}
          </div>
        )}
      </div>
    );
  };

  const renderCategory = (category: ModuleCategory) => {
    const isExpanded = expandedCategories.has(category.id);
    const modules = CodeboltAPI.getModulesByCategory(category.id);
    const totalFunctions = modules.reduce((acc, m) => acc + m.functions.length, 0);
    const Icon = iconMap[category.icon] || FolderOpen;

    return (
      <div key={category.id} className="mb-1">
        <button
          onClick={() => toggleCategory(category.id)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-sm font-mono',
            'border border-transparent transition-all duration-150',
            isExpanded
              ? 'bg-cyber-bg-tertiary border-cyber-cyan/30 text-cyber-cyan'
              : 'hover:bg-cyber-bg-tertiary text-cyber-text-secondary hover:text-cyber-text-primary'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 flex-shrink-0 text-cyber-cyan" />
          ) : (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          )}
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate flex-1 text-left uppercase tracking-wide">
            {category.name}
          </span>
          <CyberBadge variant={isExpanded ? 'cyan' : 'muted'} size="sm">
            {totalFunctions}
          </CyberBadge>
        </button>

        {isExpanded && (
          <div className="mt-1 pb-2 space-y-1 border-l border-cyber-border ml-4">
            {modules.map(module => renderModule(module))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {categories.map(category => renderCategory(category))}
    </div>
  );
};

export default CategoryTree;
