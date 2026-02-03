'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ContextBlock as ContextBlockType,
  InferenceCall,
  LLMToolCall,
  BlockRole,
  blocksToMessages,
  createContextBlock,
  ModelId,
} from '@/lib/context-types';
import ContextHeader from './ContextHeader';
import ContextBlockList from './ContextBlockList';
import ContextToolbar from './ContextToolbar';
import InferenceStack from './InferenceStack';
import ToolCallExecutor from './ToolCallExecutor';
import { UseContextChainReturn } from '@/hooks/useContextChain';

interface AddMessageModalProps {
  role: BlockRole;
  onSubmit: (content: string) => void;
  onClose: () => void;
}

const AddMessageModal: React.FC<AddMessageModalProps> = ({ role, onSubmit, onClose }) => {
  const [content, setContent] = useState('');

  const roleColors: Record<BlockRole, string> = {
    system: '#8b949e',
    user: '#3b82f6',
    assistant: '#a855f7',
    tool_call: '#00d4ff',
    tool_response: '#f59e0b',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        className="w-full max-w-lg border p-4 space-y-4"
        style={{
          backgroundColor: '#0d1117',
          borderColor: `${roleColors[role]}40`,
        }}
      >
        <h3 className="text-sm font-mono font-bold uppercase" style={{ color: roleColors[role] }}>
          Add {role} Message
        </h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Enter ${role} message content...`}
            rows={6}
            className="w-full px-3 py-2 font-mono text-sm resize-y bg-cyber-bg-tertiary border mb-4"
            style={{
              borderColor: `${roleColors[role]}40`,
              color: '#e6edf3',
            }}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-mono border transition-colors hover:bg-white/5"
              style={{ borderColor: '#30363d', color: '#8b949e' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-2 text-sm font-mono border transition-colors disabled:opacity-50"
              style={{
                borderColor: roleColors[role],
                color: roleColors[role],
                backgroundColor: `${roleColors[role]}20`,
              }}
            >
              Add Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ContextWorkspaceProps {
  contextChain: UseContextChainReturn;
}

const ContextWorkspace: React.FC<ContextWorkspaceProps> = ({ contextChain }) => {
  const [showAddModal, setShowAddModal] = useState<BlockRole | null>(null);
  const [executingBlock, setExecutingBlock] = useState<ContextBlockType | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const {
    blocks,
    addBlock,
    removeBlock,
    updateBlock,
    toggleBlock,
    reorderBlocks,
    clearBlocks,
    inferenceHistory,
    addInferenceCall,
    restoreFromInference,
    clearInferenceHistory,
    totalTokens,
    includedTokens,
    includedBlocks,
    selectedModel,
    setSelectedModel,
    isSending,
    setIsSending,
    pendingToolCalls,
    addPendingToolCall,
    removePendingToolCall,
  } = contextChain;

  const handleAddMessage = (role: BlockRole) => {
    setShowAddModal(role);
  };

  const handleSubmitMessage = (content: string) => {
    if (showAddModal) {
      addBlock(showAddModal, content, 'human');
    }
    setShowAddModal(null);
  };

  const handleSendToLLM = async () => {
    if (includedBlocks.length === 0) return;

    setIsSending(true);

    try {
      const messages = blocksToMessages(includedBlocks);

      const response = await fetch('/api/llm-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'LLM request failed');
      }

      // Add inference to history
      addInferenceCall({
        timestamp: new Date(),
        model: selectedModel,
        inputTokens: data.usage?.input_tokens || includedTokens,
        outputTokens: data.usage?.output_tokens || 0,
        contextSnapshot: [...includedBlocks],
        response: data.response,
        status: 'success',
      });

      // Add assistant response to blocks
      if (data.response.type === 'text') {
        addBlock('assistant', data.response.content, 'llm');
      } else if (data.response.type === 'tool_calls') {
        // Add each tool call as a block
        for (const toolCall of data.response.content as LLMToolCall[]) {
          addBlock('tool_call', toolCall, 'llm', {
            toolName: toolCall.toolName,
            timestamp: new Date(),
          });
          addPendingToolCall(toolCall);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      addInferenceCall({
        timestamp: new Date(),
        model: selectedModel,
        inputTokens: includedTokens,
        outputTokens: 0,
        contextSnapshot: [...includedBlocks],
        response: { type: 'text', content: '' },
        status: 'error',
        error: errorMessage,
      });

      // Add error as assistant message for visibility
      addBlock('assistant', `Error: ${errorMessage}`, 'llm');
    } finally {
      setIsSending(false);
    }
  };

  const handleExecuteToolCall = (block: ContextBlockType) => {
    setExecutingBlock(block);
  };

  const handleSimulateToolCall = (block: ContextBlockType) => {
    setExecutingBlock(block);
  };

  const handleExecuteComplete = (result: unknown) => {
    if (executingBlock) {
      const toolCall = executingBlock.content as LLMToolCall;

      // Update the tool call block to mark as executed
      updateBlock(executingBlock.id, {
        content: { ...toolCall, executed: true, result },
      });

      // Add tool response block
      addBlock('tool_response', result as string | object, 'tool', {
        toolName: toolCall.toolName,
        executionId: toolCall.id,
        timestamp: new Date(),
      });

      removePendingToolCall(toolCall.id);
      setExecutingBlock(null);
    }
  };

  const handleSimulateComplete = (response: string) => {
    if (executingBlock) {
      const toolCall = executingBlock.content as LLMToolCall;

      // Update the tool call block to mark as executed
      updateBlock(executingBlock.id, {
        content: { ...toolCall, executed: true, result: response },
      });

      // Add simulated tool response block
      addBlock('tool_response', response, 'human', {
        toolName: toolCall.toolName,
        executionId: toolCall.id,
        timestamp: new Date(),
      });

      removePendingToolCall(toolCall.id);
      setExecutingBlock(null);
    }
  };

  return (
    <div className="flex flex-col h-full border-l" style={{ borderColor: '#a855f730' }}>
      {/* Header with controls */}
      <ContextHeader
        totalTokens={totalTokens}
        includedTokens={includedTokens}
        blockCount={blocks.length}
        includedBlockCount={includedBlocks.length}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onSendToLLM={handleSendToLLM}
        onClearAll={clearBlocks}
        isSending={isSending}
        blocks={blocks}
      />

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tool call executor modal */}
        {executingBlock && (
          <ToolCallExecutor
            block={executingBlock}
            onExecuteComplete={handleExecuteComplete}
            onSimulateComplete={handleSimulateComplete}
            onCancel={() => setExecutingBlock(null)}
          />
        )}

        {/* Context blocks */}
        <ContextBlockList
          blocks={blocks}
          onReorder={reorderBlocks}
          onToggle={toggleBlock}
          onRemove={removeBlock}
          onEdit={(id, content) => updateBlock(id, { content })}
          onExecuteToolCall={handleExecuteToolCall}
          onSimulateToolCall={handleSimulateToolCall}
        />

        {/* Inference history (collapsible) */}
        {inferenceHistory.length > 0 && (
          <div className="border-t pt-4" style={{ borderColor: '#30363d' }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-xs font-mono mb-2 hover:opacity-80"
              style={{ color: '#a855f7' }}
            >
              {showHistory ? '▼' : '▶'} Inference History ({inferenceHistory.length})
            </button>
            {showHistory && (
              <InferenceStack
                history={inferenceHistory}
                onRestore={restoreFromInference}
                onClear={clearInferenceHistory}
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom toolbar for adding messages */}
      <ContextToolbar
        onAddSystemMessage={() => handleAddMessage('system')}
        onAddUserMessage={() => handleAddMessage('user')}
        onAddAssistantMessage={() => handleAddMessage('assistant')}
      />

      {/* Add message modal */}
      {showAddModal && (
        <AddMessageModal
          role={showAddModal}
          onSubmit={handleSubmitMessage}
          onClose={() => setShowAddModal(null)}
        />
      )}
    </div>
  );
};

export default ContextWorkspace;
