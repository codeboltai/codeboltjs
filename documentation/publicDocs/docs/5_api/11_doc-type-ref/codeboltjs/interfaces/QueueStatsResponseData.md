---
title: QueueStatsResponseData
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: QueueStatsResponseData

Defined in: packages/codeboltjs/src/types/agentEventQueue.ts:338

Response data for getQueueStats

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="agentstats"></a> `agentStats` | `Record`\<`string`, \{ `delivered`: `number`; `pending`: `number`; \}\> | [packages/codeboltjs/src/types/agentEventQueue.ts:342](packages/codeboltjs/src/types/agentEventQueue.ts#L342) |
| <a id="storage"></a> `storage?` | \{ `indexSize`: `number`; `totalEvents`: `number`; \} | [packages/codeboltjs/src/types/agentEventQueue.ts:346](packages/codeboltjs/src/types/agentEventQueue.ts#L346) |
| `storage.indexSize` | `number` | [packages/codeboltjs/src/types/agentEventQueue.ts:348](packages/codeboltjs/src/types/agentEventQueue.ts#L348) |
| `storage.totalEvents` | `number` | [packages/codeboltjs/src/types/agentEventQueue.ts:347](packages/codeboltjs/src/types/agentEventQueue.ts#L347) |
| <a id="totalagents"></a> `totalAgents` | `number` | [packages/codeboltjs/src/types/agentEventQueue.ts:339](packages/codeboltjs/src/types/agentEventQueue.ts#L339) |
| <a id="totaldelivered"></a> `totalDelivered` | `number` | [packages/codeboltjs/src/types/agentEventQueue.ts:341](packages/codeboltjs/src/types/agentEventQueue.ts#L341) |
| <a id="totalpending"></a> `totalPending` | `number` | [packages/codeboltjs/src/types/agentEventQueue.ts:340](packages/codeboltjs/src/types/agentEventQueue.ts#L340) |
