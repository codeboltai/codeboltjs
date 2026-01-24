/**
 * Orchestrator tools - Individual tools for orchestrator management
 */

// Orchestrator tools exports
export { OrchestratorListTool, type OrchestratorListParams } from './orchestrator-list';
export { OrchestratorGetTool, type OrchestratorGetParams } from './orchestrator-get';
export { OrchestratorGetSettingsTool, type OrchestratorGetSettingsParams } from './orchestrator-get-settings';
export { OrchestratorCreateTool, type OrchestratorCreateParams } from './orchestrator-create';
export { OrchestratorUpdateTool, type OrchestratorUpdateParams } from './orchestrator-update';
export { OrchestratorUpdateSettingsTool, type OrchestratorUpdateSettingsParams } from './orchestrator-update-settings';
export { OrchestratorDeleteTool, type OrchestratorDeleteParams } from './orchestrator-delete';
export { OrchestratorUpdateStatusTool, type OrchestratorUpdateStatusParams } from './orchestrator-update-status';

// Create instances for convenience
import { OrchestratorListTool } from './orchestrator-list';
import { OrchestratorGetTool } from './orchestrator-get';
import { OrchestratorGetSettingsTool } from './orchestrator-get-settings';
import { OrchestratorCreateTool } from './orchestrator-create';
import { OrchestratorUpdateTool } from './orchestrator-update';
import { OrchestratorUpdateSettingsTool } from './orchestrator-update-settings';
import { OrchestratorDeleteTool } from './orchestrator-delete';
import { OrchestratorUpdateStatusTool } from './orchestrator-update-status';

/**
 * All orchestrator tools
 */
export const orchestratorTools = [
    new OrchestratorListTool(),
    new OrchestratorGetTool(),
    new OrchestratorGetSettingsTool(),
    new OrchestratorCreateTool(),
    new OrchestratorUpdateTool(),
    new OrchestratorUpdateSettingsTool(),
    new OrchestratorDeleteTool(),
    new OrchestratorUpdateStatusTool(),
];
