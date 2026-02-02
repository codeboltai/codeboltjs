'use client';

import React, { useState } from 'react';
import ModuleNavigation from '@/components/ModuleNavigation';
import ModuleForm from '@/components/ModuleForm';
import TerminalCard from '@/components/ui/TerminalCard';

export default function Home() {
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedFunction, setSelectedFunction] = useState<string>('');

  const handleModuleSelect = (moduleName: string, functionName: string) => {
    setSelectedModule(moduleName);
    setSelectedFunction(functionName);
  };

  return (
    <div className="min-h-screen bg-cyber-black text-text-primary main-content">
      {/* Header */}
      <div className="border-b border-cyber-green/30 bg-cyber-black/90 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-mono font-bold text-cyber-green">
                CODEBOLT JS
              </h1>
              <span className="text-cyber-blue text-sm">TERMINAL INTERFACE</span>
            </div>
            <div className="flex items-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                <span className="text-cyber-green">ONLINE</span>
              </div>
              <div className="text-cyber-blue">
                THREAD: c6a4f8dc-b017-4a11-b8d0-4caaecc3c6c1
              </div>
              <div className="text-cyber-orange">
                AGENT: 03ad0d21-738b-4b55-8ba5-ea8c39d3c539
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Module Navigation */}
        <div className="w-80 border-r border-cyber-green/30 p-4 overflow-hidden">
          <ModuleNavigation
            onModuleSelect={handleModuleSelect}
            selectedModule={selectedModule}
            selectedFunction={selectedFunction}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {selectedModule && selectedFunction ? (
            <ModuleForm
              moduleName={selectedModule}
              functionName={selectedFunction}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <TerminalCard title="WELCOME TO CODEBOLT JS TERMINAL" variant="green" className="max-w-2xl">
                <div className="space-y-4 text-center">
                  <p className="text-cyber-green">
                    Select a module and function from the navigation panel to begin testing codeboltjs functionality.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="border border-cyber-blue/30 p-3">
                      <h3 className="text-cyber-blue font-bold mb-2">Available Modules:</h3>
                      <ul className="text-xs space-y-1">
                        <li>• File System</li>
                        <li>• Chat</li>
                        <li>• Action Plan</li>
                        <li>• Terminal</li>
                        <li>• Browser</li>
                        <li>• Memory</li>
                        <li>• Git</li>
                      </ul>
                    </div>
                    <div className="border border-cyber-orange/30 p-3">
                      <h3 className="text-cyber-orange font-bold mb-2">Features:</h3>
                      <ul className="text-xs space-y-1">
                        <li>• Real-time execution</li>
                        <li>• Dynamic form generation</li>
                        <li>• Response visualization</li>
                        <li>• Error handling</li>
                        <li>• Parameter validation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TerminalCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
