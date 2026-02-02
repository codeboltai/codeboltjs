'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FunctionForm from '@/components/form/FunctionForm';
import SearchCommand from '@/components/navigation/SearchCommand';
import PinnedPanel, { PinnedFunction } from '@/components/panels/PinnedPanel';
import CyberCard from '@/components/ui/CyberCard';
import { CodeboltAPI } from '@/lib/modules';
import { Zap, Terminal, Database, Bot, Layers, FolderOpen, Globe, MessageSquare, GitBranch, Brain, ListTodo, FolderKanban, TestTube, Calendar, Search, Settings, Network, GitPullRequest, Wrench } from 'lucide-react';

const PINNED_STORAGE_KEY = 'codebolt-pinned-functions';

export default function Home() {
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [pinnedFunctions, setPinnedFunctions] = useState<PinnedFunction[]>([]);

  // Load pinned functions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PINNED_STORAGE_KEY);
      if (stored) {
        setPinnedFunctions(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load pinned functions:', e);
    }
  }, []);

  // Save pinned functions to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedFunctions));
    } catch (e) {
      console.error('Failed to save pinned functions:', e);
    }
  }, [pinnedFunctions]);

  const handleFunctionSelect = (moduleName: string, functionName: string) => {
    setSelectedModule(moduleName);
    setSelectedFunction(functionName);
  };

  const handlePinFunction = (moduleName: string, functionName: string) => {
    setPinnedFunctions(prev => {
      const exists = prev.some(p => p.moduleName === moduleName && p.functionName === functionName);
      if (exists) return prev;
      return [...prev, { moduleName, functionName }];
    });
  };

  const handleUnpinFunction = (moduleName: string, functionName: string) => {
    setPinnedFunctions(prev =>
      prev.filter(p => !(p.moduleName === moduleName && p.functionName === functionName))
    );
  };

  const isPinned = (moduleName: string, functionName: string) => {
    return pinnedFunctions.some(p => p.moduleName === moduleName && p.functionName === functionName);
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
          <div className="space-y-4">
            {/* Pinned Functions Panel */}
            <PinnedPanel
              pinnedFunctions={pinnedFunctions}
              onUnpin={handleUnpinFunction}
              onSelect={handleFunctionSelect}
              selectedModule={selectedModule}
              selectedFunction={selectedFunction}
            />

            {/* Main Content */}
            {selectedModule && selectedFunction ? (
              <FunctionForm
                moduleName={selectedModule}
                functionName={selectedFunction}
                isPinned={isPinned(selectedModule, selectedFunction)}
                onPin={handlePinFunction}
                onUnpin={handleUnpinFunction}
              />
            ) : (
              <WelcomeScreen
                moduleCount={moduleCount}
                functionCount={functionCount}
                categoryCount={categories.length}
                onSearchClick={() => setSearchOpen(true)}
              />
            )}
          </div>
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

function CategoryPreview({ name, Icon, count, color }: { name: string; Icon: React.ComponentType<{ className?: string }>; count: number; color: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 border transition-colors hover:opacity-80"
      style={{
        borderColor: `${color}50`,
        backgroundColor: `${color}10`,
        color: color
      }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-xs font-mono truncate">{name}</span>
      <span className="text-[10px] font-mono opacity-70 ml-auto">{count}</span>
    </div>
  );
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
              <span style={{ color: '#00d4ff' }} className="font-bold">01.</span>
              <span style={{ color: '#e6edf3' }}>Select a <span style={{ color: '#a855f7' }}>category</span> from the sidebar</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: '#10b981' }} className="font-bold">02.</span>
              <span style={{ color: '#e6edf3' }}>Expand a <span style={{ color: '#f59e0b' }}>module</span> to see its functions</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: '#f59e0b' }} className="font-bold">03.</span>
              <span style={{ color: '#e6edf3' }}>Click a <span style={{ color: '#00d4ff' }}>function</span> to open the test form</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: '#a855f7' }} className="font-bold">04.</span>
              <span style={{ color: '#e6edf3' }}>Fill in <span style={{ color: '#10b981' }}>parameters</span> and execute</span>
            </li>
          </ul>
        </CyberCard>

        <CyberCard title="KEYBOARD SHORTCUTS" variant="muted">
          <ul className="space-y-3 text-sm font-mono">
            <li className="flex items-center justify-between">
              <span style={{ color: '#e6edf3' }}>Open search</span>
              <kbd className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#00d4ff20', borderColor: '#00d4ff50', color: '#00d4ff', borderWidth: '1px' }}>Cmd+K</kbd>
            </li>
            <li className="flex items-center justify-between">
              <span style={{ color: '#e6edf3' }}>Navigate results</span>
              <kbd className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#a855f720', borderColor: '#a855f750', color: '#a855f7', borderWidth: '1px' }}>↑ ↓</kbd>
            </li>
            <li className="flex items-center justify-between">
              <span style={{ color: '#e6edf3' }}>Select function</span>
              <kbd className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#10b98120', borderColor: '#10b98150', color: '#10b981', borderWidth: '1px' }}>Enter</kbd>
            </li>
            <li className="flex items-center justify-between">
              <span style={{ color: '#e6edf3' }}>Close modal</span>
              <kbd className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#f59e0b20', borderColor: '#f59e0b50', color: '#f59e0b', borderWidth: '1px' }}>Esc</kbd>
            </li>
          </ul>
        </CyberCard>
      </div>

      {/* Module categories preview */}
      <CyberCard title="MODULE CATEGORIES" variant="muted" subtitle="Available in this build">
        <div className="grid grid-cols-4 gap-3">
          <CategoryPreview name="File System" Icon={FolderOpen} count={3} color="#00d4ff" />
          <CategoryPreview name="Browser" Icon={Globe} count={2} color="#a855f7" />
          <CategoryPreview name="Communication" Icon={MessageSquare} count={3} color="#10b981" />
          <CategoryPreview name="Git" Icon={GitBranch} count={1} color="#f59e0b" />
          <CategoryPreview name="AI & LLM" Icon={Brain} count={2} color="#a855f7" />
          <CategoryPreview name="Agents" Icon={Bot} count={5} color="#3b82f6" />
          <CategoryPreview name="Jobs & Tasks" Icon={ListTodo} count={6} color="#f59e0b" />
          <CategoryPreview name="Memory" Icon={Database} count={6} color="#10b981" />
          <CategoryPreview name="Project" Icon={FolderKanban} count={5} color="#00d4ff" />
          <CategoryPreview name="Testing" Icon={TestTube} count={1} color="#ef4444" />
          <CategoryPreview name="Calendar" Icon={Calendar} count={3} color="#a855f7" />
          <CategoryPreview name="Search" Icon={Search} count={3} color="#f59e0b" />
          <CategoryPreview name="Config" Icon={Settings} count={4} color="#3b82f6" />
          <CategoryPreview name="Orchestration" Icon={Network} count={3} color="#00d4ff" />
          <CategoryPreview name="Review" Icon={GitPullRequest} count={4} color="#10b981" />
          <CategoryPreview name="Utilities" Icon={Wrench} count={5} color="#f59e0b" />
        </div>
      </CyberCard>
    </div>
  );
}
