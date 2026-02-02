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

// Category-specific colors for visual distinction (using hex values for reliability)
const categoryColors: Record<string, { color: string; badge: 'cyan' | 'purple' | 'success' | 'error' | 'warning' | 'info' | 'muted' }> = {
  'file-system': { color: '#00d4ff', badge: 'cyan' },
  'browser': { color: '#a855f7', badge: 'purple' },
  'communication': { color: '#10b981', badge: 'success' },
  'git': { color: '#f59e0b', badge: 'warning' },
  'ai-llm': { color: '#a855f7', badge: 'purple' },
  'agents': { color: '#3b82f6', badge: 'info' },
  'jobs-tasks': { color: '#f59e0b', badge: 'warning' },
  'memory': { color: '#10b981', badge: 'success' },
  'project': { color: '#00d4ff', badge: 'cyan' },
  'testing': { color: '#ef4444', badge: 'error' },
  'calendar': { color: '#a855f7', badge: 'purple' },
  'search': { color: '#f59e0b', badge: 'warning' },
  'config': { color: '#3b82f6', badge: 'info' },
  'orchestration': { color: '#00d4ff', badge: 'cyan' },
  'review': { color: '#10b981', badge: 'success' },
  'utilities': { color: '#f59e0b', badge: 'warning' },
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

  const renderFunction = (module: CodeboltModule, fn: CodeboltFunction, categoryColor: string) => {
    const isSelected = selectedModule === module.name && selectedFunction === fn.name;

    return (
      <button
        key={fn.name}
        onClick={() => handleFunctionClick(module.name, fn.name)}
        className={cn(
          'w-full text-left px-3 py-1.5 text-xs font-mono transition-all duration-150',
          'border-l-2 ml-4 hover:bg-cyber-bg-tertiary'
        )}
        style={{
          borderColor: isSelected ? categoryColor : 'transparent',
          backgroundColor: isSelected ? `${categoryColor}15` : undefined,
          color: isSelected ? categoryColor : '#8b949e',
        }}
      >
        <div className="truncate">{fn.name}</div>
      </button>
    );
  };

  const renderModule = (module: CodeboltModule, categoryColor: string) => {
    const isExpanded = expandedModules.has(module.name);
    const hasSelectedFunction = selectedModule === module.name;

    return (
      <div key={module.name} className="ml-2">
        <button
          onClick={() => toggleModule(module.name)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-mono transition-colors duration-150"
          style={{ color: hasSelectedFunction ? categoryColor : (isExpanded ? '#e6edf3' : '#8b949e') }}
        >
          <span style={{ color: isExpanded ? categoryColor : '#484f58' }}>
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
            )}
          </span>
          <span className="truncate flex-1 text-left">{module.displayName}</span>
          <CyberBadge variant={isExpanded ? 'cyan' : 'muted'} size="sm">
            {module.functions.length}
          </CyberBadge>
        </button>

        {isExpanded && (
          <div className="mt-1 space-y-0.5">
            {module.functions.map(fn => renderFunction(module, fn, categoryColor))}
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
    const colors = categoryColors[category.id] || { color: '#00d4ff', badge: 'cyan' as const };

    return (
      <div key={category.id} className="mb-1">
        <button
          onClick={() => toggleCategory(category.id)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-sm font-mono',
            'border border-transparent transition-all duration-150',
            isExpanded
              ? 'bg-cyber-bg-tertiary border-cyber-border'
              : 'hover:bg-cyber-bg-tertiary'
          )}
          style={{ color: isExpanded ? colors.color : '#8b949e' }}
        >
          <span style={{ color: isExpanded ? colors.color : '#484f58' }}>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
          </span>
          <span style={{ color: colors.color }}>
            <Icon className="w-4 h-4 flex-shrink-0" />
          </span>
          <span className="truncate flex-1 text-left uppercase tracking-wide">
            {category.name}
          </span>
          <CyberBadge variant={isExpanded ? colors.badge : 'muted'} size="sm">
            {totalFunctions}
          </CyberBadge>
        </button>

        {isExpanded && (
          <div
            className="mt-1 pb-2 space-y-1 border-l ml-4"
            style={{ borderColor: `${colors.color}40` }}
          >
            {modules.map(module => renderModule(module, colors.color))}
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
