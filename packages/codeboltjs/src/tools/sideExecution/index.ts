/**
 * Side Execution tools
 */

export { SideExecutionStartActionBlockTool, type SideExecutionStartActionBlockParams } from './side-exec-start-action-block';
export { SideExecutionStartCodeTool, type SideExecutionStartCodeParams } from './side-exec-start-code';
export { SideExecutionStopTool, type SideExecutionStopParams } from './side-exec-stop';
export { SideExecutionListActionBlocksTool, type SideExecutionListActionBlocksParams } from './side-exec-list-action-blocks';
export { SideExecutionGetStatusTool, type SideExecutionGetStatusParams } from './side-exec-get-status';

// Create instances for convenience
import { SideExecutionStartActionBlockTool } from './side-exec-start-action-block';
import { SideExecutionStartCodeTool } from './side-exec-start-code';
import { SideExecutionStopTool } from './side-exec-stop';
import { SideExecutionListActionBlocksTool } from './side-exec-list-action-blocks';
import { SideExecutionGetStatusTool } from './side-exec-get-status';

/**
 * All side execution tools
 */
export const sideExecutionTools = [
    new SideExecutionStartActionBlockTool(),
    new SideExecutionStartCodeTool(),
    new SideExecutionStopTool(),
    new SideExecutionListActionBlocksTool(),
    new SideExecutionGetStatusTool(),
];
