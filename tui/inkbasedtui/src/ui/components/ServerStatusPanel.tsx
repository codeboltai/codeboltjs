/**
 * Server status panel component
 */

import React from 'react';
import { Box, Text } from 'ink';
// import Spinner from 'ink-spinner'; // Removed to prevent scrolling
import { ServerStatus } from '../../services/ServerManager.js';
import { AgentStatus } from '../../services/AgentManager.js';

interface ServerStatusPanelProps {
  status: ServerStatus;
  agentStatus: AgentStatus;
  wsConnected: boolean;
  connectionUrl: string;
  active: boolean;
  lastError?: string;
  retryCount?: number;
  isRetrying?: boolean;
}

export function ServerStatusPanel({ 
  status, 
  agentStatus, 
  wsConnected, 
  connectionUrl, 
  active, 
  lastError, 
  retryCount, 
  isRetrying 
}: ServerStatusPanelProps) {
  const formatUptime = (uptime?: number) => {
    if (!uptime) return 'N/A';
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text color={active ? 'blue' : 'white'} bold>
        📊 Server Status
      </Text>
      
      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text>Status: </Text>
                  {status.running ? (
          <Text color="green">🟢 Running</Text>
        ) : (
          <Text color="red">⚫ Stopped</Text>
        )}
        </Box>

        <Box>
          <Text>Address: </Text>
          <Text color="cyan">{status.host}:{status.port}</Text>
        </Box>

        {status.serverPath && (
          <Box>
            <Text>Server Path: </Text>
            <Text color="blue">{status.serverPath}</Text>
          </Box>
        )}

        {status.serverScript && (
          <Box>
            <Text>Server Script: </Text>
            <Text color="yellow" bold>{status.serverScript}</Text>
          </Box>
        )}

        {status.pid && (
          <Box>
            <Text>PID: </Text>
            <Text color="yellow">{status.pid}</Text>
          </Box>
        )}

        <Box>
          <Text>Uptime: </Text>
          <Text color="magenta">{formatUptime(status.uptime)}</Text>
        </Box>

        <Box marginTop={1}>
          <Text>WebSocket: </Text>
          {wsConnected ? (
            <Text color="green">🟢 Connected</Text>
          ) : isRetrying ? (
            <Text color="yellow">🟡 Connecting... (Attempt {retryCount})</Text>
          ) : (
            <Text color="red">🔴 Disconnected</Text>
          )}
        </Box>

        <Box>
          <Text>TUI Connection: </Text>
          <Text color="cyan">{connectionUrl}</Text>
        </Box>

        {lastError && (
          <Box marginTop={1}>
            <Text color="red">Last Error: </Text>
            <Text color="red">{lastError}</Text>
          </Box>
        )}

        {isRetrying && (
          <Box>
            <Text color="yellow">🔄 Retrying connection...</Text>
          </Box>
        )}

        <Box marginTop={1}>
          <Text>Agent: </Text>
                  {agentStatus.running ? (
          <Text color="green">🤖 Running</Text>
        ) : (
          <Text color="red">⚫ Stopped</Text>
        )}
        </Box>

        {agentStatus.agentId && (
          <Box>
            <Text>Agent ID: </Text>
            <Text color="cyan">{agentStatus.agentId}</Text>
          </Box>
        )}

        {agentStatus.agentPath && (
          <Box>
            <Text>Agent Path: </Text>
            <Text color="blue">{agentStatus.agentPath}</Text>
          </Box>
        )}

        {agentStatus.agentScript && (
          <Box>
            <Text>Agent Script: </Text>
            <Text color="yellow" bold>{agentStatus.agentScript}</Text>
          </Box>
        )}

        {status.connections && (
          <Box marginTop={1} flexDirection="column">
            <Text color="gray">Connections:</Text>
            <Box marginLeft={2}>
              <Text>Agents: </Text>
              <Text color="blue">{status.connections.agents}</Text>
            </Box>
            <Box marginLeft={2}>
              <Text>Clients: </Text>
              <Text color="green">{status.connections.clients}</Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
