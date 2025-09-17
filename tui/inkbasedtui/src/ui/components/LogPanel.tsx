/**
 * Log panel component
 */

import React from 'react';
import { Box, Text } from 'ink';

interface LogPanelProps {
  logs: string[];
  active: boolean;
  title?: string;
}

export function LogPanel({ logs, active, title }: LogPanelProps) {
  const getLogColor = (log: string) => {
    if (log.includes('[SERVER ERROR]')) return 'red';
    if (log.includes('[SERVER]')) return 'green';
    if (log.includes('[WS]')) return 'blue';
    if (log.includes('error') || log.includes('Error')) return 'red';
    if (log.includes('warn') || log.includes('Warn')) return 'yellow';
    return 'white';
  };

  return (
    <Box flexDirection="column" padding={1} height="100%">
      <Text color={active ? 'blue' : 'white'} bold>
        📝 {title || 'Logs'} {logs.length > 0 && `(${logs.length})`}
      </Text>
      
      <Box flexDirection="column" marginTop={1} overflowY="hidden">
        {logs.length === 0 ? (
          <Text color="gray" italic>No logs yet...</Text>
        ) : (
          logs.slice(-15).map((log, index) => (
            <Text key={index} color={getLogColor(log)}>
              {log}
            </Text>
          ))
        )}
      </Box>
      
      {active && (
        <Box marginTop={1}>
          <Text color="gray" italic>Press 'c' to clear logs</Text>
        </Box>
      )}
    </Box>
  );
}
