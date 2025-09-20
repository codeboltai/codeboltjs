/**
 * Error screen component
 */

import React from 'react';
import { Box, Text } from 'ink';

interface ErrorScreenProps {
  error?: Error;
  onRetry: () => void;
  serverPath?: string;
  serverScript?: string;
  agentPath?: string;
  agentScript?: string;
  connectionUrl?: string;
}

export function ErrorScreen({ 
  error, 
  onRetry, 
  serverPath, 
  serverScript, 
  agentPath, 
  agentScript, 
  connectionUrl 
}: ErrorScreenProps) {
  return (
    <Box 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      height="100%"
      borderStyle="single" 
      borderColor="red"
      padding={2}
    >
      <Text color="red" bold>❌ Error</Text>
      
      <Box marginTop={1} marginBottom={2}>
        <Text>
          {error?.message || 'An unknown error occurred'}
        </Text>
      </Box>

      {/* Display connection and path information */}
      <Box marginBottom={2} flexDirection="column" borderStyle="single" borderColor="yellow" padding={1}>
        <Text color="yellow" bold>🔧 Configuration Details:</Text>
        
        {connectionUrl && (
          <Box marginTop={1}>
            <Text color="cyan">TUI Connection: {connectionUrl}</Text>
          </Box>
        )}
        
        {serverPath && (
          <Box>
            <Text color="blue">Server Path: {serverPath}</Text>
          </Box>
        )}
        
        {serverScript && (
          <Box>
            <Text color="gray">Server Script: {serverScript}</Text>
          </Box>
        )}
        
        {agentPath && (
          <Box>
            <Text color="green">Agent Path: {agentPath}</Text>
          </Box>
        )}
        
        {agentScript && (
          <Box>
            <Text color="gray">Agent Script: {agentScript}</Text>
          </Box>
        )}
      </Box>
      
      {error?.stack && (
        <Box marginBottom={2} flexDirection="column">
          <Text color="gray">Stack trace:</Text>
          <Text color="gray">{error.stack.slice(0, 500)}</Text>
        </Box>
      )}
      
      <Box>
        <Text color="cyan">Press 'r' to retry or 'q' to quit</Text>
      </Box>
    </Box>
  );
}
