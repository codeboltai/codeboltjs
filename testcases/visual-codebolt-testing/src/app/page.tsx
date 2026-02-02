'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FunctionForm from '@/components/form/FunctionForm';
import SearchCommand from '@/components/navigation/SearchCommand';
import CyberCard from '@/components/ui/CyberCard';
import { CodeboltAPI } from '@/lib/modules';
import { Zap, Terminal, Database, Bot, Layers } from 'lucide-react';

export default function Home() {
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState(false);

  const handleFunctionSelect = (moduleName: string, functionName: string) => {
    setSelectedModule(moduleName);
    setSelectedFunction(functionName);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd+K or Ctrl+K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const moduleCount = CodeboltAPI.getModuleCount();
  const functionCount = CodeboltAPI.getTotalFunctionCount();
  const categories = CodeboltAPI.getCategories();

  return (
    <div className="min-h-screen bg-cyber-bg-primary text-cyber-text-primary">
      {/* Scanline effect overlay */}
      <div className="scanlines pointer-events-none" />

      {/* Header */}
      <Header onSearchClick={() => setSearchOpen(true)} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Sidebar */}
        <Sidebar
          onFunctionSelect={handleFunctionSelect}
          selectedModule={selectedModule}
          selectedFunction={selectedFunction}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {selectedModule && selectedFunction ? (
            <FunctionForm
              moduleName={selectedModule}
              functionName={selectedFunction}
            />
          ) : (
            <WelcomeScreen
              moduleCount={moduleCount}
              functionCount={functionCount}
              categoryCount={categories.length}
              onSearchClick={() => setSearchOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Search Command Modal */}
      <SearchCommand
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleFunctionSelect}
      />
    </div>
  );
}

interface WelcomeScreenProps {
  moduleCount: number;
  functionCount: number;
  categoryCount: number;
  onSearchClick: () => void;
}

function WelcomeScreen({
  moduleCount,
  functionCount,
  categoryCount,
  onSearchClick,
}: WelcomeScreenProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <CyberCard variant="cyan">
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 border border-cyber-cyan/40 bg-cyber-cyan/10">
              <Zap className="w-12 h-12 text-cyber-cyan" />
            </div>
          </div>
          <h1 className="text-2xl font-mono font-bold text-cyber-cyan mb-2">
            CODEBOLT JS TESTING TERMINAL
          </h1>
          <p className="text-cyber-text-secondary font-mono text-sm mb-6">
            Interactive testing interface for the CodeboltJS SDK
          </p>
          <button
            onClick={onSearchClick}
            className="inline-flex items-center gap-2 px-6 py-3 border border-cyber-cyan text-cyber-cyan font-mono hover:bg-cyber-cyan hover:text-cyber-bg-primary transition-colors"
          >
            Press <kbd className="px-2 py-1 bg-cyber-bg-tertiary border border-cyber-border rounded mx-1">Cmd+K</kbd> to search functions
          </button>
        </div>
      </CyberCard>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <CyberCard variant="muted" noPadding>
          <div className="p-4 text-center">
            <Database className="w-8 h-8 text-cyber-cyan mx-auto mb-2" />
            <div className="text-3xl font-mono font-bold text-cyber-cyan">{moduleCount}</div>
            <div className="text-xs font-mono text-cyber-text-muted uppercase">Modules</div>
          </div>
        </CyberCard>
        <CyberCard variant="muted" noPadding>
          <div className="p-4 text-center">
            <Terminal className="w-8 h-8 text-cyber-success mx-auto mb-2" />
            <div className="text-3xl font-mono font-bold text-cyber-success">{functionCount}</div>
            <div className="text-xs font-mono text-cyber-text-muted uppercase">Functions</div>
          </div>
        </CyberCard>
        <CyberCard variant="muted" noPadding>
          <div className="p-4 text-center">
            <Layers className="w-8 h-8 text-cyber-warning mx-auto mb-2" />
            <div className="text-3xl font-mono font-bold text-cyber-warning">{categoryCount}</div>
            <div className="text-xs font-mono text-cyber-text-muted uppercase">Categories</div>
          </div>
        </CyberCard>
      </div>

      {/* Quick start */}
      <div className="grid grid-cols-2 gap-4">
        <CyberCard title="GETTING STARTED" variant="muted">
          <ul className="space-y-3 text-sm font-mono">
            <li className="flex items-start gap-2">
              <span className="text-cyber-cyan">01.</span>
              <span className="text-cyber-text-secondary">Select a category from the sidebar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyber-cyan">02.</span>
              <span className="text-cyber-text-secondary">Expand a module to see its functions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyber-cyan">03.</span>
              <span className="text-cyber-text-secondary">Click a function to open the test form</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyber-cyan">04.</span>
              <span className="text-cyber-text-secondary">Fill in parameters and execute</span>
            </li>
          </ul>
        </CyberCard>

        <CyberCard title="KEYBOARD SHORTCUTS" variant="muted">
          <ul className="space-y-3 text-sm font-mono">
            <li className="flex items-center justify-between">
              <span className="text-cyber-text-secondary">Open search</span>
              <kbd className="px-2 py-1 text-xs bg-cyber-bg-tertiary border border-cyber-border rounded">Cmd+K</kbd>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-cyber-text-secondary">Navigate results</span>
              <kbd className="px-2 py-1 text-xs bg-cyber-bg-tertiary border border-cyber-border rounded">↑ ↓</kbd>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-cyber-text-secondary">Select function</span>
              <kbd className="px-2 py-1 text-xs bg-cyber-bg-tertiary border border-cyber-border rounded">Enter</kbd>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-cyber-text-secondary">Close modal</span>
              <kbd className="px-2 py-1 text-xs bg-cyber-bg-tertiary border border-cyber-border rounded">Esc</kbd>
            </li>
          </ul>
        </CyberCard>
      </div>

      {/* Module categories preview */}
      <CyberCard title="MODULE CATEGORIES" variant="muted" subtitle="Available in this build">
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: 'File System', icon: '📁', count: 3 },
            { name: 'Browser', icon: '🌐', count: 2 },
            { name: 'Communication', icon: '💬', count: 3 },
            { name: 'Git', icon: '📦', count: 1 },
            { name: 'AI & LLM', icon: '🧠', count: 2 },
            { name: 'Agents', icon: '🤖', count: 5 },
            { name: 'Jobs & Tasks', icon: '📋', count: 6 },
            { name: 'Memory', icon: '💾', count: 6 },
            { name: 'Project', icon: '📊', count: 5 },
            { name: 'Testing', icon: '🧪', count: 1 },
            { name: 'Calendar', icon: '📅', count: 3 },
            { name: 'Search', icon: '🔍', count: 3 },
            { name: 'Config', icon: '⚙️', count: 4 },
            { name: 'Orchestration', icon: '🔗', count: 3 },
            { name: 'Review', icon: '✅', count: 4 },
            { name: 'Utilities', icon: '🔧', count: 5 },
          ].map((cat) => (
            <div
              key={cat.name}
              className="flex items-center gap-2 px-3 py-2 border border-cyber-border bg-cyber-bg-tertiary/50 hover:border-cyber-cyan/50 transition-colors"
            >
              <span>{cat.icon}</span>
              <span className="text-xs font-mono text-cyber-text-secondary truncate">{cat.name}</span>
              <span className="text-[10px] font-mono text-cyber-text-muted ml-auto">{cat.count}</span>
            </div>
          ))}
        </div>
      </CyberCard>
    </div>
  );
}
