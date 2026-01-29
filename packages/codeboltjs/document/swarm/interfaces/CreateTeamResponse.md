[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / CreateTeamResponse

# Interface: CreateTeamResponse

Defined in: [types/swarm.ts:228](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L228)

Response for createTeam

## Extends

- [`SwarmResponse`](SwarmResponse.md)

## Properties

### data?

> `optional` **data**: `object`

Defined in: [types/swarm.ts:229](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L229)

#### team

> **team**: [`Team`](Team.md)

***

### error?

> `optional` **error**: `object`

Defined in: [types/swarm.ts:176](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L176)

#### code

> **code**: `string`

#### details?

> `optional` **details**: `any`

#### message

> **message**: `string`

#### Inherited from

[`SwarmResponse`](SwarmResponse.md).[`error`](SwarmResponse.md#error)

***

### requestId?

> `optional` **requestId**: `string`

Defined in: [types/swarm.ts:175](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L175)

#### Inherited from

[`SwarmResponse`](SwarmResponse.md).[`requestId`](SwarmResponse.md#requestid)

***

### success

> **success**: `boolean`

Defined in: [types/swarm.ts:174](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L174)

#### Inherited from

[`SwarmResponse`](SwarmResponse.md).[`success`](SwarmResponse.md#success)
