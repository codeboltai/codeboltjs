import { BaseMessage } from './messages';

/**
 * Type guards for message validation
 */

export function isMessageWithType(message: unknown): message is { type: string; id?: string; clientType?: string; clientId?: string } {
  return typeof message === 'object' && message !== null && 'type' in message;
}

export function isBaseMessage(message: unknown): message is BaseMessage {
  return (
    isMessageWithType(message) &&
    typeof (message as BaseMessage).id === 'string' &&
    typeof (message as BaseMessage).type === 'string'
  );
}

export function isRegisterMessage(message: unknown): message is { type: 'register'; clientType: string } {
  return (
    isMessageWithType(message) &&
    message.type === 'register' &&
    typeof (message as any).clientType === 'string'
  );
}

/**
 * Utility functions for message handling
 */

export function createErrorResponse(messageId: string, error: string, originalRequest?: unknown): any {
  return {
    id: messageId,
    type: 'response',
    success: false,
    error,
    originalRequest,
    timestamp: new Date().toISOString(),
  };
}

export function createSuccessResponse(messageId: string, data: unknown, clientId?: string): any {
  return {
    id: messageId,
    type: 'response',
    success: true,
    data,
    clientId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Path validation utilities
 */

export function isValidFilePath(filepath: string): boolean {
  // Security check - prevent path traversal
  if (filepath.includes('..')) {
    return false;
  }
  
  // Only allow absolute paths
  if (!isAbsolutePath(filepath)) {
    return false;
  }
  
  return true;
}

export function isAbsolutePath(filepath: string): boolean {
  // Cross-platform absolute path check
  return filepath.startsWith('/') || /^[A-Za-z]:\\/.test(filepath);
}

/**
 * Logging utilities
 */

export function formatLogMessage(level: 'info' | 'error' | 'warn' | 'debug', source: string, message: string): string {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    error: '❌',
    warn: '⚠️',
    debug: '🐛'
  }[level];
  
  return `${timestamp} ${emoji} [${source}] ${message}`;
}

/**
 * Delay utility
 */

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random ID
 */

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}