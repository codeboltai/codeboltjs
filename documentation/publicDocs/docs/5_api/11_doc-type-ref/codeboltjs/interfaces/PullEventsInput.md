---
title: PullEventsInput
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: PullEventsInput

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:238](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L238)

Input for pulling events (get and remove)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="agentid"></a> `agentId?` | `string` | Agent ID to pull events for | [packages/codeboltjs/src/types/agentEventQueue.ts:240](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L240) |
| <a id="agentinstanceid"></a> `agentInstanceId?` | `string` | Agent instance ID | [packages/codeboltjs/src/types/agentEventQueue.ts:242](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L242) |
| <a id="eventtypes"></a> `eventTypes?` | [`AgentEventType`](../enumerations/AgentEventType)[] | Filter by event types | [packages/codeboltjs/src/types/agentEventQueue.ts:248](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L248) |
| <a id="limit"></a> `limit?` | `number` \| `"all"` | Number of events to pull, or 'all' | [packages/codeboltjs/src/types/agentEventQueue.ts:246](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L246) |
| <a id="since"></a> `since?` | `string` | Only pull events since this timestamp | [packages/codeboltjs/src/types/agentEventQueue.ts:250](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L250) |
| <a id="threadid"></a> `threadId?` | `string` | Thread ID | [packages/codeboltjs/src/types/agentEventQueue.ts:244](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L244) |
