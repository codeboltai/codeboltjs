'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { InferenceCall, ROLE_COLORS, LLMToolCall } from '@/lib/context-types';
import CyberButton from '../ui/CyberButton';
import {
  History,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Trash2,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface InferenceStackProps {
  history: InferenceCall[];
  onRestore: (inferenceId: string) => void;
  onClear: () => void;
}

const InferenceStack: React.FC<InferenceStackProps> = ({
  history,
  onRestore,
  onClear,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusIcon = (status: InferenceCall['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#f59e0b' }} />;
      case 'success':
        return <CheckCircle className="w-3 h-3" style={{ color: '#10b981' }} />;
      case 'error':
        return <AlertCircle className="w-3 h-3" style={{ color: '#ef4444' }} />;
    }
  };

  const getStatusColor = (status: InferenceCall['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <History className="w-8 h-8 mb-2" style={{ color: '#484f58' }} />
        <p className="text-xs font-mono" style={{ color: '#8b949e' }}>
          No inference history yet
        </p>
        <p className="text-[10px] font-mono mt-1" style={{ color: '#484f58' }}>
          Send context to LLM to see history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" style={{ color: '#a855f7' }} />
          <span className="text-xs font-mono font-semibold" style={{ color: '#a855f7' }}>
            INFERENCE HISTORY
          </span>
          <span className="text-[10px] font-mono" style={{ color: '#484f58' }}>
            ({history.length})
          </span>
        </div>
        <CyberButton variant="ghost" size="sm" onClick={onClear}>
          <Trash2 className="w-3 h-3" />
        </CyberButton>
      </div>

      {/* History list */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {history.map((call) => {
          const isExpanded = expandedId === call.id;
          const statusColor = getStatusColor(call.status);
          const hasToolCalls = call.response.type === 'tool_calls' && Array.isArray(call.response.content);

          return (
            <div
              key={call.id}
              className="border transition-colors"
              style={{
                borderColor: `${statusColor}30`,
                backgroundColor: `${statusColor}05`,
              }}
            >
              {/* Call header */}
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/5"
                onClick={() => setExpandedId(isExpanded ? null : call.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" style={{ color: statusColor }} />
                ) : (
                  <ChevronRight className="w-3 h-3" style={{ color: statusColor }} />
                )}

                {getStatusIcon(call.status)}

                <span className="text-xs font-mono" style={{ color: '#3b82f6' }}>
                  {call.model}
                </span>

                <span className="text-[10px] font-mono" style={{ color: '#8b949e' }}>
                  {call.contextSnapshot.length} blocks
                </span>

                <div className="flex items-center gap-1 ml-auto">
                  <Zap className="w-3 h-3" style={{ color: '#f59e0b' }} />
                  <span className="text-[10px] font-mono" style={{ color: '#f59e0b' }}>
                    {call.inputTokens + call.outputTokens} tok
                  </span>
                </div>

                <span className="text-[10px] font-mono" style={{ color: '#484f58' }}>
                  {new Date(call.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-3 py-2 border-t space-y-2" style={{ borderColor: `${statusColor}20` }}>
                  {/* Token details */}
                  <div className="flex gap-4 text-[10px] font-mono">
                    <span style={{ color: '#8b949e' }}>
                      Input: <span style={{ color: '#00d4ff' }}>{call.inputTokens}</span>
                    </span>
                    <span style={{ color: '#8b949e' }}>
                      Output: <span style={{ color: '#10b981' }}>{call.outputTokens}</span>
                    </span>
                  </div>

                  {/* Response preview */}
                  <div className="p-2 bg-cyber-bg-tertiary border" style={{ borderColor: '#30363d' }}>
                    <div className="text-[10px] font-mono uppercase mb-1" style={{ color: '#484f58' }}>
                      Response ({call.response.type})
                    </div>
                    {call.response.type === 'text' ? (
                      <pre className="text-xs font-mono max-h-24 overflow-y-auto" style={{ color: '#e6edf3' }}>
                        {typeof call.response.content === 'string'
                          ? call.response.content.slice(0, 200) + (call.response.content.length > 200 ? '...' : '')
                          : JSON.stringify(call.response.content, null, 2)}
                      </pre>
                    ) : hasToolCalls ? (
                      <div className="space-y-1">
                        {(call.response.content as LLMToolCall[]).map((tc, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span style={{ color: '#00d4ff' }}>🔧</span>
                            <span className="text-xs font-mono" style={{ color: '#00d4ff' }}>
                              {tc.toolName}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Error message */}
                  {call.error && (
                    <div className="p-2 border" style={{ borderColor: '#ef444440', backgroundColor: '#ef444410' }}>
                      <span className="text-xs font-mono" style={{ color: '#ef4444' }}>
                        {call.error}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <CyberButton
                      variant="purple"
                      size="sm"
                      onClick={() => onRestore(call.id)}
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore Context
                    </CyberButton>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InferenceStack;
