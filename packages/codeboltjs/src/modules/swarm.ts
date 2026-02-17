import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    CreateSwarmRequest,
    AgentRegistration,
    CreateTeamRequest,
    CreateRoleRequest,
    CreateVacancyRequest,
    AgentStatusUpdate,
    CreateSwarmResponse,
    ListSwarmsResponse,
    GetSwarmResponse,
    GetSwarmAgentsResponse,
    RegisterAgentResponse,
    UnregisterAgentResponse,
    CreateTeamResponse,
    ListTeamsResponse,
    GetTeamResponse,
    JoinTeamResponse,
    LeaveTeamResponse,
    DeleteTeamResponse,
    CreateRoleResponse,
    ListRolesResponse,
    GetRoleResponse,
    AssignRoleResponse,
    UnassignRoleResponse,
    GetAgentsByRoleResponse,
    DeleteRoleResponse,
    CreateVacancyResponse,
    ListVacanciesResponse,
    ApplyForVacancyResponse,
    CloseVacancyResponse,
    UpdateStatusResponse,
    GetStatusSummaryResponse,
    GetDefaultJobGroupResponse,
    GetSwarmConfigResponse
} from '@codebolt/types/lib';

// Re-export types for convenience
export type {
    CreateSwarmRequest,
    AgentRegistration,
    CreateTeamRequest,
    CreateRoleRequest,
    CreateVacancyRequest,
    AgentStatusUpdate,
    Swarm,
    SwarmAgent,
    Team,
    Role,
    Vacancy,
    StatusSummary,
    SwarmResponse,
    CreateSwarmResponse,
    ListSwarmsResponse,
    GetSwarmResponse,
    GetSwarmAgentsResponse,
    RegisterAgentResponse,
    UnregisterAgentResponse,
    CreateTeamResponse,
    ListTeamsResponse,
    GetTeamResponse,
    JoinTeamResponse,
    LeaveTeamResponse,
    DeleteTeamResponse,
    CreateRoleResponse,
    ListRolesResponse,
    GetRoleResponse,
    AssignRoleResponse,
    UnassignRoleResponse,
    GetAgentsByRoleResponse,
    DeleteRoleResponse,
    CreateVacancyResponse,
    ListVacanciesResponse,
    ApplyForVacancyResponse,
    CloseVacancyResponse,
    UpdateStatusResponse,
    GetStatusSummaryResponse,
    GetDefaultJobGroupResponse,
    GetSwarmConfigResponse
} from '@codebolt/types/lib';

/**
 * Swarm Module
 * Provides functionality for managing swarms, agents, teams, roles, and vacancies
 */
