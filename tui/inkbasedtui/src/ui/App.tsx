/**
 * Main App Component for Codebolt CLI
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import path from 'path';
import { ServerManager, ServerStatus } from '../services/ServerManager.js';
import { AgentManager, AgentStatus } from '../services/AgentManager.js';
import { WebSocketClient, NotificationMessage } from '../services/WebSocketClient.js';
import { CliArgs, getDefaultConfig, mergeConfig } from '../config/config.js';
import { setGlobalLogger } from '../codebolt.js';
import { Header } from './components/Header.js';
import { ServerStatusPanel } from './components/ServerStatusPanel.js';
import { NotificationPanel } from './components/NotificationPanel.js';
import { LogPanel } from './components/LogPanel.js';
import { InputPanel } from './components/InputPanel.js';
import { LoadingScreen } from './components/LoadingScreen.js';
import { ErrorScreen } from './components/ErrorScreen.js';

interface AppProps {
  serverManager: ServerManager;
  args: CliArgs;
}

type AppState = 'loading' | 'starting' | 'running';

interface AppData {
  serverStatus: ServerStatus;
  agentStatus: AgentStatus;
  notifications: NotificationMessage[];
  logs: string[];
  serverLogs: string[];
  agentLogs: string[];
  connectionUrl: string;
  lastError?: string;
  retryCount: number;
  isRetrying: boolean;
}

export function App({ serverManager, args }: AppProps) {
  const [state, setState] = useState<AppState>('loading');
  const [agentManager] = useState(() => new AgentManager());
  const [data, setData] = useState<AppData>({
    serverStatus: serverManager.getStatus(),
    agentStatus: agentManager.getStatus(),
    notifications: [],
    logs: [],
    serverLogs: [],
    agentLogs: [],
    connectionUrl: `ws://${args.host || 'localhost'}:${args.port || 3001}`,
    retryCount: 0,
    isRetrying: false,
  });
  const [wsClient] = useState(() => new WebSocketClient(args.host || 'localhost', args.port || 3001));
  const [activePanel, setActivePanel] = useState<'status' | 'notifications' | 'logs' | 'server-logs' | 'agent-logs' | 'input'>('input');
  const [panelVisibility, setPanelVisibility] = useState({
    status: true,
    logs: true,  // Show logs by default for debugging
    serverLogs: true, // Show server logs by default
    agentLogs: false,
    notifications: false, // Hide notifications by default
  });

  // Initialize the application
  useEffect(() => {
    // Set up global logger to route diagnostics to TUI logs
    setGlobalLogger((message: string) => {
      addLog(`[DIAGNOSTIC] ${message}`);
    });
    
    initializeApp();
    
    // Keep the process alive with a heartbeat (every 5 minutes)
    const keepAlive = setInterval(() => {
      // This prevents the Node.js event loop from exiting
      // when there are no active handles
      addLog('⏰ Keepalive heartbeat'); // Show we're still alive
    }, 300000); // 5 minutes instead of 30 seconds
    
    return () => {
      clearInterval(keepAlive);
    };
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      setState('starting');
      addLog('🚀 Initializing Codebolt CLI...');
      addLog(`📋 Arguments: ${JSON.stringify(args)}`);

      const config = mergeConfig(getDefaultConfig(), args);
      
      // Log configuration details early
      addLog(`🔧 TUI will connect to: ws://${config.server.host}:${config.server.port}`);
      
      // Determine expected server path (same logic as ServerManager)
      const isDev = process.env.CODEBOLT_ENV === 'dev';
      
      // Calculate the expected absolute paths (same logic as ServerManager)
      let expectedServerPath: string;
      if (config.server.path) {
        expectedServerPath = path.resolve(config.server.path);
      } else {
        // Use the same logic as ServerManager
        const currentDir = process.cwd(); // This will be the project root
        expectedServerPath = isDev 
          ? path.resolve(currentDir, 'packages/agentserver')
          : path.resolve(currentDir, 'apps/codebolt-code/server');
      }
      
      const expectedServerScript = isDev
        ? path.resolve(expectedServerPath, 'dist/server.mjs')
        : path.resolve(expectedServerPath, 'server.mjs');
      
      // For agent path calculation
      const expectedAgentPath = config.agent.path 
        ? path.resolve(config.agent.path)
        : path.resolve(process.cwd(), 'packages/sampleagent');
      
      const expectedAgentScript = path.resolve(expectedAgentPath, 'dist/index.js');
      
      addLog(`📁 Resolved server script: ${expectedServerScript}`);
      addLog(`🤖 Resolved agent script: ${expectedAgentScript}`);
      addLog(`⚙️ Environment: ${isDev ? 'development' : 'production'}`);

      // Update connection URL and expected paths
      setData(prev => ({
        ...prev,
        connectionUrl: `ws://${config.server.host}:${config.server.port}`,
        serverStatus: {
          ...prev.serverStatus,
          serverPath: expectedServerPath,
          serverScript: expectedServerScript,
        },
        agentStatus: {
          ...prev.agentStatus,
          agentPath: expectedAgentPath,
          agentScript: expectedAgentScript,
        }
      }));
      
      // Setup server manager event listeners
      serverManager.on('status-change', (status) => {
        setData(prev => ({ ...prev, serverStatus: status }));
      });

      serverManager.on('log', (message) => {
        addLog(message);
      });

      serverManager.on('server-log', (message) => {
        addServerLog(message);
      });

      serverManager.on('error', (error) => {
        addLog(`Server error: ${error.message}`);
        addServerLog(`[ERROR] ${error.message}`);
        setData(prev => ({ ...prev, lastError: error.message }));
        // Don't go to error state, keep trying
      });

      // Setup agent manager event listeners
      agentManager.on('status-change', (status) => {
        setData(prev => ({ ...prev, agentStatus: status }));
      });

      agentManager.on('log', (message) => {
        addLog(message);
      });

      agentManager.on('agent-log', (message) => {
        addAgentLog(message);
      });

      agentManager.on('error', (error) => {
        addLog(`Agent error: ${error.message}`);
        addAgentLog(`[ERROR] ${error.message}`);
      });

      // Check if we are in "Client-Only" mode.
      // The user wants to connect to an existing server.
      const isClientOnlyMode = args.host || args.port || args.noServer;

      addLog(`🔍 Client-only mode check: host=${args.host}, port=${args.port}, noServer=${args.noServer} => isClientOnly=${isClientOnlyMode}`);

      if (isClientOnlyMode) {
        addLog('Running in Client-Only mode. Skipping local server startup.');
      } else {
        // This is "TUI Mode". Start the server automatically.
        addLog('Starting local Codebolt server...');
        addServerLog('[TUI] Attempting to start local server process...');
        
        // Start server without awaiting to prevent blocking
        serverManager.start(
          config.server.port,
          config.server.host,
          config.server.path
        ).catch((error) => {
          addLog(`Server start failed: ${error.message}`);
          addServerLog(`[ERROR] Server start failed: ${error.message}`);
        });
      }

      // Start agent if configured
      if (config.agent.autoStart && !isClientOnlyMode) {
        addLog('Starting agent...');
        // Start agent without awaiting to prevent blocking
        setTimeout(() => {
          agentManager.start(
            config.server.host,
            config.server.port,
            config.agent.path
          ).catch((error) => {
            addLog(`Agent start failed: ${error.message}`);
            addAgentLog(`[ERROR] Agent start failed: ${error.message}`);
          });
        }, 2000); // Wait 2 seconds for server to start
      }

      // Connect WebSocket client (with retry logic)
      addLog(`Connecting to server at ${config.server.host}:${config.server.port}...`);
      setState('running'); // Always go to running state, show connection status in UI
      
      // Start connection retry with a delay to let server start
      setTimeout(() => {
        addLog('Starting connection retry loop...');
        startConnectionRetryLoop();
      }, 3000);
      
      addLog('Codebolt CLI initialized! Server and connection starting in background...');

    } catch (error: any) {
      addLog(`Initialization error: ${error}`);
      setData(prev => ({ ...prev, lastError: error.message }));
      setState('running'); // Still go to running state to show status
      
      // Start retry loop in a safe way
      setTimeout(() => {
        addLog('Starting fallback connection retry...');
        startConnectionRetryLoop(); // Keep trying to connect after a delay
      }, 1000);
    }
    
    // Always ensure we go to running state after a delay
    setTimeout(() => {
      addLog('🔄 Ensuring TUI is in running state...');
      setState('running');
    }, 500);
  }, [serverManager, args]);

  const startConnectionRetryLoop = useCallback(async () => {
    const maxRetries = 60; // Try for 5 minutes (60 * 5 seconds)
    let attempt = 0;
    
    const tryConnect = async (): Promise<boolean> => {
      try {
        attempt++;
        setData(prev => ({ ...prev, retryCount: attempt, isRetrying: true }));
        addLog(`Connection attempt ${attempt}/${maxRetries}...`);
        
        await connectWebSocketClient();
        
        setData(prev => ({ ...prev, isRetrying: false, lastError: undefined }));
        addLog('✅ Successfully connected to server!');
        addLog('🎉 TUI is now fully operational - should not exit');
        return true;
      } catch (error: any) {
        const errorMsg = error.message || 'Unknown connection error';
        setData(prev => ({ ...prev, lastError: errorMsg }));
        addLog(`Connection failed: ${errorMsg}`);
        
        if (attempt < maxRetries) {
          addLog(`Retrying in 5 seconds... (${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          return tryConnect();
        } else {
          addLog('❌ Max connection attempts reached. Will keep UI running.');
          setData(prev => ({ ...prev, isRetrying: false }));
          return false;
        }
      }
    };
    
    try {
      await tryConnect();
    } catch (error) {
      addLog(`❌ Connection retry loop error: ${error}`);
      // Don't let connection errors crash the TUI
    }
  }, []);

  const connectWebSocketClient = useCallback(async () => {
    // Setup WebSocket client event listeners
    wsClient.on('connected', () => {
      addLog('Connected to server WebSocket');
    });

    wsClient.on('disconnected', () => {
      addLog('Disconnected from server WebSocket');
    });

    wsClient.on('notification', (notification) => {
      addNotification(notification);
    });

    wsClient.on('log', (message) => {
      addLog(`[WS] ${message}`);
    });

    wsClient.on('error', (error) => {
      addLog(`WebSocket error: ${error.message}`);
      // Don't let WebSocket errors crash the TUI
    });

    try {
      await wsClient.connect();
    } catch (error: any) {
      addLog(`WebSocket connection failed: ${error.message || error}`);
      throw error; // Re-throw to be handled by retry logic
    }
  }, [wsClient]);

  // Throttled log updates to reduce flickering
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    // Use setTimeout to batch log updates
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        logs: [...prev.logs.slice(-99), logEntry], // Keep last 100 logs
      }));
    }, 0);
  }, []);

  const addServerLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    // Use setTimeout to batch server log updates
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        serverLogs: [...prev.serverLogs.slice(-99), logEntry], // Keep last 100 server logs
      }));
    }, 0);
  }, []);

  const addAgentLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    // Use setTimeout to batch agent log updates
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        agentLogs: [...prev.agentLogs.slice(-99), logEntry], // Keep last 100 agent logs
      }));
    }, 0);
  }, []);

  const addNotification = useCallback((notification: NotificationMessage) => {
    setData(prev => ({
      ...prev,
      notifications: [...prev.notifications.slice(-49), notification], // Keep last 50 notifications
    }));
  }, []);

  // Toggle panel visibility
  const togglePanel = useCallback((panel: 'status' | 'logs' | 'serverLogs' | 'agentLogs' | 'notifications') => {
    setPanelVisibility(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  }, []);

  // Handle keyboard input
  useInput((input, key) => {
    if (state !== 'running') return;

    // Don't handle shortcuts when input panel is active (to avoid interference with typing)
    // Only allow Tab and Ctrl+ shortcuts when input is active
    if (activePanel === 'input' && !key.tab && !key.ctrl) return;

    if (key.tab) {
      // Cycle through visible panels only
      const allPanels: Array<typeof activePanel> = ['input', 'status', 'notifications', 'logs', 'server-logs', 'agent-logs'];
      const visiblePanels = allPanels.filter(panel => 
        panel === 'input' || panelVisibility[panel.replace('-', '') as keyof typeof panelVisibility]
      );
      const currentIndex = visiblePanels.indexOf(activePanel);
      const nextIndex = (currentIndex + 1) % visiblePanels.length;
      setActivePanel(visiblePanels[nextIndex]);
      return;
    }

    // Ctrl+Q to quit
    if (key.ctrl && input === 'q') {
      process.exit(0);
    }

    // Ctrl+R to retry connection
    if (key.ctrl && input === 'r') {
      addLog('Manual retry initiated...');
      startConnectionRetryLoop();
    }

    // Ctrl+C to clear current panel
    if (key.ctrl && input === 'c') {
      if (activePanel === 'logs') {
        setData(prev => ({ ...prev, logs: [] }));
      } else if (activePanel === 'server-logs') {
        setData(prev => ({ ...prev, serverLogs: [] }));
      } else if (activePanel === 'agent-logs') {
        setData(prev => ({ ...prev, agentLogs: [] }));
      } else if (activePanel === 'notifications') {
        setData(prev => ({ ...prev, notifications: [] }));
      }
    }

    // Panel visibility toggles with Ctrl+
    if (key.ctrl && input === 's') {
      togglePanel('status');
    }

    if (key.ctrl && input === 'l') {
      togglePanel('logs');
    }

    if (key.ctrl && input === 'v') {
      togglePanel('serverLogs'); // Ctrl+V for server logs
    }

    if (key.ctrl && input === 'a') {
      togglePanel('agentLogs'); // Ctrl+A for agent logs
    }

    if (key.ctrl && input === 'n') {
      togglePanel('notifications');
    }
  });

  // Render different states
  if (state === 'loading' || state === 'starting') {
    return (
      <LoadingScreen 
        message={state === 'loading' ? 'Loading...' : 'Starting server...'} 
        serverPath={data.serverStatus.serverPath}
        agentPath={data.agentStatus.agentPath}
        connectionUrl={data.connectionUrl}
      />
    );
  }


  // Prevent render from returning null which could cause Ink to exit
  if (!data || state === 'loading') {
    return (
      <Box flexDirection="column" height="100%">
        <Text>🔄 Loading Codebolt CLI...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height="100%">
      <Header />
      
      {/* Main Content Area */}
      <Box flexGrow={1} flexDirection="row">
        {/* Left Panel - Server Status */}
        {panelVisibility.status && (
          <Box 
            width="30%" 
            borderStyle="single" 
            borderColor={activePanel === 'status' ? 'blue' : 'gray'}
          >
            <ServerStatusPanel 
              status={data.serverStatus}
              agentStatus={data.agentStatus}
              wsConnected={wsClient.isConnected()}
              connectionUrl={data.connectionUrl}
              active={activePanel === 'status'}
              lastError={data.lastError}
              retryCount={data.retryCount}
              isRetrying={data.isRetrying}
            />
          </Box>
        )}

        {/* Right Panel - Notifications and Logs */}
        <Box 
          width={panelVisibility.status ? "70%" : "100%"} 
          flexDirection="column"
        >
          {/* Calculate visible panels count for height distribution */}
          {(() => {
            const visiblePanels = [
              panelVisibility.notifications,
              panelVisibility.logs,
              panelVisibility.serverLogs,
              panelVisibility.agentLogs
            ].filter(Boolean).length;
            const panelHeight = visiblePanels > 0 ? `${100 / visiblePanels}%` : "100%";

            return (
              <>
                {/* Notifications */}
                {panelVisibility.notifications && (
                  <Box 
                    height={panelHeight}
                    borderStyle="single" 
                    borderColor={activePanel === 'notifications' ? 'blue' : 'gray'}
                  >
                    <NotificationPanel 
                      notifications={data.notifications}
                      active={activePanel === 'notifications'}
                    />
                  </Box>
                )}

                {/* General Logs */}
                {panelVisibility.logs && (
                  <Box 
                    height={panelHeight}
                    borderStyle="single" 
                    borderColor={activePanel === 'logs' ? 'blue' : 'gray'}
                  >
                    <LogPanel 
                      logs={data.logs}
                      active={activePanel === 'logs'}
                      title="General Logs"
                    />
                  </Box>
                )}

                {/* Server Logs */}
                {panelVisibility.serverLogs && (
                  <Box 
                    height={panelHeight}
                    borderStyle="single" 
                    borderColor={activePanel === 'server-logs' ? 'blue' : 'gray'}
                  >
                    <LogPanel 
                      logs={data.serverLogs}
                      active={activePanel === 'server-logs'}
                      title="Server Process Logs"
                    />
                  </Box>
                )}

                {/* Agent Logs */}
                {panelVisibility.agentLogs && (
                  <Box 
                    height={panelHeight}
                    borderStyle="single" 
                    borderColor={activePanel === 'agent-logs' ? 'blue' : 'gray'}
                  >
                    <LogPanel 
                      logs={data.agentLogs}
                      active={activePanel === 'agent-logs'}
                      title="Agent Process Logs"
                    />
                  </Box>
                )}

                {/* Show placeholder when no right panels are visible */}
                {visiblePanels === 0 && (
                  <Box 
                    height="100%"
                    borderStyle="single" 
                    borderColor="gray"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text color="gray" italic>
                      All panels hidden. Press 'n' for notifications, 'l' for logs, 'v' for server logs, 'a' for agent logs
                    </Text>
                  </Box>
                )}
              </>
            );
          })()}
        </Box>
      </Box>

      {/* Bottom Panel - Input (always visible) - Large and expandable */}
      <Box minHeight={10} borderStyle="single" borderColor={activePanel === 'input' ? 'blue' : 'gray'}>
        <InputPanel 
          wsClient={wsClient}
          active={activePanel === 'input'}
          onLog={addLog}
        />
      </Box>

      {/* Help text */}
      <Box height={1}>
        <Text color="gray">
          Tab: Switch panels | Ctrl+Q: Quit | Ctrl+R: Retry | Ctrl+S: Status | Ctrl+L: Logs | Ctrl+V: Server logs | Ctrl+A: Agent logs | Ctrl+N: Notifications | Ctrl+C: Clear panel
        </Text>
      </Box>
    </Box>
  );
}
