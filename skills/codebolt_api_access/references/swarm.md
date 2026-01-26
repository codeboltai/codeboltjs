# codebolt.swarm - Swarm Management Module

Provides functionality for managing swarms, agents, teams, roles, and vacancies. Swarm is a distributed system for coordinating multiple autonomous agents working together.


## Table of Contents

- [Response Types](#response-types)
  - [Swarm](#swarm)
  - [SwarmAgent](#swarmagent)
  - [Team](#team)
  - [Role](#role)
  - [Vacancy](#vacancy)
  - [StatusSummary](#statussummary)
- [Methods](#methods)
  - [Swarm Management](#swarm-management)
  - [Agent Registration](#agent-registration)
  - [Team Management](#team-management)
  - [Role Management](#role-management)
  - [Vacancy Management](#vacancy-management)
  - [Status Management](#status-management)
  - [Job Group Management](#job-group-management)
- [Examples](#examples)

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseSwarmResponse {
  success: boolean;        // Whether the operation succeeded
  requestId?: string;      // Request identifier
  error?: {
    code: string;          // Error code
    message: string;       // Error message
    details?: any;         // Additional error details
  };
}
```

### Swarm

Represents a swarm entity:

```typescript
interface Swarm {
  id: string;                      // Unique swarm identifier
  name: string;                    // Swarm name
  description?: string;            // Optional description
  createdAt: string;                // ISO timestamp of creation
  metadata?: Record<string, any>;   // Additional metadata
}
```

### SwarmAgent

Represents an agent within a swarm:

```typescript
interface SwarmAgent {
  id: string;                      // Unique agent identifier
  name: string;                    // Agent name
  swarmId: string;                 // ID of the swarm
  status: 'active' | 'idle' | 'busy' | 'offline';
  capabilities?: string[];         // Agent capabilities
  currentTask?: string;            // Current task being worked on
  joinedAt: string;                // ISO timestamp when agent joined
  metadata?: Record<string, any>;   // Additional metadata
}
```

### Team

Represents a team within a swarm:

```typescript
interface Team {
  id: string;                      // Unique team identifier
  swarmId: string;                 // ID of the swarm
  name: string;                    // Team name
  description?: string;            // Optional description
  maxMembers?: number;             // Maximum team size
  memberCount: number;             // Current member count
  createdAt: string;               // ISO timestamp of creation
  metadata?: Record<string, any>;   // Additional metadata
}
```

### Role

Represents a role within a swarm:

```typescript
interface Role {
  id: string;                      // Unique role identifier
  swarmId: string;                 // ID of the swarm
  name: string;                    // Role name
  description?: string;            // Optional description
  permissions?: string[];          // Role permissions
  maxAssignees?: number;           // Maximum agents with this role
  assigneeCount: number;           // Current assignee count
  createdAt: string;               // ISO timestamp of creation
  metadata?: Record<string, any>;   // Additional metadata
}
```

### Vacancy

Represents a job vacancy within a swarm:

```typescript
interface Vacancy {
  id: string;                      // Unique vacancy identifier
  swarmId: string;                 // ID of the swarm
  roleId: string;                  // ID of the required role
  title: string;                   // Vacancy title
  description?: string;            // Optional description
  requirements?: string[];         // Required qualifications
  status: 'open' | 'closed';       // Current status
  applicantCount: number;          // Number of applicants
  createdAt: string;               // ISO timestamp of creation
  closedAt?: string;               // ISO timestamp when closed
  closedReason?: string;           // Reason for closing
  metadata?: Record<string, any>;   // Additional metadata
}
```

### StatusSummary

Summary of agent statuses in a swarm:

```typescript
interface StatusSummary {
  total: number;    // Total number of agents
  active: number;   // Number of active agents
  idle: number;     // Number of idle agents
  busy: number;     // Number of busy agents
  offline: number;  // Number of offline agents
}
```

## Methods

### Swarm Management

#### `createSwarm(data)`

Create a new swarm for coordinating agents.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| data | `CreateSwarmRequest` | Yes | Swarm configuration |
| data.name | string | Yes | Name of the swarm |
| data.description | string | No | Description of the swarm |
| data.allowExternalAgents | boolean | No | Whether external agents can join |
| data.maxAgents | number | No | Maximum number of agents allowed |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    swarm: Swarm;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.createSwarm({
  name: 'My First Swarm',
  description: 'A swarm for testing purposes',
  allowExternalAgents: true,
  maxAgents: 10
});
if (result.success && result.data) {
  console.log('Created swarm:', result.data.swarm.id);
}
```

---

#### `listSwarms()`

List all available swarms.

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    swarms: Swarm[];
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.listSwarms();
if (result.success && result.data) {
  result.data.swarms.forEach(swarm => {
    console.log(`${swarm.name} (${swarm.id})`);
  });
}
```

---

#### `getSwarm(swarmId)`

Get details of a specific swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    swarm: Swarm;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.getSwarm('swarm-123');
if (result.success && result.data) {
  const swarm = result.data.swarm;
  console.log(`Swarm: ${swarm.name} - ${swarm.description}`);
}
```

---

#### `getSwarmAgents(swarmId)`

Get all agents registered in a swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    agents: SwarmAgent[];
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.getSwarmAgents('swarm-123');
if (result.success && result.data) {
  result.data.agents.forEach(agent => {
    console.log(`${agent.name} - Status: ${agent.status}`);
  });
}
```

---

### Agent Registration

#### `registerAgent(swarmId, data)`

Register an agent to join a swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm to join |
| data | `AgentRegistration` | Yes | Agent registration details |
| data.agentId | string | No | Custom agent ID |
| data.name | string | Yes | Agent name |
| data.capabilities | string[] | No | List of agent capabilities |
| data.agentType | 'internal' \| 'external' | No | Type of agent |
| data.connectionInfo | object | No | Connection endpoint info |
| data.connectionInfo.endpoint | string | No | Endpoint URL |
| data.connectionInfo.protocol | 'websocket' \| 'http' | No | Protocol type |
| data.metadata | Record<string, any> | No | Additional metadata |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    agentId: string;
    swarmId: string;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.registerAgent('swarm-123', {
  name: 'Agent Alpha',
  capabilities: ['task-execution', 'data-processing'],
  agentType: 'internal',
  metadata: { version: '1.0.0' }
});
if (result.success && result.data) {
  console.log('Registered agent:', result.data.agentId);
}
```

---

#### `unregisterAgent(swarmId, agentId)`

Unregister an agent from a swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| agentId | string | Yes | ID of the agent to unregister |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    message: string;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.unregisterAgent('swarm-123', 'agent-456');
if (result.success) {
  console.log('Agent unregistered successfully');
}
```

---

### Team Management

#### `createTeam(swarmId, data)`

Create a new team within a swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| data | `CreateTeamRequest` | Yes | Team creation data |
| data.name | string | Yes | Team name |
| data.description | string | No | Team description |
| data.maxMembers | number | No | Maximum team size |
| data.metadata | Record<string, any> | No | Additional metadata |
| data.createdBy | string | Yes | ID of creator |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    team: Team;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.createTeam('swarm-123', {
  name: 'Development Team',
  description: 'Handles development tasks',
  maxMembers: 5,
  createdBy: 'user-789'
});
if (result.success && result.data) {
  console.log('Created team:', result.data.team.id);
}
```

---

#### `listTeams(swarmId)`

List all teams in a swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    teams: Team[];
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.listTeams('swarm-123');
if (result.success && result.data) {
  result.data.teams.forEach(team => {
    console.log(`${team.name} - Members: ${team.memberCount}/${team.maxMembers}`);
  });
}
```

---

#### `getTeam(swarmId, teamId)`

Get details of a specific team including members.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| teamId | string | Yes | ID of the team |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    team: Team;
    members: SwarmAgent[];
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.getTeam('swarm-123', 'team-456');
if (result.success && result.data) {
  const { team, members } = result.data;
  console.log(`Team ${team.name} has ${members.length} members`);
}
```

---

#### `joinTeam(swarmId, teamId, agentId)`

Add an agent to a team.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| teamId | string | Yes | ID of the team |
| agentId | string | Yes | ID of the agent |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    message: string;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.joinTeam('swarm-123', 'team-456', 'agent-789');
if (result.success) {
  console.log('Agent joined team successfully');
}
```

---

#### `leaveTeam(swarmId, teamId, agentId)`

Remove an agent from a team.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| teamId | string | Yes | ID of the team |
| agentId | string | Yes | ID of the agent |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    message: string;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.leaveTeam('swarm-123', 'team-456', 'agent-789');
if (result.success) {
  console.log('Agent left team successfully');
}
```

---

#### `deleteTeam(swarmId, teamId)`

Delete a team from a swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| teamId | string | Yes | ID of the team |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    message: string;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.deleteTeam('swarm-123', 'team-456');
if (result.success) {
  console.log('Team deleted successfully');
}
```

---

### Role Management

#### `createRole(swarmId, data)`

Create a new role within a swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| data | `CreateRoleRequest` | Yes | Role creation data |
| data.name | string | Yes | Role name |
| data.description | string | No | Role description |
| data.permissions | string[] | No | List of permissions |
| data.maxAssignees | number | No | Maximum agents with this role |
| data.metadata | Record<string, any> | No | Additional metadata |
| data.createdBy | string | Yes | ID of creator |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    role: Role;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.createRole('swarm-123', {
  name: 'Task Executor',
  description: 'Can execute tasks',
  permissions: ['task:execute', 'task:read'],
  maxAssignees: 10,
  createdBy: 'user-789'
});
if (result.success && result.data) {
  console.log('Created role:', result.data.role.id);
}
```

---

#### `listRoles(swarmId)`

List all roles in a swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    roles: Role[];
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.listRoles('swarm-123');
if (result.success && result.data) {
  result.data.roles.forEach(role => {
    console.log(`${role.name} - Assignees: ${role.assigneeCount}`);
  });
}
```

---

#### `getRole(swarmId, roleId)`

Get details of a specific role including assignees.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| roleId | string | Yes | ID of the role |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    role: Role;
    assignees: SwarmAgent[];
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.getRole('swarm-123', 'role-456');
if (result.success && result.data) {
  const { role, assignees } = result.data;
  console.log(`Role ${role.name} has ${assignees.length} assignees`);
}
```

---

#### `assignRole(swarmId, roleId, agentId)`

Assign a role to an agent.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| roleId | string | Yes | ID of the role |
| agentId | string | Yes | ID of the agent |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    message: string;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.assignRole('swarm-123', 'role-456', 'agent-789');
if (result.success) {
  console.log('Role assigned successfully');
}
```

---

#### `unassignRole(swarmId, roleId, agentId)`

Unassign a role from an agent.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| roleId | string | Yes | ID of the role |
| agentId | string | Yes | ID of the agent |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    message: string;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.unassignRole('swarm-123', 'role-456', 'agent-789');
if (result.success) {
  console.log('Role unassigned successfully');
}
```

---

#### `getAgentsByRole(swarmId, roleId)`

Get all agents assigned to a specific role.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| roleId | string | Yes | ID of the role |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    agents: SwarmAgent[];
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.getAgentsByRole('swarm-123', 'role-456');
if (result.success && result.data) {
  result.data.agents.forEach(agent => {
    console.log(`Agent: ${agent.name}`);
  });
}
```

---

#### `deleteRole(swarmId, roleId)`

Delete a role from a swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| roleId | string | Yes | ID of the role |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    message: string;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.deleteRole('swarm-123', 'role-456');
if (result.success) {
  console.log('Role deleted successfully');
}
```

---

### Vacancy Management

#### `createVacancy(swarmId, data)`

Create a new vacancy for agents to apply.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| data | `CreateVacancyRequest` | Yes | Vacancy creation data |
| data.roleId | string | Yes | ID of the required role |
| data.title | string | Yes | Vacancy title |
| data.description | string | No | Vacancy description |
| data.requirements | string[] | No | List of requirements |
| data.metadata | Record<string, any> | No | Additional metadata |
| data.createdBy | string | Yes | ID of creator |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    vacancy: Vacancy;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.createVacancy('swarm-123', {
  roleId: 'role-456',
  title: 'Data Processing Specialist',
  description: 'Looking for agents with data processing capabilities',
  requirements: ['data:read', 'data:write'],
  createdBy: 'user-789'
});
if (result.success && result.data) {
  console.log('Created vacancy:', result.data.vacancy.id);
}
```

---

#### `listVacancies(swarmId)`

List all vacancies in a swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    vacancies: Vacancy[];
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.listVacancies('swarm-123');
if (result.success && result.data) {
  result.data.vacancies
    .filter(v => v.status === 'open')
    .forEach(vacancy => {
      console.log(`${vacancy.title} - Applicants: ${vacancy.applicantCount}`);
    });
}
```

---

#### `applyForVacancy(swarmId, vacancyId, agentId, message?)`

Apply for a vacancy.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| vacancyId | string | Yes | ID of the vacancy |
| agentId | string | Yes | ID of the applying agent |
| message | string | No | Optional application message |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    message: string;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.applyForVacancy(
  'swarm-123',
  'vacancy-456',
  'agent-789',
  'I have extensive experience in data processing tasks'
);
if (result.success) {
  console.log('Application submitted successfully');
}
```

---

#### `closeVacancy(swarmId, vacancyId, reason)`

Close a vacancy.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| vacancyId | string | Yes | ID of the vacancy |
| reason | string | Yes | Reason for closing |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    message: string;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.closeVacancy(
  'swarm-123',
  'vacancy-456',
  'Position filled'
);
if (result.success) {
  console.log('Vacancy closed successfully');
}
```

---

### Status Management

#### `updateAgentStatus(swarmId, agentId, data)`

Update an agent's status.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |
| agentId | string | Yes | ID of the agent |
| data | `AgentStatusUpdate` | Yes | Status update data |
| data.status | 'active' \| 'idle' \| 'busy' \| 'offline' | Yes | New status |
| data.currentTask | string | No | Current task description |
| data.metadata | Record<string, any> | No | Additional metadata |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    message: string;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.updateAgentStatus('swarm-123', 'agent-456', {
  status: 'busy',
  currentTask: 'Processing batch data',
  metadata: { progress: 75 }
});
if (result.success) {
  console.log('Status updated successfully');
}
```

---

#### `getSwarmStatusSummary(swarmId)`

Get status summary for all agents in a swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    statusSummary: StatusSummary;
    agents: SwarmAgent[];
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.getSwarmStatusSummary('swarm-123');
if (result.success && result.data) {
  const { statusSummary, agents } = result.data;
  console.log(`Total agents: ${statusSummary.total}`);
  console.log(`Active: ${statusSummary.active}, Idle: ${statusSummary.idle}, Busy: ${statusSummary.busy}`);
}
```

---

### Job Group Management

#### `getDefaultJobGroup(swarmId)`

Get the default job group ID associated with a swarm.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| swarmId | string | Yes | ID of the swarm |

**Response:**
```typescript
{
  success: boolean;
  requestId?: string;
  data?: {
    groupId: string;
  };
  error?: { code: string; message: string; details?: any };
}
```

```typescript
const result = await codebolt.swarm.getDefaultJobGroup('swarm-123');
if (result.success && result.data) {
  console.log('Default job group:', result.data.groupId);
}
```

---

## Examples

### Creating and Managing a New Swarm

```typescript
// Create a new swarm
const createResult = await codebolt.swarm.createSwarm({
  name: 'Data Processing Swarm',
  description: 'A swarm for coordinating data processing tasks',
  allowExternalAgents: false,
  maxAgents: 20
});

if (createResult.success && createResult.data) {
  const swarmId = createResult.data.swarm.id;

  // Create a team
  const teamResult = await codebolt.swarm.createTeam(swarmId, {
    name: 'Processing Team',
    description: 'Main processing team',
    maxMembers: 5,
    createdBy: 'system'
  });

  if (teamResult.success && teamResult.data) {
    const teamId = teamResult.data.team.id;
    console.log(`Created team ${teamId} in swarm ${swarmId}`);
  }
}
```

### Registering Agents and Managing Roles

```typescript
const swarmId = 'swarm-123';

// Create a role
const roleResult = await codebolt.swarm.createRole(swarmId, {
  name: 'Data Processor',
  description: 'Agents that process data',
  permissions: ['data:read', 'data:write', 'data:transform'],
  maxAssignees: 10,
  createdBy: 'system'
});

if (roleResult.success && roleResult.data) {
  const roleId = roleResult.data.role.id;

  // Register agents and assign roles
  for (let i = 1; i <= 3; i++) {
    const agentResult = await codebolt.swarm.registerAgent(swarmId, {
      name: `Processor Agent ${i}`,
      capabilities: ['data-processing', 'batch-processing'],
      agentType: 'internal'
    });

    if (agentResult.success && agentResult.data) {
      const agentId = agentResult.data.agentId;
      await codebolt.swarm.assignRole(swarmId, roleId, agentId);
      console.log(`Registered and assigned role to ${agentId}`);
    }
  }

  // Get all agents with this role
  const agentsResult = await codebolt.swarm.getAgentsByRole(swarmId, roleId);
  if (agentsResult.success && agentsResult.data) {
    console.log(`Total agents with role: ${agentsResult.data.agents.length}`);
  }
}
```

### Managing Agent Status and Monitoring

```typescript
const swarmId = 'swarm-123';
const agentId = 'agent-456';

// Update agent status to busy with a task
await codebolt.swarm.updateAgentStatus(swarmId, agentId, {
  status: 'busy',
  currentTask: 'Processing dataset XYZ',
  metadata: { datasetId: 'xyz-123', progress: 0 }
});

// Later, check swarm status
const statusResult = await codebolt.swarm.getSwarmStatusSummary(swarmId);
if (statusResult.success && statusResult.data) {
  const { statusSummary, agents } = statusResult.data;
  console.log(`Swarm Status:`);
  console.log(`  Total: ${statusSummary.total}`);
  console.log(`  Active: ${statusSummary.active}`);
  console.log(`  Busy: ${statusSummary.busy}`);
  console.log(`  Idle: ${statusSummary.idle}`);
  console.log(`  Offline: ${statusSummary.offline}`);

  agents.forEach(agent => {
    console.log(`  ${agent.name}: ${agent.status} - ${agent.currentTask || 'No task'}`);
  });
}
```

### Vacancy Workflow

```typescript
const swarmId = 'swarm-123';

// Create a role for the vacancy
const roleResult = await codebolt.swarm.createRole(swarmId, {
  name: 'Senior Analyst',
  description: 'Experienced data analyst role',
  permissions: ['analysis:advanced', 'data:read', 'report:generate'],
  maxAssignees: 1,
  createdBy: 'hr-bot'
});

if (roleResult.success && roleResult.data) {
  const roleId = roleResult.data.role.id;

  // Create vacancy
  const vacancyResult = await codebolt.swarm.createVacancy(swarmId, {
    roleId,
    title: 'Senior Data Analyst - Remote',
    description: 'We need an experienced analyst for our team',
    requirements: ['2+ years experience', 'Python skills', 'ML knowledge'],
    createdBy: 'hr-bot'
  });

  if (vacancyResult.success && vacancyResult.data) {
    const vacancyId = vacancyResult.data.vacancy.id;

    // Agents apply for the vacancy
    const applications = ['agent-1', 'agent-2', 'agent-3'];
    for (const agentId of applications) {
      await codebolt.swarm.applyForVacancy(
        swarmId,
        vacancyId,
        agentId,
        'I am interested in this position'
      );
    }

    // Check vacancy status
    const listResult = await codebolt.swarm.listVacancies(swarmId);
    if (listResult.success && listResult.data) {
      const vacancy = listResult.data.vacancies.find(v => v.id === vacancyId);
      console.log(`Vacancy "${vacancy?.title}" has ${vacancy?.applicantCount} applicants`);
    }

    // After hiring, close the vacancy
    await codebolt.swarm.closeVacancy(swarmId, vacancyId, 'Position filled');
  }
}
```
