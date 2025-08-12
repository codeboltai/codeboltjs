/**
 * @codebolt/types - Main Entry Point
 * 
 * This package provides modular exports for WebSocket types and schemas.
 * 
 * Usage Examples:
 * 
 * // Import specific schemas
 * import { agentLocationSchema } from '@codebolt/types/agent-to-app-ws-schema';
 * 
 * // Import specific types
 * import { AgentLocation } from '@codebolt/types/agent-to-app-ws-types';
 * 
 * // Import UI-to-App schemas
 * import { agentStatusSchema } from '@codebolt/types/ui-to-app-ws-schema';
 * 
 * // Import App-to-UI schemas
 * import { appToUIAgentStatusSchema } from '@codebolt/types/app-to-ui-ws-schema';
 * 
 * Available Modules:
 * - agent-to-app-ws-schema: Zod schemas for agent-to-app communication
 * - agent-to-app-ws-types: TypeScript types for agent-to-app communication
 * - app-to-agent-ws-schema: Zod schemas for app-to-agent communication  
 * - app-to-agent-ws-types: TypeScript types for app-to-agent communication
 * - ui-to-app-ws-schema: Zod schemas for UI-to-app communication
 * - ui-to-app-ws-types: TypeScript types for UI-to-app communication
 * - app-to-ui-ws-schema: Zod schemas for app-to-UI communication
 * - app-to-ui-ws-types: TypeScript types for app-to-UI communication
 */

// Note: Use modular imports to avoid naming conflicts
// Example: import { agentLocationSchema } from '@codebolt/types/agent-to-app-ws-schema'; 

import * as messageEnums from "./codeboltjstypes/message.enum";

