'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CodeboltAPI, CodeboltFunction, CodeboltParameter } from '@/lib/modules';
import CyberCard from '../ui/CyberCard';
import CyberButton from '../ui/CyberButton';
import CyberInput from '../ui/CyberInput';
import CyberBadge from '../ui/CyberBadge';
import ResponsePanel from '../output/ResponsePanel';
import { Play, RotateCcw, Copy, BookOpen } from 'lucide-react';

interface FunctionFormProps {
  moduleName: string;
  functionName: string;
}

interface HistoryItem {
  id: string;
  timestamp: Date;
  module: string;
  function: string;
  params: Record<string, unknown>;
  result?: unknown;
  error?: string;
  duration?: number;
}

const FunctionForm: React.FC<FunctionFormProps> = ({
  moduleName,
  functionName,
}) => {
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const module = CodeboltAPI.getModuleByName(moduleName);
  const func = CodeboltAPI.getFunctionByName(moduleName, functionName);

  // Reset form when function changes
  useEffect(() => {
    setParameters({});
    setResult(null);
    setError('');
  }, [moduleName, functionName]);

  if (!func || !module) {
    return (
      <CyberCard title="ERROR" variant="error">
        <p className="text-cyber-error font-mono">
          Function {functionName} not found in module {moduleName}
        </p>
      </CyberCard>
    );
  }

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters(prev => ({ ...prev, [paramName]: value }));
  };

  const convertParameter = (param: CodeboltParameter, value: string): unknown => {
    if (value === undefined || value === '') {
      if (param.required) {
        throw new Error(`Required parameter "${param.name}" is missing`);
      }
      return undefined;
    }

    switch (param.type) {
      case 'number':
        const num = Number(value);
        if (isNaN(num)) throw new Error(`"${param.name}" must be a valid number`);
        return num;
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'object':
      case 'array':
        try {
          return JSON.parse(value);
        } catch {
          throw new Error(`"${param.name}" must be valid JSON`);
        }
      default:
        return value;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const startTime = Date.now();

    try {
      const convertedParams: Record<string, unknown> = {};

      for (const param of func.parameters) {
        const value = parameters[param.name];
        const converted = convertParameter(param, value);
        if (converted !== undefined) {
          convertedParams[param.name] = converted;
        }
      }

      const response = await CodeboltAPI.callFunction(
        moduleName,
        functionName,
        convertedParams
      );

      const duration = Date.now() - startTime;
      setResult(response);

      // Add to history
      setHistory(prev => [{
        id: crypto.randomUUID(),
        timestamp: new Date(),
        module: moduleName,
        function: functionName,
        params: convertedParams,
        result: response,
        duration,
      }, ...prev].slice(0, 10));

    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

      // Check if it's a connection error
      if (errorMessage.includes('Failed to connect') || errorMessage.includes('WebSocket')) {
        errorMessage = 'Not connected to Codebolt server. Please ensure Codebolt is running on port 12345.';
      }

      setError(errorMessage);

      // Add failed call to history
      setHistory(prev => [{
        id: crypto.randomUUID(),
        timestamp: new Date(),
        module: moduleName,
        function: functionName,
        params: parameters,
        error: errorMessage,
        duration: Date.now() - startTime,
      }, ...prev].slice(0, 10));

    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setParameters({});
    setResult(null);
    setError('');
  };

  const handleCopyParams = () => {
    const json = JSON.stringify(parameters, null, 2);
    navigator.clipboard.writeText(json);
  };

  const getTypeColor = (type: string): 'cyan' | 'success' | 'warning' | 'purple' | 'info' | 'muted' => {
    switch (type) {
      case 'string': return 'success';
      case 'number': return 'cyan';
      case 'boolean': return 'purple';
      case 'object': return 'warning';
      case 'array': return 'info';
      default: return 'muted';
    }
  };

  const getTypeHexColor = (type: string): string => {
    switch (type) {
      case 'string': return '#10b981';
      case 'number': return '#00d4ff';
      case 'boolean': return '#a855f7';
      case 'object': return '#f59e0b';
      case 'array': return '#3b82f6';
      default: return '#8b949e';
    }
  };

  const renderParameterInput = (param: CodeboltParameter) => {
    const isComplexType = param.type === 'object' || param.type === 'array';
    const typeColor = getTypeColor(param.type);
    const typeHexColor = getTypeHexColor(param.type);

    return (
      <div key={param.name} className="space-y-1">
        <div className="flex items-center gap-2">
          <label className="text-sm font-mono" style={{ color: '#e6edf3' }}>
            <span style={{ color: typeHexColor }}>{param.name}</span>
            {param.required && <span style={{ color: '#ef4444' }} className="ml-1">*</span>}
          </label>
          <CyberBadge variant={typeColor} size="sm">
            {param.type}
          </CyberBadge>
        </div>

        {isComplexType ? (
          <textarea
            value={parameters[param.name] || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={`Enter ${param.type} as JSON...`}
            rows={4}
            className="w-full px-3 py-2 font-mono text-sm resize-none"
            style={{
              border: `1px solid ${typeHexColor}40`,
              backgroundColor: 'rgba(10, 10, 15, 0.5)',
              color: '#e6edf3',
            }}
          />
        ) : (
          <CyberInput
            value={parameters[param.name] || ''}
            onChange={(value) => handleParameterChange(param.name, value)}
            placeholder={param.description || `Enter ${param.name}...`}
            type={param.type === 'number' ? 'number' : 'text'}
          />
        )}

        {param.description && (
          <p className="text-xs" style={{ color: '#8b949e' }}>{param.description}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Function header */}
      <CyberCard
        title={`${module.displayName}.${func.name}`}
        subtitle={func.description}
        variant="cyan"
        headerRight={
          <CyberBadge variant="cyan">
            {func.parameters.length} params
          </CyberBadge>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parameters */}
          {func.parameters.length > 0 ? (
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                <span style={{ color: '#a855f7' }}>▸</span>
                <span style={{ color: '#a855f7' }}>PARAMETERS</span>
                <span style={{ color: '#484f58' }}>({func.parameters.length})</span>
              </div>
              {func.parameters.map(param => renderParameterInput(param))}
            </div>
          ) : (
            <div className="py-4 text-center font-mono text-sm" style={{ color: '#8b949e' }}>
              <span style={{ color: '#10b981' }}>✓</span> This function takes no parameters
            </div>
          )}

          {/* Return type */}
          <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: '#30363d' }}>
            <span className="text-xs font-mono" style={{ color: '#3b82f6' }}>Returns:</span>
            <CyberBadge variant="success">{func.returnType}</CyberBadge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <CyberButton
              type="submit"
              variant="success"
              loading={loading}
              className="flex-1"
            >
              <Play className="w-4 h-4" />
              EXECUTE
            </CyberButton>
            <CyberButton
              type="button"
              variant="warning"
              onClick={handleClear}
            >
              <RotateCcw className="w-4 h-4" />
              CLEAR
            </CyberButton>
            <CyberButton
              type="button"
              variant="ghost"
              onClick={handleCopyParams}
            >
              <Copy className="w-4 h-4" />
            </CyberButton>
          </div>
        </form>
      </CyberCard>

      {/* Response */}
      {(result !== null || error) && (
        <ResponsePanel
          result={result}
          error={error}
          moduleName={moduleName}
          functionName={functionName}
        />
      )}

      {/* History */}
      {history.length > 0 && (
        <CyberCard title="HISTORY" variant="purple" subtitle="Recent executions">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 text-xs font-mono border-l-2"
                style={{
                  borderColor: item.error ? '#ef4444' : '#10b981',
                  backgroundColor: item.error ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)'
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: '#00d4ff' }}>
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                  <span style={{ color: item.error ? '#ef4444' : '#10b981' }}>
                    {item.module}.<span style={{ color: '#a855f7' }}>{item.function}</span>
                  </span>
                  <span style={{ color: item.error ? '#ef4444' : '#10b981' }}>
                    {item.error ? '✗' : '✓'}
                  </span>
                </div>
                {item.duration && (
                  <span style={{ color: '#f59e0b' }}>
                    {item.duration}ms
                  </span>
                )}
              </div>
            ))}
          </div>
        </CyberCard>
      )}
    </div>
  );
};

export default FunctionForm;
