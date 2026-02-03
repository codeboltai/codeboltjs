'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ContextBlock,
  InferenceCall,
  LLMToolCall,
  BlockRole,
  BlockSource,
  createContextBlock,
  estimateTokenCount,
  ModelId,
} from '@/lib/context-types';

const CONTEXT_STORAGE_KEY = 'codebolt-context-chain';
const INFERENCE_STORAGE_KEY = 'codebolt-inference-history';

export interface UseContextChainReturn {
  // Context blocks
  blocks: ContextBlock[];
  addBlock: (role: BlockRole, content: string | object, source: BlockSource, metadata?: ContextBlock['metadata']) => string;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updates: Partial<ContextBlock>) => void;
  toggleBlock: (id: string) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
  clearBlocks: () => void;

  // Inference history
  inferenceHistory: InferenceCall[];
  addInferenceCall: (call: Omit<InferenceCall, 'id'>) => string;
  restoreFromInference: (inferenceId: string) => void;
  clearInferenceHistory: () => void;

  // Computed values
  totalTokens: number;
  includedTokens: number;
  includedBlocks: ContextBlock[];

  // Selected model
  selectedModel: ModelId;
  setSelectedModel: (model: ModelId) => void;

  // LLM sending state
  isSending: boolean;
  setIsSending: (sending: boolean) => void;

  // Pending tool calls (from LLM responses that haven't been executed yet)
  pendingToolCalls: LLMToolCall[];
  addPendingToolCall: (toolCall: LLMToolCall) => void;
  removePendingToolCall: (id: string) => void;
  clearPendingToolCalls: () => void;
}

export function useContextChain(): UseContextChainReturn {
  const [blocks, setBlocks] = useState<ContextBlock[]>([]);
  const [inferenceHistory, setInferenceHistory] = useState<InferenceCall[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelId>('default');
  const [isSending, setIsSending] = useState(false);
  const [pendingToolCalls, setPendingToolCalls] = useState<LLMToolCall[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedBlocks = localStorage.getItem(CONTEXT_STORAGE_KEY);
      if (storedBlocks) {
        const parsed = JSON.parse(storedBlocks);
        // Restore Date objects
        setBlocks(parsed.map((block: ContextBlock) => ({
          ...block,
          metadata: block.metadata ? {
            ...block.metadata,
            timestamp: new Date(block.metadata.timestamp),
          } : undefined,
        })));
      }

      const storedHistory = localStorage.getItem(INFERENCE_STORAGE_KEY);
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        setInferenceHistory(parsed.map((call: InferenceCall) => ({
          ...call,
          timestamp: new Date(call.timestamp),
          contextSnapshot: call.contextSnapshot.map((block: ContextBlock) => ({
            ...block,
            metadata: block.metadata ? {
              ...block.metadata,
              timestamp: new Date(block.metadata.timestamp),
            } : undefined,
          })),
        })));
      }
    } catch (e) {
      console.error('Failed to load context chain from localStorage:', e);
    }
  }, []);

  // Save to localStorage when blocks change
  useEffect(() => {
    try {
      localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(blocks));
    } catch (e) {
      console.error('Failed to save context chain to localStorage:', e);
    }
  }, [blocks]);

  // Save inference history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(INFERENCE_STORAGE_KEY, JSON.stringify(inferenceHistory));
    } catch (e) {
      console.error('Failed to save inference history to localStorage:', e);
    }
  }, [inferenceHistory]);

  // Add a new block
  const addBlock = useCallback((
    role: BlockRole,
    content: string | object,
    source: BlockSource,
    metadata?: ContextBlock['metadata']
  ): string => {
    const block = createContextBlock(role, content, source, metadata);
    setBlocks(prev => [...prev, block]);
    return block.id;
  }, []);

  // Remove a block
  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  }, []);

  // Update a block
  const updateBlock = useCallback((id: string, updates: Partial<ContextBlock>) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== id) return block;
      const updated = { ...block, ...updates };
      // Recalculate token count if content changed
      if (updates.content !== undefined) {
        updated.tokenCount = estimateTokenCount(updates.content);
      }
      return updated;
    }));
  }, []);

  // Toggle a block's included state
  const toggleBlock = useCallback((id: string) => {
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, included: !block.included } : block
    ));
  }, []);

  // Reorder blocks (for drag and drop)
  const reorderBlocks = useCallback((startIndex: number, endIndex: number) => {
    setBlocks(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  // Clear all blocks
  const clearBlocks = useCallback(() => {
    setBlocks([]);
  }, []);

  // Add an inference call to history
  const addInferenceCall = useCallback((call: Omit<InferenceCall, 'id'>): string => {
    const id = crypto.randomUUID();
    const newCall: InferenceCall = { ...call, id };
    setInferenceHistory(prev => [newCall, ...prev].slice(0, 50)); // Keep last 50
    return id;
  }, []);

  // Restore context from a previous inference call
  const restoreFromInference = useCallback((inferenceId: string) => {
    const call = inferenceHistory.find(c => c.id === inferenceId);
    if (call) {
      // Create new blocks with new IDs to avoid conflicts
      const restoredBlocks = call.contextSnapshot.map(block => ({
        ...block,
        id: crypto.randomUUID(),
      }));
      setBlocks(restoredBlocks);
    }
  }, [inferenceHistory]);

  // Clear inference history
  const clearInferenceHistory = useCallback(() => {
    setInferenceHistory([]);
  }, []);

  // Pending tool calls management
  const addPendingToolCall = useCallback((toolCall: LLMToolCall) => {
    setPendingToolCalls(prev => [...prev, toolCall]);
  }, []);

  const removePendingToolCall = useCallback((id: string) => {
    setPendingToolCalls(prev => prev.filter(tc => tc.id !== id));
  }, []);

  const clearPendingToolCalls = useCallback(() => {
    setPendingToolCalls([]);
  }, []);

  // Computed values
  const totalTokens = blocks.reduce((sum, block) => sum + block.tokenCount, 0);
  const includedBlocks = blocks.filter(block => block.included);
  const includedTokens = includedBlocks.reduce((sum, block) => sum + block.tokenCount, 0);

  return {
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
    clearPendingToolCalls,
  };
}

export default useContextChain;
