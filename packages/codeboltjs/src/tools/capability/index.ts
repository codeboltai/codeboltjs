/**
 * Capability management tools
 */

export { CapabilityListTool, type CapabilityListToolParams } from './capability-list';
export { CapabilityListSkillsTool, type CapabilityListSkillsToolParams } from './capability-list-skills';
export { CapabilityListPowersTool, type CapabilityListPowersToolParams } from './capability-list-powers';
export { CapabilityGetDetailTool, type CapabilityGetDetailToolParams } from './capability-get-detail';
export { CapabilityStartTool, type CapabilityStartToolParams } from './capability-start';
export { CapabilityStartSkillTool, type CapabilityStartSkillToolParams } from './capability-start-skill';
export { CapabilityStopTool, type CapabilityStopToolParams } from './capability-stop';
export { CapabilityGetStatusTool, type CapabilityGetStatusToolParams } from './capability-get-status';

// Create instances for convenience
import { CapabilityListTool } from './capability-list';
import { CapabilityListSkillsTool } from './capability-list-skills';
import { CapabilityListPowersTool } from './capability-list-powers';
import { CapabilityGetDetailTool } from './capability-get-detail';
import { CapabilityStartTool } from './capability-start';
import { CapabilityStartSkillTool } from './capability-start-skill';
import { CapabilityStopTool } from './capability-stop';
import { CapabilityGetStatusTool } from './capability-get-status';

/**
 * All capability management tools
 */
export const capabilityTools = [
    new CapabilityListTool(),
    new CapabilityListSkillsTool(),
    new CapabilityListPowersTool(),
    new CapabilityGetDetailTool(),
    new CapabilityStartTool(),
    new CapabilityStartSkillTool(),
    new CapabilityStopTool(),
    new CapabilityGetStatusTool(),
];
