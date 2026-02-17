/**
 * Swarm Module Types
 * Type definitions for swarm management functionality
 */

// ================================
// Request Types
// ================================

/**
 * Request to create a new swarm
 */
export interface CreateSwarmRequest {
    name: string;
    description?: string;
    allowExternalAgents?: boolean;
    maxAgents?: number;
}

/**
 * Agent registration data
 */
export interface AgentRegistration {
    agentId?: string;
    name: string;
    capabilities?: string[];
    agentType?: 'internal' | 'external';
    connectionInfo?: {
        endpoint: string;
        protocol: 'websocket' | 'http';
    };
    metadata?: Record<string, any>;
}

/**
 * Request to create a new team
 */
export interface CreateTeamRequest {
    name: string;
    description?: string;
    maxMembers?: number;
    metadata?: Record<string, any>;
    createdBy: string
}

/**
 * Request to create a new role
 */
export interface CreateRoleRequest {
    name: string;
    description?: string;
    permissions?: string[];
    maxAssignees?: number;
    metadata?: Record<string, any>;
    createdBy: string
}

/**
 * Request to create a new vacancy
 */
export interface CreateVacancyRequest {
    roleId: string;
    title: string;
    description?: string;
    requirements?: string[];
    metadata?: Record<string, any>;
    createdBy: string
}

/**
 * Agent status update data
 */
export interface AgentStatusUpdate {
    status: 'active' | 'idle' | 'busy' | 'offline';
    currentTask?: string;
    metadata?: Record<string, any>;
}

// ================================
// Entity Types
// ================================

/**
 * Swarm entity
 */
export interface Swarm {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    metadata?: Record<string, any>;
}

/**
 * Agent within a swarm
 */
export interface SwarmAgent {
    id: string;
    name: string;
    swarmId: string;
    status: 'active' | 'idle' | 'busy' | 'offline';
    capabilities?: string[];
    currentTask?: string;
    joinedAt: string;
    metadata?: Record<string, any>;
}

/**
 * Team within a swarm
 */
export interface Team {
    id: string;
    swarmId: string;
    name: string;
    description?: string;
    maxMembers?: number;
    memberCount: number;
    createdAt: string;
    metadata?: Record<string, any>;
}

/**
 * Role within a swarm
 */
export interface Role {
    id: string;
    swarmId: string;
    name: string;
    description?: string;
    permissions?: string[];
    maxAssignees?: number;
    assigneeCount: number;
    createdAt: string;
    metadata?: Record<string, any>;
}

/**
 * Vacancy within a swarm
 */
export interface Vacancy {
    id: string;
    swarmId: string;
    roleId: string;
    title: string;
    description?: string;
    requirements?: string[];
    status: 'open' | 'closed';
    applicantCount: number;
    createdAt: string;
    closedAt?: string;
    closedReason?: string;
    metadata?: Record<string, any>;
}

/**
 * Status summary for a swarm
 */
export interface StatusSummary {
    total: number;
    active: number;
    idle: number;
    busy: number;
    offline: number;
}

// ================================
// Response Types
// ================================

/**
 * Base response structure for all swarm operations
 */
