/**
 * User Message Manager Tools
 * 
 * Tools for accessing current user message and context.
 */

export { UserMessageGetCurrentTool } from './user-message-get-current';
export { UserMessageGetTextTool } from './user-message-get-text';
export { UserMessageGetConfigTool } from './user-message-get-config';
export { UserMessageGetMentionedFilesTool } from './user-message-get-mentioned-files';

import { UserMessageGetCurrentTool } from './user-message-get-current';
import { UserMessageGetTextTool } from './user-message-get-text';
import { UserMessageGetConfigTool } from './user-message-get-config';
import { UserMessageGetMentionedFilesTool } from './user-message-get-mentioned-files';

/**
 * Array of all user message manager tools
 */
export const userMessageManagerTools = [
    new UserMessageGetCurrentTool(),
    new UserMessageGetTextTool(),
    new UserMessageGetConfigTool(),
    new UserMessageGetMentionedFilesTool(),
];
