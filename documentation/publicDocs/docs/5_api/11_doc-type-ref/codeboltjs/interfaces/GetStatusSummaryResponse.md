---
title: GetStatusSummaryResponse
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: GetStatusSummaryResponse

Defined in: [packages/codeboltjs/src/types/swarm.ts:354](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/swarm.ts#L354)

Response for getSwarmStatusSummary

## Extends

- [`SwarmResponse`](SwarmResponse)

## Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="data"></a> `data?` | \{ `agents`: [`SwarmAgent`](SwarmAgent)[]; `statusSummary`: [`StatusSummary`](StatusSummary); \} | - | [packages/codeboltjs/src/types/swarm.ts:355](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/swarm.ts#L355) |
| `data.agents` | [`SwarmAgent`](SwarmAgent)[] | - | [packages/codeboltjs/src/types/swarm.ts:357](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/swarm.ts#L357) |
| `data.statusSummary` | [`StatusSummary`](StatusSummary) | - | [packages/codeboltjs/src/types/swarm.ts:356](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/swarm.ts#L356) |
| <a id="error"></a> `error?` | \{ `code`: `string`; `details?`: `any`; `message`: `string`; \} | [`SwarmResponse`](SwarmResponse).[`error`](SwarmResponse.md#error) | [packages/codeboltjs/src/types/swarm.ts:176](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/swarm.ts#L176) |
| `error.code` | `string` | - | [packages/codeboltjs/src/types/swarm.ts:177](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/swarm.ts#L177) |
| `error.details?` | `any` | - | [packages/codeboltjs/src/types/swarm.ts:179](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/swarm.ts#L179) |
| `error.message` | `string` | - | [packages/codeboltjs/src/types/swarm.ts:178](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/swarm.ts#L178) |
| <a id="requestid"></a> `requestId?` | `string` | [`SwarmResponse`](SwarmResponse).[`requestId`](SwarmResponse.md#requestid) | [packages/codeboltjs/src/types/swarm.ts:175](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/swarm.ts#L175) |
| <a id="success"></a> `success` | `boolean` | [`SwarmResponse`](SwarmResponse).[`success`](SwarmResponse.md#success) | [packages/codeboltjs/src/types/swarm.ts:174](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/swarm.ts#L174) |