export interface SwarmResponse {
    success: boolean;
    requestId?: string;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

/**
 * Response for createSwarm
 */
export interface CreateSwarmResponse extends SwarmResponse {
    data?: { swarm: Swarm };
}

/**
 * Response for listSwarms
 */
export interface ListSwarmsResponse extends SwarmResponse {
    data?: { swarms: Swarm[] };
}

/**
 * Response for getSwarm
 */
export interface GetSwarmResponse extends SwarmResponse {
    data?: { swarm: Swarm };
}

/**
 * Response for getSwarmAgents
 */
export interface GetSwarmAgentsResponse extends SwarmResponse {
    data?: { agents: SwarmAgent[] };
}

/**
 * Response for registerAgent
 */
export interface RegisterAgentResponse extends SwarmResponse {
    data?: { agentId: string; swarmId: string };
}

/**
 * Response for unregisterAgent
 */
export interface UnregisterAgentResponse extends SwarmResponse {
    data?: { message: string };
}

/**
 * Response for createTeam
 */
export interface CreateTeamResponse extends SwarmResponse {
    data?: { team: Team };
}

/**
 * Response for listTeams
 */
export interface ListTeamsResponse extends SwarmResponse {
    data?: { teams: Team[] };
}

/**
 * Response for getTeam
 */
export interface GetTeamResponse extends SwarmResponse {
    data?: { team: Team; members: SwarmAgent[] };
}

/**
 * Response for joinTeam
 */
export interface JoinTeamResponse extends SwarmResponse {
    data?: { message: string };
}

/**
 * Response for leaveTeam
 */
export interface LeaveTeamResponse extends SwarmResponse {
    data?: { message: string };
}

/**
 * Response for deleteTeam
 */
export interface DeleteTeamResponse extends SwarmResponse {
    data?: { message: string };
}

/**
 * Response for createRole
 */
export interface CreateRoleResponse extends SwarmResponse {
    data?: { role: Role };
}

/**
 * Response for listRoles
 */
export interface ListRolesResponse extends SwarmResponse {
    data?: { roles: Role[] };
}

/**
 * Response for getRole
 */
export interface GetRoleResponse extends SwarmResponse {
    data?: { role: Role; assignees: SwarmAgent[] };
}

/**
 * Response for assignRole
 */
export interface AssignRoleResponse extends SwarmResponse {
    data?: { message: string };
}

/**
 * Response for unassignRole
 */
export interface UnassignRoleResponse extends SwarmResponse {
    data?: { message: string };
}

/**
 * Response for getAgentsByRole
 */
export interface GetAgentsByRoleResponse extends SwarmResponse {
    data?: { agents: SwarmAgent[] };
}

/**
 * Response for deleteRole
 */
export interface DeleteRoleResponse extends SwarmResponse {
    data?: { message: string };
}

/**
 * Response for createVacancy
 */
export interface CreateVacancyResponse extends SwarmResponse {
    data?: { vacancy: Vacancy };
}

/**
 * Response for listVacancies
 */
export interface ListVacanciesResponse extends SwarmResponse {
    data?: { vacancies: Vacancy[] };
}

/**
 * Response for applyForVacancy
 */
export interface ApplyForVacancyResponse extends SwarmResponse {
    data?: { message: string };
}

/**
 * Response for closeVacancy
 */
export interface CloseVacancyResponse extends SwarmResponse {
    data?: { message: string };
}

/**
 * Response for updateAgentStatus
 */
export interface UpdateStatusResponse extends SwarmResponse {
    data?: { message: string };
}

/**
 * Response for getSwarmStatusSummary
 */
export interface GetStatusSummaryResponse extends SwarmResponse {
    data?: {
        statusSummary: StatusSummary;
        agents: SwarmAgent[];
    };
}

/**
 * Response for getDefaultJobGroup
 */
export interface GetDefaultJobGroupResponse extends SwarmResponse {
    data?: { groupId: string };
}

// ================================
// Config Types
// ================================

/**
 * Job coordination settings
 */
export interface JobCoordinationSettings {
    minSplitProposals: number;
    maxSplitProposals: number;
    minReputationForSplit: number;
    splitDeliberationEnabled: boolean;
    bidDeliberationEnabled: boolean;
    requireBidForAssignment: boolean;
    allowParallelWork: boolean;
    maxParallelWorkers: number;
    solutionDeliberationEnabled: boolean;
}

/**
 * Swarm agent configuration
 */
export interface SwarmAgentConfig {
    agentId: string;
    agentName: string;
    maxInstances: number;
    isEnabled: boolean;
}

/**
 * Swarm configuration
 */
export interface SwarmConfig {
    agents: SwarmAgentConfig[];
    maxConcurrentAgents: number;
    initialPrompt: string;
    defaultJobGroupId?: string;
    jobCoordination?: JobCoordinationSettings;
}

/**
 * Response for getSwarmConfig
 */
export interface GetSwarmConfigResponse extends SwarmResponse {
    data?: { config: SwarmConfig };
}
