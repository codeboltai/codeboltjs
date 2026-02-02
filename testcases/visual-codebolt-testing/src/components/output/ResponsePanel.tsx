'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import CyberCard from '../ui/CyberCard';
import CyberButton from '../ui/CyberButton';
import { Copy, Check, ChevronDown, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';

interface ResponsePanelProps {
  result?: unknown;
  error?: string;
  moduleName: string;
  functionName: string;
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
      <span className="text-cyber-text-muted">null</span>
    );
  }

  if (data === undefined) {
    return (
      <span className="text-cyber-text-muted">undefined</span>
    );
  }

  if (typeof data === 'boolean') {
    return (
      <span className={data ? 'text-cyber-success' : 'text-cyber-error'}>
        {String(data)}
      </span>
    );
  }

  if (typeof data === 'number') {
    return (
      <span className="text-cyber-warning">{data}</span>
    );
  }

  if (typeof data === 'string') {
    if (data.length > 100) {
      return (
        <span className="text-cyber-success">
          "{data.slice(0, 100)}..."
        </span>
      );
    }
    return (
      <span className="text-cyber-success">"{data}"</span>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-cyber-text-muted">[]</span>;
    }

    return (
      <div className="inline">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-cyber-cyan hover:text-cyber-cyan/80"
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span className="text-cyber-text-muted">Array({data.length})</span>
        </button>
        {isExpanded && (
          <div className="ml-4 border-l border-cyber-border pl-2 mt-1 space-y-1">
            {data.map((item, index) => (
              <div key={index} className="flex">
                <span className="text-cyber-text-muted mr-2">{index}:</span>
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
      return <span className="text-cyber-text-muted">{'{}'}</span>;
    }

    return (
      <div className="inline">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-cyber-cyan hover:text-cyber-cyan/80"
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span className="text-cyber-text-muted">Object({entries.length})</span>
        </button>
        {isExpanded && (
          <div className="ml-4 border-l border-cyber-border pl-2 mt-1 space-y-1">
            {entries.map(([key, value]) => (
              <div key={key} className="flex">
                <span className="text-cyber-info mr-2">"{key}":</span>
                <JsonNode data={value} name={key} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <span className="text-cyber-text-primary">{String(data)}</span>;
};

const ResponsePanel: React.FC<ResponsePanelProps> = ({
  result,
  error,
  moduleName,
  functionName,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');

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
          <AlertTriangle className="w-5 h-5 text-cyber-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-mono text-sm text-cyber-error">{error}</p>
            <p className="text-xs text-cyber-text-muted mt-2">
              {moduleName}.{functionName} failed
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
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-cyber-border">
        <CheckCircle className="w-4 h-4 text-cyber-success" />
        <span className="text-xs font-mono text-cyber-success">
          {moduleName}.{functionName} executed successfully
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
