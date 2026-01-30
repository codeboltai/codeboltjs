---
title: GetTeamResponse
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: GetTeamResponse

Defined in: packages/codeboltjs/src/types/swarm.ts:242

Response for getTeam

## Extends

- [`SwarmResponse`](SwarmResponse)

## Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="data"></a> `data?` | \{ `members`: [`SwarmAgent`](SwarmAgent)[]; `team`: [`Team`](Team); \} | - | [packages/codeboltjs/src/types/swarm.ts:243](packages/codeboltjs/src/types/swarm.ts#L243) |
| `data.members` | [`SwarmAgent`](SwarmAgent)[] | - | [packages/codeboltjs/src/types/swarm.ts:243](packages/codeboltjs/src/types/swarm.ts#L243) |
| `data.team` | [`Team`](Team) | - | [packages/codeboltjs/src/types/swarm.ts:243](packages/codeboltjs/src/types/swarm.ts#L243) |
| <a id="error"></a> `error?` | \{ `code`: `string`; `details?`: `any`; `message`: `string`; \} | [`SwarmResponse`](SwarmResponse).[`error`](SwarmResponse.md#error) | [packages/codeboltjs/src/types/swarm.ts:176](packages/codeboltjs/src/types/swarm.ts#L176) |
| `error.code` | `string` | - | [packages/codeboltjs/src/types/swarm.ts:177](packages/codeboltjs/src/types/swarm.ts#L177) |
| `error.details?` | `any` | - | [packages/codeboltjs/src/types/swarm.ts:179](packages/codeboltjs/src/types/swarm.ts#L179) |
| `error.message` | `string` | - | [packages/codeboltjs/src/types/swarm.ts:178](packages/codeboltjs/src/types/swarm.ts#L178) |
| <a id="requestid"></a> `requestId?` | `string` | [`SwarmResponse`](SwarmResponse).[`requestId`](SwarmResponse.md#requestid) | [packages/codeboltjs/src/types/swarm.ts:175](packages/codeboltjs/src/types/swarm.ts#L175) |
| <a id="success"></a> `success` | `boolean` | [`SwarmResponse`](SwarmResponse).[`success`](SwarmResponse.md#success) | [packages/codeboltjs/src/types/swarm.ts:174](packages/codeboltjs/src/types/swarm.ts#L174) |
