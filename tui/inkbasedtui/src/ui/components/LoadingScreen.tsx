/**
 * Loading screen component
 */

import React from 'react';
import { Box, Text } from 'ink';
// import Spinner from 'ink-spinner'; // Removed to prevent scrolling
// Removed animated components to prevent scrolling
// import BigText from 'ink-big-text';
// import Gradient from 'ink-gradient';

interface LoadingScreenProps {
  message: string;
  serverPath?: string;
  agentPath?: string;
  connectionUrl?: string;
}

export function LoadingScreen({ message, serverPath, agentPath, connectionUrl }: LoadingScreenProps) {
  return (
    <Box 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      height="100%"
    >
      <Text color="blue" bold>
        ╔═══════════════════════════════════════════════════════════════╗
      </Text>
      <Text color="blue" bold>
        ║                    CODEBOLT CLI v0.1.0                        ║
      </Text>
      <Text color="blue" bold>
        ╚═══════════════════════════════════════════════════════════════╝
      </Text>
      
      <Box marginTop={2} alignItems="center">
        <Text color="cyan">⏳ {message}</Text>
      </Box>
      
      <Box marginTop={1}>
        <Text color="gray">Please wait...</Text>
      </Box>

      {/* Show configuration details during loading */}
      {(serverPath || agentPath || connectionUrl) && (
        <Box marginTop={2} flexDirection="column" borderStyle="single" borderColor="cyan" padding={1}>
          <Text color="cyan" bold>🔧 Configuration:</Text>
          
          {connectionUrl && (
            <Box marginTop={1}>
              <Text color="yellow">TUI Connection: {connectionUrl}</Text>
            </Box>
          )}
          
          {serverPath && (
            <Box>
              <Text color="blue">Server Path: {serverPath}</Text>
            </Box>
          )}
          
          {agentPath && (
            <Box>
              <Text color="green">Agent Path: {agentPath}</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