const codeboltSwarm = {
    // ================================
    // Swarm Management
    // ================================

    /**
     * Create a new swarm
     * @param data - Swarm creation data
     * @returns Promise resolving to created swarm details
     */
    createSwarm: (data: CreateSwarmRequest): Promise<CreateSwarmResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'create',
                requestId,
                data
            },
            'swarmResponse'
        );
    },

    /**
     * List all available swarms
     * @returns Promise resolving to array of swarms
     */
    listSwarms: (): Promise<ListSwarmsResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'list',
                requestId
            },
            'swarmResponse'
        );
    },

    /**
     * Get details of a specific swarm
     * @param swarmId - ID of the swarm
     * @returns Promise resolving to swarm details
     */
    getSwarm: (swarmId: string): Promise<GetSwarmResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'get',
                requestId,
                swarmId
            },
            'swarmResponse'
        );
    },

    /**
     * Get all agents in a swarm
     * @param swarmId - ID of the swarm
     * @returns Promise resolving to array of agents
     */
    getSwarmAgents: (swarmId: string): Promise<GetSwarmAgentsResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'getAgents',
                requestId,
                swarmId
            },
            'swarmResponse'
        );
    },

    // ================================
    // Agent Registration
    // ================================

    /**
     * Register an agent to a swarm
     * @param swarmId - ID of the swarm
     * @param data - Agent registration data
     * @returns Promise resolving to registered agent ID
     */
    registerAgent: (swarmId: string, data: AgentRegistration): Promise<RegisterAgentResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'join',
                requestId,
                swarmId,
                data
            },
            'swarmResponse'
        );
    },

    /**
     * Unregister an agent from a swarm
     * @param swarmId - ID of the swarm
     * @param agentId - ID of the agent
     * @returns Promise resolving to success confirmation
     */
    unregisterAgent: (swarmId: string, agentId: string): Promise<UnregisterAgentResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'unregister',
                requestId,
                swarmId,
                agentId
            },
            'swarmResponse'
        );
    },

    // ================================
    // Team Management
    // ================================

    /**
     * Create a new team in a swarm
     * @param swarmId - ID of the swarm
     * @param data - Team creation data
     * @returns Promise resolving to created team details
     */
    createTeam: (swarmId: string, data: CreateTeamRequest): Promise<CreateTeamResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'createTeam',
                requestId,
                swarmId,
                data
            },
            'swarmResponse'
        );
    },

    /**
     * List all teams in a swarm
     * @param swarmId - ID of the swarm
     * @returns Promise resolving to array of teams
     */
    listTeams: (swarmId: string): Promise<ListTeamsResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'listTeams',
                requestId,
                swarmId
            },
            'swarmResponse'
        );
    },

    /**
     * Get details of a specific team
     * @param swarmId - ID of the swarm
     * @param teamId - ID of the team
     * @returns Promise resolving to team details with members
     */
    getTeam: (swarmId: string, teamId: string): Promise<GetTeamResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'getTeam',
                requestId,
                swarmId,
                teamId
            },
            'swarmResponse'
        );
    },

    /**
     * Add an agent to a team
     * @param swarmId - ID of the swarm
     * @param teamId - ID of the team
     * @param agentId - ID of the agent
     * @returns Promise resolving to success confirmation
     */
    joinTeam: (swarmId: string, teamId: string, agentId: string): Promise<JoinTeamResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'joinTeam',
                requestId,
                swarmId,
                teamId,
                agentId
            },
            'swarmResponse'
        );
    },

    /**
     * Remove an agent from a team
     * @param swarmId - ID of the swarm
     * @param teamId - ID of the team
     * @param agentId - ID of the agent
     * @returns Promise resolving to success confirmation
     */
    leaveTeam: (swarmId: string, teamId: string, agentId: string): Promise<LeaveTeamResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'leaveTeam',
                requestId,
                swarmId,
                teamId,
                agentId
            },
            'swarmResponse'
        );
    },

    /**
     * Delete a team from a swarm
     * @param swarmId - ID of the swarm
     * @param teamId - ID of the team
     * @returns Promise resolving to success confirmation
     */
    deleteTeam: (swarmId: string, teamId: string): Promise<DeleteTeamResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'deleteTeam',
                requestId,
                swarmId,
                teamId
            },
            'swarmResponse'
        );
    },

    // ================================
    // Role Management
    // ================================

    /**
     * Create a new role in a swarm
     * @param swarmId - ID of the swarm
     * @param data - Role creation data
     * @returns Promise resolving to created role details
     */
    createRole: (swarmId: string, data: CreateRoleRequest): Promise<CreateRoleResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'createRole',
                requestId,
                swarmId,
                data
            },
            'swarmResponse'
        );
    },

    /**
     * List all roles in a swarm
     * @param swarmId - ID of the swarm
     * @returns Promise resolving to array of roles
     */
    listRoles: (swarmId: string): Promise<ListRolesResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'listRoles',
                requestId,
                swarmId
            },
            'swarmResponse'
        );
    },

    /**
     * Get details of a specific role
     * @param swarmId - ID of the swarm
     * @param roleId - ID of the role
     * @returns Promise resolving to role details with assignees
     */
    getRole: (swarmId: string, roleId: string): Promise<GetRoleResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'getRole',
                requestId,
                swarmId,
                roleId
            },
            'swarmResponse'
        );
    },

    /**
     * Assign a role to an agent
     * @param swarmId - ID of the swarm
     * @param roleId - ID of the role
     * @param agentId - ID of the agent
     * @returns Promise resolving to success confirmation
     */
    assignRole: (swarmId: string, roleId: string, agentId: string): Promise<AssignRoleResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'assignRole',
                requestId,
                swarmId,
                roleId,
                agentId
            },
            'swarmResponse'
        );
    },

    /**
     * Unassign a role from an agent
     * @param swarmId - ID of the swarm
     * @param roleId - ID of the role
     * @param agentId - ID of the agent
     * @returns Promise resolving to success confirmation
     */
    unassignRole: (swarmId: string, roleId: string, agentId: string): Promise<UnassignRoleResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'unassignRole',
                requestId,
                swarmId,
                roleId,
                agentId
            },
            'swarmResponse'
        );
    },

    /**
     * Get all agents with a specific role
     * @param swarmId - ID of the swarm
     * @param roleId - ID of the role
     * @returns Promise resolving to array of agents
     */
    getAgentsByRole: (swarmId: string, roleId: string): Promise<GetAgentsByRoleResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'getAgentsByRole',
                requestId,
                swarmId,
                roleId
            },
            'swarmResponse'
        );
    },

    /**
     * Delete a role from a swarm
     * @param swarmId - ID of the swarm
     * @param roleId - ID of the role
     * @returns Promise resolving to success confirmation
     */
    deleteRole: (swarmId: string, roleId: string): Promise<DeleteRoleResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'deleteRole',
                requestId,
                swarmId,
                roleId
            },
            'swarmResponse'
        );
    },

    // ================================
    // Vacancy Management
    // ================================

    /**
     * Create a new vacancy in a swarm
     * @param swarmId - ID of the swarm
     * @param data - Vacancy creation data
     * @returns Promise resolving to created vacancy details
     */
    createVacancy: (swarmId: string, data: CreateVacancyRequest): Promise<CreateVacancyResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'createVacancy',
                requestId,
                swarmId,
                data
            },
            'swarmResponse'
        );
    },

    /**
     * List all vacancies in a swarm
     * @param swarmId - ID of the swarm
     * @returns Promise resolving to array of vacancies
     */
    listVacancies: (swarmId: string): Promise<ListVacanciesResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'listVacancies',
                requestId,
                swarmId
            },
            'swarmResponse'
        );
    },

    /**
     * Apply for a vacancy
     * @param swarmId - ID of the swarm
     * @param vacancyId - ID of the vacancy
     * @param agentId - ID of the applying agent
     * @param message - Optional application message
     * @returns Promise resolving to success confirmation
     */
    applyForVacancy: (
        swarmId: string,
        vacancyId: string,
        agentId: string,
        message?: string
    ): Promise<ApplyForVacancyResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'applyForVacancy',
                requestId,
                swarmId,
                vacancyId,
                agentId,
                data: { message }
            },
            'swarmResponse'
        );
    },

    /**
     * Close a vacancy
     * @param swarmId - ID of the swarm
     * @param vacancyId - ID of the vacancy
     * @param reason - Reason for closing
     * @returns Promise resolving to success confirmation
     */
    closeVacancy: (swarmId: string, vacancyId: string, reason: string): Promise<CloseVacancyResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'closeVacancy',
                requestId,
                swarmId,
                vacancyId,
                data: { reason }
            },
            'swarmResponse'
        );
    },

    // ================================
    // Status Management
    // ================================

    /**
     * Update an agent's status
     * @param swarmId - ID of the swarm
     * @param agentId - ID of the agent
     * @param data - Status update data
     * @returns Promise resolving to success confirmation
     */
    updateAgentStatus: (
        swarmId: string,
        agentId: string,
        data: AgentStatusUpdate
    ): Promise<UpdateStatusResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'updateStatus',
                requestId,
                swarmId,
                agentId,
                data
            },
            'swarmResponse'
        );
    },

    /**
     * Get status summary for a swarm
     * @param swarmId - ID of the swarm
     * @returns Promise resolving to status summary with agents
     */
    getSwarmStatusSummary: (swarmId: string): Promise<GetStatusSummaryResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'getSwarmStatus',
                requestId,
                swarmId
            },
            'swarmResponse'
        );
    },

    // ================================
    // Job Group Management
    // ================================

    /**
     * Get the default job group ID associated with a swarm
     * @param swarmId - ID of the swarm
     * @returns Promise resolving to the default job group ID
     */
    getDefaultJobGroup: (swarmId: string): Promise<GetDefaultJobGroupResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'getDefaultJobGroup',
                requestId,
                swarmId
            },
            'swarmResponse'
        );
    },

    /**
     * Get the configuration for a specific swarm
     * @param swarmId - ID of the swarm
     * @returns Promise resolving to swarm configuration
     */
    getSwarmConfig: (swarmId: string): Promise<GetSwarmConfigResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'swarmEvent',
                action: 'getConfig',
                requestId,
                swarmId
            },
            'swarmResponse'
        );
    }
};

export default codeboltSwarm;
