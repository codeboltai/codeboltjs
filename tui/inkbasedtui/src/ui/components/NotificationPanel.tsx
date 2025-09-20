/**
 * Notification panel component
 */

import React from 'react';
import { Box, Text } from 'ink';
import { NotificationMessage } from '../../services/WebSocketClient.js';

interface NotificationPanelProps {
  notifications: NotificationMessage[];
  active: boolean;
}

export function NotificationPanel({ notifications, active }: NotificationPanelProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'agent-connected': return '🤖';
      case 'agent-disconnected': return '💤';
      case 'client-connected': return '👤';
      case 'client-disconnected': return '👻';
      case 'file-read': return '📖';
      case 'file-write': return '✏️';
      case 'ai-request': return '🧠';
      case 'ai-response': return '💡';
      default: return '📢';
    }
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'agent-connected':
      case 'client-connected': return 'green';
      case 'agent-disconnected':
      case 'client-disconnected': return 'red';
      case 'file-read':
      case 'file-write': return 'blue';
      case 'ai-request':
      case 'ai-response': return 'magenta';
      default: return 'gray';
    }
  };

  return (
    <Box flexDirection="column" padding={1} height="100%">
      <Text color={active ? 'blue' : 'white'} bold>
        🔔 Notifications {notifications.length > 0 && `(${notifications.length})`}
      </Text>
      
      <Box flexDirection="column" marginTop={1} overflowY="hidden">
        {notifications.length === 0 ? (
          <Text color="gray" italic>No notifications yet...</Text>
        ) : (
          notifications.slice(-10).map((notification, index) => (
            <Box key={index} marginBottom={0}>
              <Text color="gray">[{formatTime(notification.timestamp)}]</Text>
              <Text> </Text>
              <Text>{getEventIcon(notification.event)}</Text>
              <Text> </Text>
              <Text color={getEventColor(notification.event)}>
                {notification.event}
              </Text>
              {notification.data && (
                <>
                  <Text>: </Text>
                  <Text color="white">
                    {typeof notification.data === 'string' 
                      ? notification.data.slice(0, 40) + (notification.data.length > 40 ? '...' : '')
                      : JSON.stringify(notification.data).slice(0, 40)
                    }
                  </Text>
                </>
              )}
            </Box>
          ))
        )}
      </Box>
      
      {active && (
        <Box marginTop={1}>
          <Text color="gray" italic>Press 'c' to clear notifications</Text>
        </Box>
      )}
    </Box>
  );
}
