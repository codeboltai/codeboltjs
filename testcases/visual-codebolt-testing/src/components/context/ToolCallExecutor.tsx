'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ContextBlock, LLMToolCall, ROLE_COLORS } from '@/lib/context-types';
import CyberButton from '../ui/CyberButton';
import { CodeboltAPI } from '@/lib/modules';
import {
  Play,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

interface ToolCallExecutorProps {
  block: ContextBlock;
  onExecuteComplete: (result: unknown) => void;
  onSimulateComplete: (result: string) => void;
  onCancel: () => void;
}

const ToolCallExecutor: React.FC<ToolCallExecutorProps> = ({
  block,
  onExecuteComplete,
  onSimulateComplete,
  onCancel,
}) => {
  const [mode, setMode] = useState<'choice' | 'execute' | 'simulate'>('choice');
  const [executing, setExecuting] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  const toolCall = typeof block.content === 'object' ? block.content as LLMToolCall : null;

  if (!toolCall) {
    return (
      <div className="p-4 border" style={{ borderColor: '#ef444440' }}>
        <span className="text-sm font-mono" style={{ color: '#ef4444' }}>
          Invalid tool call block
        </span>
      </div>
    );
  }

  const handleExecute = async () => {
    setExecuting(true);
    setError(null);

    try {
      // Parse the tool name to get module and function
      const parts = toolCall.toolName.split('.');
      let moduleName: string;
      let functionName: string;

      if (parts.length >= 2) {
        moduleName = parts[0];
        functionName = parts.slice(1).join('.');
      } else {
        // Try to find the function in all modules
        const searchResult = CodeboltAPI.searchFunctions(toolCall.toolName);
        if (searchResult.length > 0) {
          moduleName = searchResult[0].module.name;
          functionName = searchResult[0].function.name;
        } else {
          throw new Error(`Could not find function: ${toolCall.toolName}`);
        }
      }

      const response = await CodeboltAPI.callFunction(
        moduleName,
        functionName,
        toolCall.arguments as Record<string, unknown>
      );

      setResult(response);
      onExecuteComplete(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Execution failed';
      setError(errorMessage);
    } finally {
      setExecuting(false);
    }
  };

  const handleSimulateSubmit = () => {
    if (simulatedResponse.trim()) {
      onSimulateComplete(simulatedResponse);
    }
  };

  return (
    <div
      className="border p-4 space-y-4"
      style={{
        borderColor: `${ROLE_COLORS.tool_call}40`,
        backgroundColor: `${ROLE_COLORS.tool_call}08`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase" style={{ color: ROLE_COLORS.tool_call }}>
            Tool Call Execution
          </span>
          <span className="text-xs font-mono" style={{ color: '#e6edf3' }}>
            {toolCall.toolName}
          </span>
        </div>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-white/10 rounded"
        >
          <X className="w-4 h-4" style={{ color: '#8b949e' }} />
        </button>
      </div>

      {/* Arguments preview */}
      <div className="p-2 bg-cyber-bg-tertiary border" style={{ borderColor: '#30363d' }}>
        <div className="text-[10px] font-mono uppercase mb-1" style={{ color: '#484f58' }}>
          Arguments
        </div>
        <pre className="text-xs font-mono max-h-24 overflow-y-auto" style={{ color: '#e6edf3' }}>
          {JSON.stringify(toolCall.arguments, null, 2)}
        </pre>
      </div>

      {/* Mode selection */}
      {mode === 'choice' && (
        <div className="flex gap-3">
          <CyberButton
            variant="success"
            onClick={() => {
              setMode('execute');
              handleExecute();
            }}
            className="flex-1"
          >
            <Play className="w-4 h-4" />
            Execute via API
          </CyberButton>
          <CyberButton
            variant="warning"
            onClick={() => setMode('simulate')}
            className="flex-1"
          >
            <FileText className="w-4 h-4" />
            Simulate Response
          </CyberButton>
        </div>
      )}

      {/* Execution mode */}
      {mode === 'execute' && (
        <div className="space-y-3">
          {executing && (
            <div className="flex items-center gap-2 py-4 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#00d4ff' }} />
              <span className="text-sm font-mono" style={{ color: '#00d4ff' }}>
                Executing...
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 border flex items-start gap-2" style={{ borderColor: '#ef444440', backgroundColor: '#ef444410' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
              <div>
                <span className="text-sm font-mono" style={{ color: '#ef4444' }}>
                  {error}
                </span>
                <div className="mt-2 flex gap-2">
                  <CyberButton variant="ghost" size="sm" onClick={() => setMode('choice')}>
                    Back
                  </CyberButton>
                  <CyberButton variant="warning" size="sm" onClick={() => setMode('simulate')}>
                    Simulate Instead
                  </CyberButton>
                </div>
              </div>
            </div>
          )}

          {result !== null && !error && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                <span className="text-sm font-mono" style={{ color: '#10b981' }}>
                  Execution successful
                </span>
              </div>
              <div className="p-2 bg-cyber-bg-tertiary border" style={{ borderColor: '#10b98140' }}>
                <pre className="text-xs font-mono max-h-32 overflow-y-auto" style={{ color: '#e6edf3' }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Simulate mode */}
      {mode === 'simulate' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-mono block mb-1" style={{ color: '#8b949e' }}>
              Enter simulated tool response:
            </label>
            <textarea
              value={simulatedResponse}
              onChange={(e) => setSimulatedResponse(e.target.value)}
              placeholder="Enter the response that this tool would return..."
              rows={5}
              className="w-full px-3 py-2 font-mono text-sm resize-y bg-cyber-bg-tertiary border"
              style={{
                borderColor: `${ROLE_COLORS.tool_response}40`,
                color: '#e6edf3',
              }}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <CyberButton
              variant="warning"
              onClick={handleSimulateSubmit}
              disabled={!simulatedResponse.trim()}
            >
              <CheckCircle className="w-4 h-4" />
              Add Response
            </CyberButton>
            <CyberButton variant="ghost" onClick={() => setMode('choice')}>
              Back
            </CyberButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolCallExecutor;
