// --- Enums and Constants ---

/** Agent status type in swarm context */
export type SwarmAgentStatusType = 'available' | 'working' | 'busy' | 'offline' | 'error';

/** Swarm execution status */
export type SwarmExecutionStatus = 'idle' | 'starting' | 'running' | 'finished' | 'error';

/** Vacancy priority */
export type VacancyPriority = 'low' | 'medium' | 'high' | 'urgent';

/** Application status */
export type VacancyApplicationStatus = 'pending' | 'approved' | 'rejected';

/** Spawn request status */
export type SpawnRequestStatus = 'pending' | 'approved' | 'rejected';

// --- Core Entities ---

/** Swarm configuration */
export interface SwarmConfiguration {
  maxAgents?: number;
  allowExternalAgents: boolean;
  autoOfflineTimeout: number;
  requireRoleForTeamJoin: boolean;
  allowSelfRoleAssignment: boolean;
  vacancyApprovalRequired: boolean;
}

/** Swarm data */
export interface SwarmData {
  id: string;
  name: string;
  description: string;
  configuration: SwarmConfiguration;
  createdAt: string;
  lastActivity: string;
  agentCount: number;
  teamCount: number;
  roleCount: number;
  vacancyCount: number;
  episodicMemoryId?: string;
}

/** Swarm summary */
export interface SwarmSummary {
  id: string;
  name: string;
  description: string;
  agentCount: number;
  createdAt: string;
  lastActivity: string;
  episodicMemoryId?: string;
}

/** Agent registration in swarm */
export interface AgentRegistration {
  name: string;
  capabilities: string[];
  agentType: 'internal' | 'external';
  connectionInfo?: {
    endpoint: string;
    protocol: 'websocket' | 'http';
  };
  metadata?: Record<string, unknown>;
}

/** Agent info in swarm */
export interface SwarmAgentInfo {
  id: string;
  name: string;
  status: {
    type: SwarmAgentStatusType;
    lastUpdated: string;
    taskDescription?: string;
    estimatedCompletion?: string;
    metadata?: Record<string, unknown>;
  };
  capabilities: string[];
  teams: string[];
  roles: string[];
  lastSeen: string;
  currentTask?: string;
  agentType: 'internal' | 'external';
  registeredAt: string;
}

/** Swarm team */
export interface SwarmTeam {
  id: string;
  name: string;
  description: string;
  swarmId: string;
  createdBy: string;
  createdAt: string;
  maxMembers?: number;
  requiredRoles: string[];
  members: string[];
  metadata?: Record<string, unknown>;
}

/** Swarm role */
export interface SwarmRole {
  id: string;
  name: string;
  description: string;
  swarmId: string;
  requiredCapabilities: string[];
  maxAssignees?: number;
  permissions: string[];
  createdBy: string;
  createdAt: string;
  assignees: string[];
  metadata?: Record<string, unknown>;
}

/** Vacancy application */
export interface VacancyApplication {
  agentId: string;
  appliedAt: string;
  message?: string;
  status: VacancyApplicationStatus;
}

/** Role vacancy */
export interface SwarmVacancy {
  id: string;
  roleId: string;
  roleName: string;
  description: string;
  requirements: string[];
  priority: VacancyPriority;
  createdBy: string;
  createdAt: string;
  applications: VacancyApplication[];
}

/** Swarm agent config */
export interface SwarmAgentConfig {
  agentId: string;
  agentName: string;
  maxInstances: number;
  isEnabled: boolean;
}

/** Job coordination settings */
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

/** Swarm config */
export interface SwarmConfig {
  agents: SwarmAgentConfig[];
  maxConcurrentAgents: number;
  initialPrompt: string;
  defaultJobGroupId?: string;
  jobCoordination?: JobCoordinationSettings;
}

/** Actor identity */
export interface ActorIdentity {
  id: string;
  name: string;
  type: 'agent' | 'user';
}

/** Spawn request */
export interface SpawnRequest {
  id: string;
  swarmId: string;
  requestedRole: string;
  requirements: string;
  reason: string;
  requestedBy: ActorIdentity;
  status: SpawnRequestStatus;
  approvedBy?: ActorIdentity;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

/** Swarm status update */
export interface SwarmStatusUpdate {
  swarmId: string;
  status: SwarmExecutionStatus;
  runningAgents: number;
  completedAgents: number;
  totalAgents: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}

/** Swarm layout */
export interface SwarmLayout {
  swarmId?: string;
  nodes?: Record<string, unknown>[];
  edges?: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
}

/** Swarm statistics */
export interface SwarmTeamStatistics {
  teamId: string;
  memberCount: number;
  activeMembers: number;
}

/** Swarm role statistics */
export interface SwarmRoleStatistics {
  roleId: string;
  assigneeCount: number;
  maxAssignees?: number;
}

// --- Request Types ---

/** Create swarm request */
export interface CreateSwarmRequest {
  name: string;
  description?: string;
  maxAgents?: number;
  allowExternalAgents: boolean;
  configuration?: Partial<SwarmConfiguration>;
}

/** Create team request */
export interface CreateTeamRequest {
  name: string;
  description?: string;
  maxMembers?: number;
  requiredRoles?: string[];
  createdBy: string;
}

/** Create role request */
export interface CreateRoleRequest {
  name: string;
  description?: string;
  requiredCapabilities: string[];
  maxAssignees?: number;
  permissions: string[];
  createdBy: string;
}

/** Create vacancy request */
export interface CreateVacancyRequest {
  roleId: string;
  description?: string;
  requirements: string[];
  priority: VacancyPriority;
  createdBy: string;
}

/** Agent status update request */
export interface AgentStatusUpdateRequest {
  status: SwarmAgentStatusType;
  taskDescription?: string;
  estimatedCompletion?: string;
  metadata?: Record<string, unknown>;
}

/** Start swarm request */
export interface StartSwarmRequest {
  agentCounts?: { agentId: string; agentName: string; count: number }[];
  initialPrompt?: string;
}

/** Join team request */
export interface JoinTeamRequest {
  agentId?: string;
  metadata?: Record<string, unknown>;
}

/** Leave team request */
export interface LeaveTeamRequest {
  agentId?: string;
}

/** Assign role request */
export interface AssignRoleRequest {
  agentId: string;
}

/** Unassign role request */
export interface UnassignRoleRequest {
  agentId: string;
}

/** Apply to vacancy request */
export interface ApplyToVacancyRequest {
  agentId: string;
  message?: string;
}

/** Close vacancy request */
export interface CloseVacancyRequest {
  reason?: string;
}

/** Create spawn request body */
export interface CreateSpawnRequestBody {
  requestedRole: string;
  requirements: string;
  reason: string;
  requestedBy: ActorIdentity;
}

/** Approve/reject spawn request body */
export interface SpawnRequestActionBody {
  approvedBy?: ActorIdentity;
  rejectionReason?: string;
}

/** Create termination request body */
export interface CreateTerminationRequestBody {
  agentId: string;
  reason: string;
  requestedBy: ActorIdentity;
}

/** Termination request action body */
export interface TerminationRequestActionBody {
  approvedBy?: ActorIdentity;
  rejectionReason?: string;
}

/** Update swarm config request */
export interface UpdateSwarmConfigRequest {
  agents?: SwarmAgentConfig[];
  maxConcurrentAgents?: number;
  initialPrompt?: string;
  defaultJobGroupId?: string;
  jobCoordination?: Partial<JobCoordinationSettings>;
}

/** Save layout request */
export interface SaveLayoutRequest {
  swarmId?: string;
  nodes?: Record<string, unknown>[];
  edges?: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
}
