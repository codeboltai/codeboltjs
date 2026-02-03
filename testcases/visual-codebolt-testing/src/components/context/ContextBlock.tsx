'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ContextBlock as ContextBlockType,
  ROLE_COLORS,
  ROLE_LABELS,
  calculateBlockHeight,
  LLMToolCall,
} from '@/lib/context-types';
import CyberButton from '../ui/CyberButton';
import {
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Play,
  FileText,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Copy,
  Check,
} from 'lucide-react';

interface ContextBlockProps {
  block: ContextBlockType;
  onToggle: () => void;
  onRemove: () => void;
  onEdit: (content: string | object) => void;
  onExecute?: () => void;  // For tool_call blocks
  onSimulate?: () => void; // For tool_call blocks - manually provide response
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const ContextBlock: React.FC<ContextBlockProps> = ({
  block,
  onToggle,
  onRemove,
  onEdit,
  onExecute,
  onSimulate,
  isDragging = false,
  dragHandleProps,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);

  const color = ROLE_COLORS[block.role];
  const label = ROLE_LABELS[block.role];
  const minHeight = calculateBlockHeight(block.tokenCount);

  const contentString = typeof block.content === 'string'
    ? block.content
    : JSON.stringify(block.content, null, 2);

  const handleStartEdit = () => {
    setEditContent(contentString);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    try {
      // Try to parse as JSON if it looks like JSON
      if (editContent.trim().startsWith('{') || editContent.trim().startsWith('[')) {
        onEdit(JSON.parse(editContent));
      } else {
        onEdit(editContent);
      }
    } catch {
      onEdit(editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(contentString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get tool info for tool_call blocks
  const toolInfo = block.role === 'tool_call' && typeof block.content === 'object'
    ? block.content as LLMToolCall
    : null;

  return (
    <div
      className={cn(
        'relative border transition-all duration-200',
        block.included ? 'opacity-100' : 'opacity-40',
        isDragging && 'shadow-lg z-50'
      )}
      style={{
        borderColor: `${color}40`,
        backgroundColor: block.included ? `${color}08` : 'transparent',
        minHeight: block.included ? minHeight : 48,
      }}
    >
      {/* Color indicator bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: block.included ? color : `${color}40` }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b cursor-pointer"
        style={{ borderColor: `${color}20` }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" style={{ color: '#484f58' }} />
        </div>

        {/* Expand/collapse */}
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" style={{ color }} />
        ) : (
          <ChevronRight className="w-4 h-4" style={{ color }} />
        )}

        {/* Role label */}
        <span className="text-xs font-mono font-semibold uppercase" style={{ color }}>
          {label}
        </span>

        {/* Tool name for tool_call/tool_response */}
        {(block.role === 'tool_call' || block.role === 'tool_response') && block.metadata?.toolName && (
          <>
            <span style={{ color: '#484f58' }}>:</span>
            <span className="text-xs font-mono" style={{ color: '#e6edf3' }}>
              {block.metadata.moduleName && `${block.metadata.moduleName}.`}
              {block.metadata.functionName || block.metadata.toolName}
            </span>
          </>
        )}

        {/* Token count */}
        <span className="ml-auto text-xs font-mono" style={{ color: '#8b949e' }}>
          ~{block.tokenCount} tok
        </span>

        {/* Include/exclude toggle */}
        <button
          onClick={e => {
            e.stopPropagation();
            onToggle();
          }}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title={block.included ? 'Exclude from context' : 'Include in context'}
        >
          {block.included ? (
            <Eye className="w-4 h-4" style={{ color: '#10b981' }} />
          ) : (
            <EyeOff className="w-4 h-4" style={{ color: '#8b949e' }} />
          )}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 py-3">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full min-h-[100px] p-2 font-mono text-xs bg-cyber-bg-tertiary border resize-y"
                style={{
                  borderColor: `${color}40`,
                  color: '#e6edf3',
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <CyberButton variant="success" size="sm" onClick={handleSaveEdit}>
                  Save
                </CyberButton>
                <CyberButton variant="ghost" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </CyberButton>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <pre
                className="font-mono text-xs whitespace-pre-wrap break-words max-h-48 overflow-y-auto"
                style={{ color: '#e6edf3' }}
              >
                {contentString.length > 500 && !isExpanded
                  ? contentString.slice(0, 500) + '...'
                  : contentString}
              </pre>

              {/* Hover actions */}
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1 bg-cyber-bg-secondary border hover:bg-cyber-bg-tertiary transition-colors"
                  style={{ borderColor: '#30363d' }}
                  title="Copy content"
                >
                  {copied ? (
                    <Check className="w-3 h-3" style={{ color: '#10b981' }} />
                  ) : (
                    <Copy className="w-3 h-3" style={{ color: '#8b949e' }} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-t"
        style={{ borderColor: `${color}20` }}
      >
        {/* Tool call specific actions */}
        {block.role === 'tool_call' && toolInfo && !toolInfo.executed && (
          <>
            <CyberButton variant="success" size="sm" onClick={onExecute}>
              <Play className="w-3 h-3" />
              Execute
            </CyberButton>
            <CyberButton variant="warning" size="sm" onClick={onSimulate}>
              <FileText className="w-3 h-3" />
              Simulate
            </CyberButton>
          </>
        )}

        {/* Common actions */}
        <div className="flex gap-1 ml-auto">
          <button
            onClick={handleStartEdit}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Edit content"
          >
            <Edit2 className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Remove block"
          >
            <Trash2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
          </button>
        </div>

        {/* Metadata timestamp */}
        {block.metadata?.timestamp && (
          <span className="text-[10px] font-mono" style={{ color: '#484f58' }}>
            {new Date(block.metadata.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default ContextBlock;
