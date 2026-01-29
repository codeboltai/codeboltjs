---
title: QueueStatsResponseData
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: QueueStatsResponseData

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:338](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L338)

Response data for getQueueStats

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="agentstats"></a> `agentStats` | `Record`\<`string`, \{ `delivered`: `number`; `pending`: `number`; \}\> | [packages/codeboltjs/src/types/agentEventQueue.ts:342](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L342) |
| <a id="storage"></a> `storage?` | \{ `indexSize`: `number`; `totalEvents`: `number`; \} | [packages/codeboltjs/src/types/agentEventQueue.ts:346](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L346) |
| `storage.indexSize` | `number` | [packages/codeboltjs/src/types/agentEventQueue.ts:348](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L348) |
| `storage.totalEvents` | `number` | [packages/codeboltjs/src/types/agentEventQueue.ts:347](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L347) |
| <a id="totalagents"></a> `totalAgents` | `number` | [packages/codeboltjs/src/types/agentEventQueue.ts:339](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L339) |
| <a id="totaldelivered"></a> `totalDelivered` | `number` | [packages/codeboltjs/src/types/agentEventQueue.ts:341](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L341) |
| <a id="totalpending"></a> `totalPending` | `number` | [packages/codeboltjs/src/types/agentEventQueue.ts:340](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L340) |
