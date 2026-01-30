---
title: SwarmResponse
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: SwarmResponse

Defined in: packages/codeboltjs/src/types/swarm.ts:173

Base response structure for all swarm operations

## Extended by

- [`CreateSwarmResponse`](CreateSwarmResponse)
- [`ListSwarmsResponse`](ListSwarmsResponse)
- [`GetSwarmResponse`](GetSwarmResponse)
- [`GetSwarmAgentsResponse`](GetSwarmAgentsResponse)
- [`RegisterAgentResponse`](RegisterAgentResponse)
- [`UnregisterAgentResponse`](UnregisterAgentResponse)
- [`CreateTeamResponse`](CreateTeamResponse)
- [`ListTeamsResponse`](ListTeamsResponse)
- [`GetTeamResponse`](GetTeamResponse)
- [`JoinTeamResponse`](JoinTeamResponse)
- [`LeaveTeamResponse`](LeaveTeamResponse)
- [`DeleteTeamResponse`](DeleteTeamResponse)
- [`CreateRoleResponse`](CreateRoleResponse)
- [`ListRolesResponse`](ListRolesResponse)
- [`GetRoleResponse`](GetRoleResponse)
- [`AssignRoleResponse`](AssignRoleResponse)
- [`UnassignRoleResponse`](UnassignRoleResponse)
- [`GetAgentsByRoleResponse`](GetAgentsByRoleResponse)
- [`DeleteRoleResponse`](DeleteRoleResponse)
- [`CreateVacancyResponse`](CreateVacancyResponse)
- [`ListVacanciesResponse`](ListVacanciesResponse)
- [`ApplyForVacancyResponse`](ApplyForVacancyResponse)
- [`CloseVacancyResponse`](CloseVacancyResponse)
- [`UpdateStatusResponse`](UpdateStatusResponse)
- [`GetStatusSummaryResponse`](GetStatusSummaryResponse)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="error"></a> `error?` | \{ `code`: `string`; `details?`: `any`; `message`: `string`; \} | [packages/codeboltjs/src/types/swarm.ts:176](packages/codeboltjs/src/types/swarm.ts#L176) |
| `error.code` | `string` | [packages/codeboltjs/src/types/swarm.ts:177](packages/codeboltjs/src/types/swarm.ts#L177) |
| `error.details?` | `any` | [packages/codeboltjs/src/types/swarm.ts:179](packages/codeboltjs/src/types/swarm.ts#L179) |
| `error.message` | `string` | [packages/codeboltjs/src/types/swarm.ts:178](packages/codeboltjs/src/types/swarm.ts#L178) |
| <a id="requestid"></a> `requestId?` | `string` | [packages/codeboltjs/src/types/swarm.ts:175](packages/codeboltjs/src/types/swarm.ts#L175) |
| <a id="success"></a> `success` | `boolean` | [packages/codeboltjs/src/types/swarm.ts:174](packages/codeboltjs/src/types/swarm.ts#L174) |
