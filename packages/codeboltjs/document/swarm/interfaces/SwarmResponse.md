[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / SwarmResponse

# Interface: SwarmResponse

Defined in: [types/swarm.ts:173](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L173)

Base response structure for all swarm operations

## Extended by

- [`CreateSwarmResponse`](CreateSwarmResponse.md)
- [`ListSwarmsResponse`](ListSwarmsResponse.md)
- [`GetSwarmResponse`](GetSwarmResponse.md)
- [`GetSwarmAgentsResponse`](GetSwarmAgentsResponse.md)
- [`RegisterAgentResponse`](RegisterAgentResponse.md)
- [`UnregisterAgentResponse`](UnregisterAgentResponse.md)
- [`CreateTeamResponse`](CreateTeamResponse.md)
- [`ListTeamsResponse`](ListTeamsResponse.md)
- [`GetTeamResponse`](GetTeamResponse.md)
- [`JoinTeamResponse`](JoinTeamResponse.md)
- [`LeaveTeamResponse`](LeaveTeamResponse.md)
- [`DeleteTeamResponse`](DeleteTeamResponse.md)
- [`CreateRoleResponse`](CreateRoleResponse.md)
- [`ListRolesResponse`](ListRolesResponse.md)
- [`GetRoleResponse`](GetRoleResponse.md)
- [`AssignRoleResponse`](AssignRoleResponse.md)
- [`UnassignRoleResponse`](UnassignRoleResponse.md)
- [`GetAgentsByRoleResponse`](GetAgentsByRoleResponse.md)
- [`DeleteRoleResponse`](DeleteRoleResponse.md)
- [`CreateVacancyResponse`](CreateVacancyResponse.md)
- [`ListVacanciesResponse`](ListVacanciesResponse.md)
- [`ApplyForVacancyResponse`](ApplyForVacancyResponse.md)
- [`CloseVacancyResponse`](CloseVacancyResponse.md)
- [`UpdateStatusResponse`](UpdateStatusResponse.md)
- [`GetStatusSummaryResponse`](GetStatusSummaryResponse.md)
- [`GetDefaultJobGroupResponse`](GetDefaultJobGroupResponse.md)

## Properties

### error?

> `optional` **error**: `object`

Defined in: [types/swarm.ts:176](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L176)

#### code

> **code**: `string`

#### details?

> `optional` **details**: `any`

#### message

> **message**: `string`

***

### requestId?

> `optional` **requestId**: `string`

Defined in: [types/swarm.ts:175](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L175)

***

### success

> **success**: `boolean`

Defined in: [types/swarm.ts:174](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L174)
