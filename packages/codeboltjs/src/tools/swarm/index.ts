/**
 * Swarm operations tools
 */

// Export tool classes and parameter types
export { SwarmCreateTool, type SwarmCreateToolParams } from './swarm-create';
export { SwarmListTool, type SwarmListToolParams } from './swarm-list';
export { SwarmGetTool, type SwarmGetToolParams } from './swarm-get';
export { SwarmGetAgentsTool, type SwarmGetAgentsToolParams } from './swarm-get-agents';
export { SwarmRegisterAgentTool, type SwarmRegisterAgentToolParams } from './swarm-register-agent';
export { SwarmUnregisterAgentTool, type SwarmUnregisterAgentToolParams } from './swarm-unregister-agent';
export { SwarmCreateTeamTool, type SwarmCreateTeamToolParams } from './swarm-create-team';
export { SwarmListTeamsTool, type SwarmListTeamsToolParams } from './swarm-list-teams';
export { SwarmGetTeamTool, type SwarmGetTeamToolParams } from './swarm-get-team';
export { SwarmJoinTeamTool, type SwarmJoinTeamToolParams } from './swarm-join-team';
export { SwarmLeaveTeamTool, type SwarmLeaveTeamToolParams } from './swarm-leave-team';
export { SwarmDeleteTeamTool, type SwarmDeleteTeamToolParams } from './swarm-delete-team';
export { SwarmCreateRoleTool, type SwarmCreateRoleToolParams } from './swarm-create-role';
export { SwarmListRolesTool, type SwarmListRolesToolParams } from './swarm-list-roles';
export { SwarmGetRoleTool, type SwarmGetRoleToolParams } from './swarm-get-role';
export { SwarmAssignRoleTool, type SwarmAssignRoleToolParams } from './swarm-assign-role';
export { SwarmUnassignRoleTool, type SwarmUnassignRoleToolParams } from './swarm-unassign-role';
export { SwarmGetAgentsByRoleTool, type SwarmGetAgentsByRoleToolParams } from './swarm-get-agents-by-role';
export { SwarmDeleteRoleTool, type SwarmDeleteRoleToolParams } from './swarm-delete-role';
export { SwarmCreateVacancyTool, type SwarmCreateVacancyToolParams } from './swarm-create-vacancy';
export { SwarmListVacanciesTool, type SwarmListVacanciesToolParams } from './swarm-list-vacancies';
export { SwarmApplyVacancyTool, type SwarmApplyVacancyToolParams } from './swarm-apply-vacancy';
export { SwarmCloseVacancyTool, type SwarmCloseVacancyToolParams } from './swarm-close-vacancy';
export { SwarmUpdateStatusTool, type SwarmUpdateStatusToolParams } from './swarm-update-status';
export { SwarmGetStatusSummaryTool, type SwarmGetStatusSummaryToolParams } from './swarm-get-status-summary';
export { SwarmGetDefaultJobGroupTool, type SwarmGetDefaultJobGroupToolParams } from './swarm-get-default-job-group';

// Import tool classes for creating instances
import { SwarmCreateTool } from './swarm-create';
import { SwarmListTool } from './swarm-list';
import { SwarmGetTool } from './swarm-get';
import { SwarmGetAgentsTool } from './swarm-get-agents';
import { SwarmRegisterAgentTool } from './swarm-register-agent';
import { SwarmUnregisterAgentTool } from './swarm-unregister-agent';
import { SwarmCreateTeamTool } from './swarm-create-team';
import { SwarmListTeamsTool } from './swarm-list-teams';
import { SwarmGetTeamTool } from './swarm-get-team';
import { SwarmJoinTeamTool } from './swarm-join-team';
import { SwarmLeaveTeamTool } from './swarm-leave-team';
import { SwarmDeleteTeamTool } from './swarm-delete-team';
import { SwarmCreateRoleTool } from './swarm-create-role';
import { SwarmListRolesTool } from './swarm-list-roles';
import { SwarmGetRoleTool } from './swarm-get-role';
import { SwarmAssignRoleTool } from './swarm-assign-role';
import { SwarmUnassignRoleTool } from './swarm-unassign-role';
import { SwarmGetAgentsByRoleTool } from './swarm-get-agents-by-role';
import { SwarmDeleteRoleTool } from './swarm-delete-role';
import { SwarmCreateVacancyTool } from './swarm-create-vacancy';
import { SwarmListVacanciesTool } from './swarm-list-vacancies';
import { SwarmApplyVacancyTool } from './swarm-apply-vacancy';
import { SwarmCloseVacancyTool } from './swarm-close-vacancy';
import { SwarmUpdateStatusTool } from './swarm-update-status';
import { SwarmGetStatusSummaryTool } from './swarm-get-status-summary';
import { SwarmGetDefaultJobGroupTool } from './swarm-get-default-job-group';

/**
 * All swarm operation tools
 */
export const swarmTools = [
    // Swarm Management
    new SwarmCreateTool(),
    new SwarmListTool(),
    new SwarmGetTool(),
    new SwarmGetAgentsTool(),
    // Agent Registration
    new SwarmRegisterAgentTool(),
    new SwarmUnregisterAgentTool(),
    // Team Management
    new SwarmCreateTeamTool(),
    new SwarmListTeamsTool(),
    new SwarmGetTeamTool(),
    new SwarmJoinTeamTool(),
    new SwarmLeaveTeamTool(),
    new SwarmDeleteTeamTool(),
    // Role Management
    new SwarmCreateRoleTool(),
    new SwarmListRolesTool(),
    new SwarmGetRoleTool(),
    new SwarmAssignRoleTool(),
    new SwarmUnassignRoleTool(),
    new SwarmGetAgentsByRoleTool(),
    new SwarmDeleteRoleTool(),
    // Vacancy Management
    new SwarmCreateVacancyTool(),
    new SwarmListVacanciesTool(),
    new SwarmApplyVacancyTool(),
    new SwarmCloseVacancyTool(),
    // Status Management
    new SwarmUpdateStatusTool(),
    new SwarmGetStatusSummaryTool(),
    // Job Group Management
    new SwarmGetDefaultJobGroupTool(),
];
