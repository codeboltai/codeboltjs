'use client';

import React, { useState } from 'react';
import { CodeboltAPI } from '@/lib/codeboltjs';
import TerminalButton from './ui/TerminalButton';
import TerminalInput from './ui/TerminalInput';
import TerminalOutput from './ui/TerminalOutput';
import TerminalCard from './ui/TerminalCard';

interface ModuleFormProps {
  moduleName: string;
  functionName: string;
  onExecute?: (result: unknown) => void;
}

const ModuleForm: React.FC<ModuleFormProps> = ({
  moduleName,
  functionName,
  onExecute,
}) => {
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string>('');

  const func = CodeboltAPI.getFunctionByName(moduleName, functionName);

  if (!func) {
    return (
      <TerminalCard title="Error" variant="orange">
        <p className="text-cyber-red">Function {functionName} not found in module {moduleName}</p>
      </TerminalCard>
    );
  }

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters(prev => ({ ...prev, [paramName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Convert string parameters to appropriate types
      const convertedParams: Record<string, unknown> = {};
      
      func.parameters.forEach(param => {
        const value = parameters[param.name];
        if (value === undefined || value === '') {
          if (param.required) {
            throw new Error(`Required parameter ${param.name} is missing`);
          }
          return;
        }

        switch (param.type) {
          case 'number':
            convertedParams[param.name] = Number(value);
            break;
          case 'boolean':
            convertedParams[param.name] = value.toLowerCase() === 'true';
            break;
          case 'object':
          case 'array':
            try {
              convertedParams[param.name] = JSON.parse(value);
            } catch {
              convertedParams[param.name] = value;
            }
            break;
          default:
            convertedParams[param.name] = value;
        }
      });

      const response = await CodeboltAPI.callFunction(moduleName, functionName, convertedParams);
      setResult(response);
      onExecute?.(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <TerminalCard title={`${moduleName} - ${functionName}`} variant="blue">
        <div className="mb-4">
          <p className="text-cyber-blue text-sm mb-2">{func.description}</p>
          <div className="text-xs text-gray-500">
            Returns: <span className="text-cyber-green">{func.returnType}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {func.parameters.map((param) => (
            <div key={param.name} className="space-y-2">
              <label className="text-cyber-green text-sm font-mono">
                {param.name}
                {param.required && <span className="text-cyber-red ml-1">*</span>}
                <span className="text-gray-500 ml-2">({param.type})</span>
              </label>
              
              {param.type === 'object' || param.type === 'array' ? (
                <textarea
                  value={parameters[param.name] || ''}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  placeholder={`Enter ${param.type} as JSON...`}
                  className="w-full p-2 border border-cyber-green bg-cyber-black/50 text-cyber-green font-mono text-sm rounded"
                  rows={4}
                />
              ) : (
                <TerminalInput
                  value={parameters[param.name] || ''}
                  onChange={(value) => handleParameterChange(param.name, value)}
                  placeholder={param.description || `Enter ${param.name}...`}
                  variant="green"
                  type={param.type === 'number' ? 'number' : 'text'}
                />
              )}
              
              {param.description && (
                <p className="text-xs text-gray-600">{param.description}</p>
              )}
            </div>
          ))}

          <div className="flex space-x-4">
            <TerminalButton
              type="submit"
              disabled={loading}
              variant="green"
              className="flex-1"
            >
              {loading ? 'EXECUTING...' : 'EXECUTE'}
            </TerminalButton>
            
            <TerminalButton
              type="button"
              onClick={() => {
                setParameters({});
                setResult(null);
                setError('');
              }}
              variant="orange"
            >
              CLEAR
            </TerminalButton>
          </div>
        </form>
      </TerminalCard>

      {error && (
        <TerminalOutput content={error} variant="error" />
      )}

      {result && (
        <TerminalCard title="Response" variant="green">
          <TerminalOutput content={String(result)} variant="success" />
        </TerminalCard>
      )}
    </div>
  );
};

export default ModuleForm;
