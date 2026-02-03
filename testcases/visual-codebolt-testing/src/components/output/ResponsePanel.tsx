'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import CyberCard from '../ui/CyberCard';
import CyberButton from '../ui/CyberButton';
import { Copy, Check, ChevronDown, ChevronRight, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

interface ResponsePanelProps {
  result?: unknown;
  error?: string;
  moduleName: string;
  functionName: string;
  parameters?: Record<string, string>;
  onAddToContext?: (role: 'tool_call' | 'tool_response', content: unknown, metadata?: {
    toolName?: string;
    moduleName?: string;
    functionName?: string;
    parameters?: Record<string, unknown>;
  }) => void;
}

interface JsonNodeProps {
  data: unknown;
  name?: string;
  depth?: number;
}

const JsonNode: React.FC<JsonNodeProps> = ({ data, name, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  if (data === null) {
    return (
      <span style={{ color: '#a855f7' }}>null</span>
    );
  }

  if (data === undefined) {
    return (
      <span style={{ color: '#8b949e' }}>undefined</span>
    );
  }

  if (typeof data === 'boolean') {
    return (
      <span style={{ color: data ? '#10b981' : '#ef4444' }}>
        {String(data)}
      </span>
    );
  }

  if (typeof data === 'number') {
    return (
      <span style={{ color: '#00d4ff' }}>{data}</span>
    );
  }

  if (typeof data === 'string') {
    if (data.length > 100) {
      return (
        <span style={{ color: '#10b981' }}>
          "{data.slice(0, 100)}..."
        </span>
      );
    }
    return (
      <span style={{ color: '#10b981' }}>"{data}"</span>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span style={{ color: '#8b949e' }}>[]</span>;
    }

    return (
      <div className="inline">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 hover:opacity-80"
          style={{ color: '#3b82f6' }}
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span style={{ color: '#3b82f6' }}>Array</span>
          <span style={{ color: '#f59e0b' }}>({data.length})</span>
        </button>
        {isExpanded && (
          <div className="ml-4 border-l pl-2 mt-1 space-y-1" style={{ borderColor: '#3b82f640' }}>
            {data.map((item, index) => (
              <div key={index} className="flex">
                <span style={{ color: '#f59e0b' }} className="mr-2">{index}:</span>
                <JsonNode data={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <span style={{ color: '#8b949e' }}>{'{}'}</span>;
    }

    return (
      <div className="inline">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 hover:opacity-80"
          style={{ color: '#a855f7' }}
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span style={{ color: '#a855f7' }}>Object</span>
          <span style={{ color: '#f59e0b' }}>({entries.length})</span>
        </button>
        {isExpanded && (
          <div className="ml-4 border-l pl-2 mt-1 space-y-1" style={{ borderColor: '#a855f740' }}>
            {entries.map(([key, value]) => (
              <div key={key} className="flex">
                <span style={{ color: '#00d4ff' }} className="mr-2">"{key}":</span>
                <JsonNode data={value} name={key} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <span style={{ color: '#e6edf3' }}>{String(data)}</span>;
};

const ResponsePanel: React.FC<ResponsePanelProps> = ({
  result,
  error,
  moduleName,
  functionName,
  parameters,
  onAddToContext,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');
  const [addedToContext, setAddedToContext] = useState(false);

  const handleAddToContext = () => {
    if (!onAddToContext || result === null || result === undefined) return;

    // Add the tool response to context
    onAddToContext('tool_response', result, {
      toolName: `${moduleName}.${functionName}`,
      moduleName,
      functionName,
      parameters: parameters as Record<string, unknown>,
    });

    setAddedToContext(true);
    setTimeout(() => setAddedToContext(false), 2000);
  };

  const handleCopy = () => {
    const content = error || JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <CyberCard
        title="ERROR"
        variant="error"
        headerRight={
          <CyberButton
            variant="ghost"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </CyberButton>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
          <div className="flex-1">
            <p className="font-mono text-sm" style={{ color: '#ef4444' }}>{error}</p>
            <p className="text-xs mt-2">
              <span style={{ color: '#f59e0b' }}>{moduleName}</span>
              <span style={{ color: '#8b949e' }}>.</span>
              <span style={{ color: '#a855f7' }}>{functionName}</span>
              <span style={{ color: '#8b949e' }}> failed</span>
            </p>
          </div>
        </div>
      </CyberCard>
    );
  }

  if (result === null || result === undefined) {
    return null;
  }

  return (
    <CyberCard
      title="RESPONSE"
      variant="success"
      headerRight={
        <div className="flex items-center gap-2">
          <div className="flex border border-cyber-border">
            <button
              onClick={() => setViewMode('tree')}
              className={cn(
                'px-2 py-1 text-xs font-mono transition-colors',
                viewMode === 'tree'
                  ? 'bg-cyber-success/20 text-cyber-success'
                  : 'text-cyber-text-muted hover:text-cyber-text-primary'
              )}
            >
              Tree
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={cn(
                'px-2 py-1 text-xs font-mono transition-colors',
                viewMode === 'raw'
                  ? 'bg-cyber-success/20 text-cyber-success'
                  : 'text-cyber-text-muted hover:text-cyber-text-primary'
              )}
            >
              Raw
            </button>
          </div>
          {onAddToContext && (
            <CyberButton
              variant="purple"
              size="sm"
              onClick={handleAddToContext}
              disabled={addedToContext}
            >
              {addedToContext ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {addedToContext ? 'Added' : 'Context'}
            </CyberButton>
          )}
          <CyberButton
            variant="ghost"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </CyberButton>
        </div>
      }
    >
      <div className="flex items-center gap-2 mb-3 pb-3 border-b" style={{ borderColor: '#30363d' }}>
        <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
        <span className="text-xs font-mono">
          <span style={{ color: '#f59e0b' }}>{moduleName}</span>
          <span style={{ color: '#8b949e' }}>.</span>
          <span style={{ color: '#a855f7' }}>{functionName}</span>
          <span style={{ color: '#10b981' }}> executed successfully</span>
        </span>
      </div>

      <div className="max-h-96 overflow-auto">
        {viewMode === 'tree' ? (
          <div className="font-mono text-sm">
            <JsonNode data={result} />
          </div>
        ) : (
          <pre className="font-mono text-xs text-cyber-text-primary whitespace-pre-wrap break-words">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </CyberCard>
  );
};

export default ResponsePanel;
