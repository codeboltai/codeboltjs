/**
 * @codebolt/types - Main Entry Point
 * 
 * This package provides TypeScript types for WebSocket communication.
 * 
 * For SDK types, use: import { ... } from '@codebolt/types/sdk'
 */

// Export WebSocket message types (for internal communication)
export * from './codeboltjstypes/message.enum';
export * from './codeboltjstypes/notification.enum';

// Note: agent-to-app-ws-types and app-to-agent-ws-types are kept separate 
// to avoid naming conflicts. Import them directly if needed:
// import { ... } from '@codebolt/types/agent-to-app-ws-types';
// import { ... } from '@codebolt/types/app-to-agent-ws-types';
