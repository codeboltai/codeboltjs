/**
 * State operations tools
 */

export { StateGetAppTool, type StateGetAppToolParams } from './state-get-app';
export { StateAddAgentTool, type StateAddAgentToolParams } from './state-add-agent';
export { StateGetAgentTool, type StateGetAgentToolParams } from './state-get-agent';
export { StateGetProjectTool, type StateGetProjectToolParams } from './state-get-project';
export { StateUpdateProjectTool, type StateUpdateProjectToolParams } from './state-update-project';

// Create instances for convenience
import { StateGetAppTool } from './state-get-app';
import { StateAddAgentTool } from './state-add-agent';
import { StateGetAgentTool } from './state-get-agent';
import { StateGetProjectTool } from './state-get-project';
import { StateUpdateProjectTool } from './state-update-project';

/**
 * All state operation tools
 */
export const stateTools = [
    new StateGetAppTool(),
    new StateAddAgentTool(),
    new StateGetAgentTool(),
    new StateGetProjectTool(),
    new StateUpdateProjectTool(),
];
