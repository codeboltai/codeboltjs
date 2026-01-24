/**
 * User Message Utilities Tools
 * 
 * Tools for accessing current user message and context using utilities.
 */

export { UserUtilitiesGetCurrentTool } from './user-utilities-get-current';
export { UserUtilitiesGetTextTool } from './user-utilities-get-text';
export { UserUtilitiesGetMentionedMCPsTool } from './user-utilities-get-mentioned-mcps';
export { UserUtilitiesGetMentionedFilesTool } from './user-utilities-get-mentioned-files';
export { UserUtilitiesGetCurrentFileTool } from './user-utilities-get-current-file';
export { UserUtilitiesGetSelectionTool } from './user-utilities-get-selection';

import { UserUtilitiesGetCurrentTool } from './user-utilities-get-current';
import { UserUtilitiesGetTextTool } from './user-utilities-get-text';
import { UserUtilitiesGetMentionedMCPsTool } from './user-utilities-get-mentioned-mcps';
import { UserUtilitiesGetMentionedFilesTool } from './user-utilities-get-mentioned-files';
import { UserUtilitiesGetCurrentFileTool } from './user-utilities-get-current-file';
import { UserUtilitiesGetSelectionTool } from './user-utilities-get-selection';

/**
 * Array of all user message utilities tools
 */
export const userMessageUtilitiesTools = [
    new UserUtilitiesGetCurrentTool(),
    new UserUtilitiesGetTextTool(),
    new UserUtilitiesGetMentionedMCPsTool(),
    new UserUtilitiesGetMentionedFilesTool(),
    new UserUtilitiesGetCurrentFileTool(),
    new UserUtilitiesGetSelectionTool(),
];
