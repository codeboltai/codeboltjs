---
title: GetPendingEventsInput
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: GetPendingEventsInput

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:220](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L220)

Input for getting pending events

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="agentid"></a> `agentId?` | `string` | Agent ID to get events for | [packages/codeboltjs/src/types/agentEventQueue.ts:222](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L222) |
| <a id="agentinstanceid"></a> `agentInstanceId?` | `string` | Agent instance ID | [packages/codeboltjs/src/types/agentEventQueue.ts:224](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L224) |
| <a id="eventtypes"></a> `eventTypes?` | [`AgentEventType`](../enumerations/AgentEventType)[] | Filter by event types | [packages/codeboltjs/src/types/agentEventQueue.ts:230](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L230) |
| <a id="limit"></a> `limit?` | `number` | Maximum number of events to return | [packages/codeboltjs/src/types/agentEventQueue.ts:228](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L228) |
| <a id="minpriority"></a> `minPriority?` | [`AgentEventPriority`](../enumerations/AgentEventPriority) | Filter by priority | [packages/codeboltjs/src/types/agentEventQueue.ts:232](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L232) |
| <a id="threadid"></a> `threadId?` | `string` | Thread ID | [packages/codeboltjs/src/types/agentEventQueue.ts:226](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L226) |
