'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CodeboltAPI, CodeboltModule, CodeboltFunction } from '@/lib/modules';
import { Search, X, ArrowRight } from 'lucide-react';

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (moduleName: string, functionName: string) => void;
}

interface SearchResult {
  module: CodeboltModule;
  function: CodeboltFunction;
}

const SearchCommand: React.FC<SearchCommandProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = CodeboltAPI.searchFunctions(query).slice(0, 20);
      setResults(searchResults);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          const result = results[selectedIndex];
          onSelect(result.module.name, result.function.name);
          onClose();
        }
        break;
    }
  }, [isOpen, results, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Scroll selected item into view
    if (listRef.current && results.length > 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, results.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-cyber-bg-primary/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-2xl mx-4',
        'border border-cyber-cyan/40 bg-cyber-bg-secondary shadow-cyber-strong',
        'animate-fade-in'
      )}>
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan" />

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-cyber-border">
          <Search className="w-5 h-5 text-cyber-cyan" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search functions across all modules..."
            className={cn(
              'flex-1 bg-transparent text-cyber-text-primary font-mono text-sm',
              'placeholder:text-cyber-text-muted focus:outline-none'
            )}
          />
          <button
            onClick={onClose}
            className="p-1 text-cyber-text-muted hover:text-cyber-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[50vh] overflow-y-auto"
        >
          {results.length === 0 && query.trim() && (
            <div className="px-4 py-8 text-center text-cyber-text-muted font-mono text-sm">
              No functions found for "{query}"
            </div>
          )}

          {results.length === 0 && !query.trim() && (
            <div className="px-4 py-8 text-center text-cyber-text-muted font-mono text-sm">
              Start typing to search {CodeboltAPI.getTotalFunctionCount()} functions...
            </div>
          )}

          {results.map((result, index) => (
            <button
              key={`${result.module.name}-${result.function.name}`}
              onClick={() => {
                onSelect(result.module.name, result.function.name);
                onClose();
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                'border-l-2',
                index === selectedIndex
                  ? 'bg-cyber-cyan/10 border-cyber-cyan'
                  : 'border-transparent hover:bg-cyber-bg-tertiary'
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyber-text-muted uppercase">
                    {result.module.displayName}
                  </span>
                  <ArrowRight className="w-3 h-3 text-cyber-text-muted" />
                  <span className={cn(
                    'font-mono font-medium',
                    index === selectedIndex ? 'text-cyber-cyan' : 'text-cyber-text-primary'
                  )}>
                    {result.function.name}
                  </span>
                </div>
                <p className="text-xs text-cyber-text-muted truncate mt-0.5">
                  {result.function.description}
                </p>
              </div>
              <div className="text-xs font-mono text-cyber-text-muted">
                {result.function.parameters.length} params
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-cyber-border text-xs font-mono text-cyber-text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-cyber-bg-tertiary border border-cyber-border rounded">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-cyber-bg-tertiary border border-cyber-border rounded">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-cyber-bg-tertiary border border-cyber-border rounded">esc</kbd>
              close
            </span>
          </div>
          {results.length > 0 && (
            <span>{results.length} results</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchCommand;
