'use client';

import React from 'react';
import { AVAILABLE_MODELS, ModelId, ContextBlock, ROLE_COLORS, ROLE_LABELS } from '@/lib/context-types';
import CyberButton from '../ui/CyberButton';
import { Send, Trash2, Database } from 'lucide-react';

interface ContextHeaderProps {
  totalTokens: number;
  includedTokens: number;
  blockCount: number;
  includedBlockCount: number;
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
  onSendToLLM: () => void;
  onClearAll: () => void;
  isSending: boolean;
  blocks?: ContextBlock[]; // Add blocks for the stacked visualization
}

const ContextHeader: React.FC<ContextHeaderProps> = ({
  totalTokens,
  includedTokens,
  blockCount,
  includedBlockCount,
  selectedModel,
  onModelChange,
  onSendToLLM,
  onClearAll,
  isSending,
  blocks = [],
}) => {
  // Token bar visualization
  const maxTokens = 8000; // Approximate context window for visualization
  const tokenPercentage = Math.min((includedTokens / maxTokens) * 100, 100);
  const tokenColor = tokenPercentage > 80 ? '#ef4444' : tokenPercentage > 60 ? '#f59e0b' : '#10b981';

  // Calculate heights for stacked bar (total height 120px)
  const STACK_HEIGHT = 120;
  const includedBlocks = blocks.filter(b => b.included);
  const blockHeights = includedBlocks.map(block => {
    if (includedTokens === 0) return 0;
    return Math.max((block.tokenCount / includedTokens) * STACK_HEIGHT, 4); // min 4px height
  });

  return (
    <div className="border-b" style={{ borderColor: '#a855f740' }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-cyber-bg-tertiary/30">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 flex-shrink-0" style={{ color: '#a855f7' }} />
          <h2 className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: '#a855f7' }}>
            CONTEXT
          </h2>
        </div>
        <span className="text-[9px] font-mono" style={{ color: '#00d4ff' }}>
          AGENT_LOOP
        </span>
      </div>

      {/* Main content with stacked bar */}
      <div className="flex gap-3 p-3">
        {/* Vertical Stacked Token Bar */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-8 border relative overflow-hidden"
            style={{
              height: STACK_HEIGHT,
              borderColor: '#30363d',
              backgroundColor: '#0d1117',
            }}
          >
            {/* Stacked blocks from bottom to top */}
            <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse">
              {includedBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className="w-full transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{
                    height: blockHeights[index],
                    backgroundColor: block.included ? ROLE_COLORS[block.role] : `${ROLE_COLORS[block.role]}40`,
                    borderBottom: index > 0 ? '1px solid #0d1117' : 'none',
                  }}
                  title={`${ROLE_LABELS[block.role]}: ${block.tokenCount} tokens`}
                />
              ))}
            </div>

            {/* Max capacity line */}
            <div
              className="absolute left-0 right-0 border-t border-dashed"
              style={{
                top: `${100 - tokenPercentage}%`,
                borderColor: tokenColor,
                opacity: 0.5,
              }}
            />
          </div>

          {/* Token count label */}
          <span className="text-[9px] font-mono font-bold" style={{ color: tokenColor }}>
            {includedTokens}
          </span>
        </div>

        {/* Controls column */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {/* Model selector row */}
          <div className="flex items-center gap-2">
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value as ModelId)}
              className="flex-1 min-w-0 px-2 py-1 text-[10px] font-mono border bg-cyber-bg-secondary truncate"
              style={{
                borderColor: '#3b82f640',
                color: '#3b82f6',
              }}
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span style={{ color: '#8b949e' }}>
              <span style={{ color: tokenColor }}>{includedTokens.toLocaleString()}</span>
              {includedTokens !== totalTokens && (
                <span style={{ color: '#484f58' }}>/{totalTokens.toLocaleString()}</span>
              )}
              <span style={{ color: '#484f58' }}> tok</span>
            </span>
            <span style={{ color: '#30363d' }}>|</span>
            <span style={{ color: '#8b949e' }}>
              <span style={{ color: '#a855f7' }}>{includedBlockCount}</span>
              {includedBlockCount !== blockCount && (
                <span style={{ color: '#484f58' }}>/{blockCount}</span>
              )}
              <span style={{ color: '#484f58' }}> blk</span>
            </span>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-2">
            <CyberButton
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              disabled={blockCount === 0}
              className="px-2 py-1 text-[10px]"
            >
              <Trash2 className="w-3 h-3" />
            </CyberButton>

            <CyberButton
              variant="success"
              size="sm"
              onClick={onSendToLLM}
              loading={isSending}
              disabled={includedBlockCount === 0}
              className="flex-1 px-2 py-1 text-[10px]"
            >
              <Send className="w-3 h-3" />
              SEND
            </CyberButton>
          </div>
        </div>
      </div>

      {/* Legend - compact */}
      {includedBlocks.length > 0 && (
        <div className="flex flex-wrap gap-x-2 gap-y-1 px-3 pb-2 text-[9px] font-mono">
          {(['system', 'user', 'assistant', 'tool_call', 'tool_response'] as const)
            .filter(role => includedBlocks.some(b => b.role === role))
            .map(role => (
              <div key={role} className="flex items-center gap-1">
                <div
                  className="w-2 h-2"
                  style={{ backgroundColor: ROLE_COLORS[role] }}
                />
                <span style={{ color: '#8b949e' }}>{role.replace('_', ' ')}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ContextHeader;
