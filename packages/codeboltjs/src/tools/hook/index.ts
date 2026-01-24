/**
 * Hook Tools
 * 
 * Tools for managing hooks that trigger actions based on events.
 */

export { HookInitializeTool } from './hook-initialize';
export { HookCreateTool } from './hook-create';
export { HookUpdateTool } from './hook-update';
export { HookDeleteTool } from './hook-delete';
export { HookListTool } from './hook-list';
export { HookGetTool } from './hook-get';
export { HookEnableTool } from './hook-enable';
export { HookDisableTool } from './hook-disable';

import { HookInitializeTool } from './hook-initialize';
import { HookCreateTool } from './hook-create';
import { HookUpdateTool } from './hook-update';
import { HookDeleteTool } from './hook-delete';
import { HookListTool } from './hook-list';
import { HookGetTool } from './hook-get';
import { HookEnableTool } from './hook-enable';
import { HookDisableTool } from './hook-disable';

/**
 * Array of all hook tools
 */
export const hookTools = [
    new HookInitializeTool(),
    new HookCreateTool(),
    new HookUpdateTool(),
    new HookDeleteTool(),
    new HookListTool(),
    new HookGetTool(),
    new HookEnableTool(),
    new HookDisableTool(),
];
