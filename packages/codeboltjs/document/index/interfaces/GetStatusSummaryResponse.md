[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / GetStatusSummaryResponse

# Interface: GetStatusSummaryResponse

Defined in: [packages/codeboltjs/src/types/swarm.ts:354](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L354)

Response for getSwarmStatusSummary

## Extends

- [`SwarmResponse`](SwarmResponse.md)

## Properties

### data?

> `optional` **data**: `object`

Defined in: [packages/codeboltjs/src/types/swarm.ts:355](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L355)

#### agents

> **agents**: [`SwarmAgent`](SwarmAgent.md)[]

#### statusSummary

> **statusSummary**: [`StatusSummary`](StatusSummary.md)

***

### error?

> `optional` **error**: `object`

Defined in: [packages/codeboltjs/src/types/swarm.ts:176](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L176)

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

Defined in: [packages/codeboltjs/src/types/swarm.ts:175](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L175)

#### Inherited from

[`SwarmResponse`](SwarmResponse.md).[`requestId`](SwarmResponse.md#requestid)

***

### success

> **success**: `boolean`

Defined in: [packages/codeboltjs/src/types/swarm.ts:174](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/swarm.ts#L174)

#### Inherited from

[`SwarmResponse`](SwarmResponse.md).[`success`](SwarmResponse.md#success)
