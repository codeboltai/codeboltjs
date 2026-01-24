/**
 * Admin tools - Orchestrator, Codemap, Hook, and EventLog management tools
 */

export { OrchestratorListTool, type OrchestratorListToolParams } from './orchestrator-list';
export { OrchestratorGetTool, type OrchestratorGetToolParams } from './orchestrator-get';
export { OrchestratorCreateTool, type OrchestratorCreateToolParams } from './orchestrator-create';
export { OrchestratorUpdateTool, type OrchestratorUpdateToolParams } from './orchestrator-update';

export { CodemapListTool, type CodemapListToolParams } from './codemap-list';
export { CodemapGetTool, type CodemapGetToolParams } from './codemap-get';
export { CodemapCreateTool, type CodemapCreateToolParams } from './codemap-create';
export { CodemapUpdateTool, type CodemapUpdateToolParams } from './codemap-update';

export { HookCreateTool, type HookCreateToolParams } from './hook-create';
export { HookListTool, type HookListToolParams } from './hook-list';
export { HookGetTool, type HookGetToolParams } from './hook-get';
export { HookEnableTool, type HookEnableToolParams } from './hook-enable';
export { HookDisableTool, type HookDisableToolParams } from './hook-disable';

export { EventLogCreateInstanceTool, type EventLogCreateInstanceToolParams } from './eventlog-create-instance';
export { EventLogGetInstanceTool, type EventLogGetInstanceToolParams } from './eventlog-get-instance';
export { EventLogListInstancesTool, type EventLogListInstancesToolParams } from './eventlog-list-instances';
export { EventLogAppendEventTool, type EventLogAppendEventToolParams } from './eventlog-append-event';
export { EventLogQueryEventsTool, type EventLogQueryEventsToolParams } from './eventlog-query-events';
export { EventLogGetStatsTool, type EventLogGetStatsToolParams } from './eventlog-get-stats';

// Create instances for convenience
import { OrchestratorListTool } from './orchestrator-list';
import { OrchestratorGetTool } from './orchestrator-get';
import { OrchestratorCreateTool } from './orchestrator-create';
import { OrchestratorUpdateTool } from './orchestrator-update';

import { CodemapListTool } from './codemap-list';
import { CodemapGetTool } from './codemap-get';
import { CodemapCreateTool } from './codemap-create';
import { CodemapUpdateTool } from './codemap-update';

import { HookCreateTool } from './hook-create';
import { HookListTool } from './hook-list';
import { HookGetTool } from './hook-get';
import { HookEnableTool } from './hook-enable';
import { HookDisableTool } from './hook-disable';

import { EventLogCreateInstanceTool } from './eventlog-create-instance';
import { EventLogGetInstanceTool } from './eventlog-get-instance';
import { EventLogListInstancesTool } from './eventlog-list-instances';
import { EventLogAppendEventTool } from './eventlog-append-event';
import { EventLogQueryEventsTool } from './eventlog-query-events';
import { EventLogGetStatsTool } from './eventlog-get-stats';

/**
 * All admin tools
 */
export const adminTools = [
    new OrchestratorListTool(),
    new OrchestratorGetTool(),
    new OrchestratorCreateTool(),
    new OrchestratorUpdateTool(),
    new CodemapListTool(),
    new CodemapGetTool(),
    new CodemapCreateTool(),
    new CodemapUpdateTool(),
    new HookCreateTool(),
    new HookListTool(),
    new HookGetTool(),
    new HookEnableTool(),
    new HookDisableTool(),
    new EventLogCreateInstanceTool(),
    new EventLogGetInstanceTool(),
    new EventLogListInstancesTool(),
    new EventLogAppendEventTool(),
    new EventLogQueryEventsTool(),
    new EventLogGetStatsTool(),
];
