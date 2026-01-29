[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / swarm

# Variable: swarm

> `const` **swarm**: `object`

Defined in: [packages/codeboltjs/src/modules/swarm.ts:85](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/swarm.ts#L85)

Swarm Module
Provides functionality for managing swarms, agents, teams, roles, and vacancies

## Type Declaration

### applyForVacancy()

> **applyForVacancy**: (`swarmId`, `vacancyId`, `agentId`, `message?`) => `Promise`\<[`ApplyForVacancyResponse`](../interfaces/ApplyForVacancyResponse.md)\>

Apply for a vacancy

#### Parameters

##### swarmId

`string`

ID of the swarm

##### vacancyId

`string`

ID of the vacancy

##### agentId

`string`

ID of the applying agent

##### message?

`string`

Optional application message

#### Returns

`Promise`\<[`ApplyForVacancyResponse`](../interfaces/ApplyForVacancyResponse.md)\>

Promise resolving to success confirmation

### assignRole()

> **assignRole**: (`swarmId`, `roleId`, `agentId`) => `Promise`\<[`AssignRoleResponse`](../interfaces/AssignRoleResponse.md)\>

Assign a role to an agent

#### Parameters

##### swarmId

`string`

ID of the swarm

##### roleId

`string`

ID of the role

##### agentId

`string`

ID of the agent

#### Returns

`Promise`\<[`AssignRoleResponse`](../interfaces/AssignRoleResponse.md)\>

Promise resolving to success confirmation

### closeVacancy()

> **closeVacancy**: (`swarmId`, `vacancyId`, `reason`) => `Promise`\<[`CloseVacancyResponse`](../interfaces/CloseVacancyResponse.md)\>

Close a vacancy

#### Parameters

##### swarmId

`string`

ID of the swarm

##### vacancyId

`string`

ID of the vacancy

##### reason

`string`

Reason for closing

#### Returns

`Promise`\<[`CloseVacancyResponse`](../interfaces/CloseVacancyResponse.md)\>

Promise resolving to success confirmation

### createRole()

> **createRole**: (`swarmId`, `data`) => `Promise`\<[`CreateRoleResponse`](../interfaces/CreateRoleResponse.md)\>

Create a new role in a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

##### data

[`CreateRoleRequest`](../interfaces/CreateRoleRequest.md)

Role creation data

#### Returns

`Promise`\<[`CreateRoleResponse`](../interfaces/CreateRoleResponse.md)\>

Promise resolving to created role details

### createSwarm()

> **createSwarm**: (`data`) => `Promise`\<[`CreateSwarmResponse`](../interfaces/CreateSwarmResponse.md)\>

Create a new swarm

#### Parameters

##### data

[`CreateSwarmRequest`](../interfaces/CreateSwarmRequest.md)

Swarm creation data

#### Returns

`Promise`\<[`CreateSwarmResponse`](../interfaces/CreateSwarmResponse.md)\>

Promise resolving to created swarm details

### createTeam()

> **createTeam**: (`swarmId`, `data`) => `Promise`\<[`CreateTeamResponse`](../interfaces/CreateTeamResponse.md)\>

Create a new team in a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

##### data

[`CreateTeamRequest`](../interfaces/CreateTeamRequest.md)

Team creation data

#### Returns

`Promise`\<[`CreateTeamResponse`](../interfaces/CreateTeamResponse.md)\>

Promise resolving to created team details

### createVacancy()

> **createVacancy**: (`swarmId`, `data`) => `Promise`\<[`CreateVacancyResponse`](../interfaces/CreateVacancyResponse.md)\>

Create a new vacancy in a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

##### data

[`CreateVacancyRequest`](../interfaces/CreateVacancyRequest.md)

Vacancy creation data

#### Returns

`Promise`\<[`CreateVacancyResponse`](../interfaces/CreateVacancyResponse.md)\>

Promise resolving to created vacancy details

### deleteRole()

> **deleteRole**: (`swarmId`, `roleId`) => `Promise`\<[`DeleteRoleResponse`](../interfaces/DeleteRoleResponse.md)\>

Delete a role from a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

##### roleId

`string`

ID of the role

#### Returns

`Promise`\<[`DeleteRoleResponse`](../interfaces/DeleteRoleResponse.md)\>

Promise resolving to success confirmation

### deleteTeam()

> **deleteTeam**: (`swarmId`, `teamId`) => `Promise`\<[`DeleteTeamResponse`](../interfaces/DeleteTeamResponse.md)\>

Delete a team from a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

##### teamId

`string`

ID of the team

#### Returns

`Promise`\<[`DeleteTeamResponse`](../interfaces/DeleteTeamResponse.md)\>

Promise resolving to success confirmation

### getAgentsByRole()

> **getAgentsByRole**: (`swarmId`, `roleId`) => `Promise`\<[`GetAgentsByRoleResponse`](../interfaces/GetAgentsByRoleResponse.md)\>

Get all agents with a specific role

#### Parameters

##### swarmId

`string`

ID of the swarm

##### roleId

`string`

ID of the role

#### Returns

`Promise`\<[`GetAgentsByRoleResponse`](../interfaces/GetAgentsByRoleResponse.md)\>

Promise resolving to array of agents

### getDefaultJobGroup()

> **getDefaultJobGroup**: (`swarmId`) => `Promise`\<`GetDefaultJobGroupResponse`\>

Get the default job group ID associated with a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

#### Returns

`Promise`\<`GetDefaultJobGroupResponse`\>

Promise resolving to the default job group ID

### getRole()

> **getRole**: (`swarmId`, `roleId`) => `Promise`\<[`GetRoleResponse`](../interfaces/GetRoleResponse.md)\>

Get details of a specific role

#### Parameters

##### swarmId

`string`

ID of the swarm

##### roleId

`string`

ID of the role

#### Returns

`Promise`\<[`GetRoleResponse`](../interfaces/GetRoleResponse.md)\>

Promise resolving to role details with assignees

### getSwarm()

> **getSwarm**: (`swarmId`) => `Promise`\<[`GetSwarmResponse`](../interfaces/GetSwarmResponse.md)\>

Get details of a specific swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

#### Returns

`Promise`\<[`GetSwarmResponse`](../interfaces/GetSwarmResponse.md)\>

Promise resolving to swarm details

### getSwarmAgents()

> **getSwarmAgents**: (`swarmId`) => `Promise`\<[`GetSwarmAgentsResponse`](../interfaces/GetSwarmAgentsResponse.md)\>

Get all agents in a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

#### Returns

`Promise`\<[`GetSwarmAgentsResponse`](../interfaces/GetSwarmAgentsResponse.md)\>

Promise resolving to array of agents

### getSwarmStatusSummary()

> **getSwarmStatusSummary**: (`swarmId`) => `Promise`\<[`GetStatusSummaryResponse`](../interfaces/GetStatusSummaryResponse.md)\>

Get status summary for a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

#### Returns

`Promise`\<[`GetStatusSummaryResponse`](../interfaces/GetStatusSummaryResponse.md)\>

Promise resolving to status summary with agents

### getTeam()

> **getTeam**: (`swarmId`, `teamId`) => `Promise`\<[`GetTeamResponse`](../interfaces/GetTeamResponse.md)\>

Get details of a specific team

#### Parameters

##### swarmId

`string`

ID of the swarm

##### teamId

`string`

ID of the team

#### Returns

`Promise`\<[`GetTeamResponse`](../interfaces/GetTeamResponse.md)\>

Promise resolving to team details with members

### joinTeam()

> **joinTeam**: (`swarmId`, `teamId`, `agentId`) => `Promise`\<[`JoinTeamResponse`](../interfaces/JoinTeamResponse.md)\>

Add an agent to a team

#### Parameters

##### swarmId

`string`

ID of the swarm

##### teamId

`string`

ID of the team

##### agentId

`string`

ID of the agent

#### Returns

`Promise`\<[`JoinTeamResponse`](../interfaces/JoinTeamResponse.md)\>

Promise resolving to success confirmation

### leaveTeam()

> **leaveTeam**: (`swarmId`, `teamId`, `agentId`) => `Promise`\<[`LeaveTeamResponse`](../interfaces/LeaveTeamResponse.md)\>

Remove an agent from a team

#### Parameters

##### swarmId

`string`

ID of the swarm

##### teamId

`string`

ID of the team

##### agentId

`string`

ID of the agent

#### Returns

`Promise`\<[`LeaveTeamResponse`](../interfaces/LeaveTeamResponse.md)\>

Promise resolving to success confirmation

### listRoles()

> **listRoles**: (`swarmId`) => `Promise`\<[`ListRolesResponse`](../interfaces/ListRolesResponse.md)\>

List all roles in a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

#### Returns

`Promise`\<[`ListRolesResponse`](../interfaces/ListRolesResponse.md)\>

Promise resolving to array of roles

### listSwarms()

> **listSwarms**: () => `Promise`\<[`ListSwarmsResponse`](../interfaces/ListSwarmsResponse.md)\>

List all available swarms

#### Returns

`Promise`\<[`ListSwarmsResponse`](../interfaces/ListSwarmsResponse.md)\>

Promise resolving to array of swarms

### listTeams()

> **listTeams**: (`swarmId`) => `Promise`\<[`ListTeamsResponse`](../interfaces/ListTeamsResponse.md)\>

List all teams in a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

#### Returns

`Promise`\<[`ListTeamsResponse`](../interfaces/ListTeamsResponse.md)\>

Promise resolving to array of teams

### listVacancies()

> **listVacancies**: (`swarmId`) => `Promise`\<[`ListVacanciesResponse`](../interfaces/ListVacanciesResponse.md)\>

List all vacancies in a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

#### Returns

`Promise`\<[`ListVacanciesResponse`](../interfaces/ListVacanciesResponse.md)\>

Promise resolving to array of vacancies

### registerAgent()

> **registerAgent**: (`swarmId`, `data`) => `Promise`\<[`RegisterAgentResponse`](../interfaces/RegisterAgentResponse.md)\>

Register an agent to a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

##### data

[`AgentRegistration`](../interfaces/AgentRegistration.md)

Agent registration data

#### Returns

`Promise`\<[`RegisterAgentResponse`](../interfaces/RegisterAgentResponse.md)\>

Promise resolving to registered agent ID

### unassignRole()

> **unassignRole**: (`swarmId`, `roleId`, `agentId`) => `Promise`\<[`UnassignRoleResponse`](../interfaces/UnassignRoleResponse.md)\>

Unassign a role from an agent

#### Parameters

##### swarmId

`string`

ID of the swarm

##### roleId

`string`

ID of the role

##### agentId

`string`

ID of the agent

#### Returns

`Promise`\<[`UnassignRoleResponse`](../interfaces/UnassignRoleResponse.md)\>

Promise resolving to success confirmation

### unregisterAgent()

> **unregisterAgent**: (`swarmId`, `agentId`) => `Promise`\<[`UnregisterAgentResponse`](../interfaces/UnregisterAgentResponse.md)\>

Unregister an agent from a swarm

#### Parameters

##### swarmId

`string`

ID of the swarm

##### agentId

`string`

ID of the agent

#### Returns

`Promise`\<[`UnregisterAgentResponse`](../interfaces/UnregisterAgentResponse.md)\>

Promise resolving to success confirmation

### updateAgentStatus()

> **updateAgentStatus**: (`swarmId`, `agentId`, `data`) => `Promise`\<[`UpdateStatusResponse`](../interfaces/UpdateStatusResponse.md)\>

Update an agent's status

#### Parameters

##### swarmId

`string`

ID of the swarm

##### agentId

`string`

ID of the agent

##### data

[`AgentStatusUpdate`](../interfaces/AgentStatusUpdate.md)

Status update data

#### Returns

`Promise`\<[`UpdateStatusResponse`](../interfaces/UpdateStatusResponse.md)\>

Promise resolving to success confirmation
