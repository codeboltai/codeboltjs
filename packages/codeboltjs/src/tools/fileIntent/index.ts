/**
 * File Intent tools - Individual tools for each file update intent action
 */

// Individual file intent tools
export { FileIntentCreateTool, type FileIntentCreateParams } from './file-intent-create';
export { FileIntentUpdateTool, type FileIntentUpdateParams } from './file-intent-update';
export { FileIntentGetTool, type FileIntentGetParams } from './file-intent-get';
export { FileIntentListTool, type FileIntentListParams } from './file-intent-list';
export { FileIntentCompleteTool, type FileIntentCompleteParams } from './file-intent-complete';
export { FileIntentCancelTool, type FileIntentCancelParams } from './file-intent-cancel';
export { FileIntentCheckOverlapTool, type FileIntentCheckOverlapParams } from './file-intent-check-overlap';
export { FileIntentGetBlockedTool, type FileIntentGetBlockedParams } from './file-intent-get-blocked';
export { FileIntentGetByAgentTool, type FileIntentGetByAgentParams } from './file-intent-get-by-agent';
export { FileIntentGetFilesWithIntentsTool, type FileIntentGetFilesWithIntentsParams } from './file-intent-get-files-with-intents';
export { FileIntentDeleteTool, type FileIntentDeleteParams } from './file-intent-delete';

// Create instances for convenience
import { FileIntentCreateTool } from './file-intent-create';
import { FileIntentUpdateTool } from './file-intent-update';
import { FileIntentGetTool } from './file-intent-get';
import { FileIntentListTool } from './file-intent-list';
import { FileIntentCompleteTool } from './file-intent-complete';
import { FileIntentCancelTool } from './file-intent-cancel';
import { FileIntentCheckOverlapTool } from './file-intent-check-overlap';
import { FileIntentGetBlockedTool } from './file-intent-get-blocked';
import { FileIntentGetByAgentTool } from './file-intent-get-by-agent';
import { FileIntentGetFilesWithIntentsTool } from './file-intent-get-files-with-intents';
import { FileIntentDeleteTool } from './file-intent-delete';

/**
 * All file intent tools
 */
export const fileIntentTools = [
    new FileIntentCreateTool(),
    new FileIntentUpdateTool(),
    new FileIntentGetTool(),
    new FileIntentListTool(),
    new FileIntentCompleteTool(),
    new FileIntentCancelTool(),
    new FileIntentCheckOverlapTool(),
    new FileIntentGetBlockedTool(),
    new FileIntentGetByAgentTool(),
    new FileIntentGetFilesWithIntentsTool(),
    new FileIntentDeleteTool(),
];
