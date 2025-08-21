/**
 * Debug SDK Function Types
 * Types for the cbdebug module functions
 */

// Base response interface for debug operations
export interface BaseDebugSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Debug operation responses
export interface DebugAddLogResponse extends BaseDebugSDKResponse {
  logId?: string;
  timestamp?: string;
}

export interface OpenDebugBrowserResponse extends BaseDebugSDKResponse {
  url?: string;
  port?: number;
}

export interface DebugGetLogsResponse extends BaseDebugSDKResponse {
  logs?: Array<{
    id: string;
    message: string;
    level: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
}
