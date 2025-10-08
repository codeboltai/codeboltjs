/**
 * WebSocket Server Constants
 * Contains all constant values used in WebSocket operations
 */

export const WEBSOCKET_CONSTANTS = {
  MESSAGES: {
    REGISTRATION_SUCCESS: 'Successfully registered',
    AUTO_REGISTRATION_SUCCESS: 'Successfully auto-registered from connection parameters',
    CONNECTION_NOT_REGISTERED: 'Connection not registered. Please send register message first.',
    INVALID_MESSAGE_FORMAT: 'Invalid message format',
    MISSING_TYPE_FIELD: 'Invalid message format: missing type field'
  },
  EVENTS: {
    CONNECTION: 'connection',
    MESSAGE: 'message',
    CLOSE: 'close',
    ERROR: 'error'
  },
  MESSAGE_TYPES: {
    REGISTER: 'register',
    REGISTERED: 'registered',
    CONNECTION: 'connection',
    RESPONSE: 'response',
    NOTIFICATION: 'notification'
  },
  CLIENT_TYPES: {
    AGENT: 'agent',
    APP: 'app',
    TUI: 'tui'
  }
} as const;

export const WEBSOCKET_DEFAULTS = {
  BROADCAST_WARNING_THRESHOLD: 0,
  CONNECTION_TIMEOUT: 30000,
  HEARTBEAT_INTERVAL: 25000
} as const;

export const WEBSOCKET_ERRORS = {
  CONNECTION_FAILED: 'Failed to establish WebSocket connection',
  REGISTRATION_FAILED: 'Failed to register connection',
  MESSAGE_SEND_FAILED: 'Failed to send message',
  INVALID_CLIENT_TYPE: 'Invalid client type provided',
  MISSING_REQUIRED_PARAMS: 'Missing required connection parameters'
} as const;
