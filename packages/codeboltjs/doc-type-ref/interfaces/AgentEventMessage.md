---
title: AgentEventMessage
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: AgentEventMessage

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:156](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L156)

Core event message structure

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="acknowledgedat"></a> `acknowledgedAt?` | `string` | When acknowledgement was received | [packages/codeboltjs/src/types/agentEventQueue.ts:180](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L180) |
| <a id="createdat"></a> `createdAt` | `string` | Event creation timestamp (ISO string) | [packages/codeboltjs/src/types/agentEventQueue.ts:176](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L176) |
| <a id="deliveredat"></a> `deliveredAt?` | `string` | When the event was delivered via WebSocket | [packages/codeboltjs/src/types/agentEventQueue.ts:178](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L178) |
| <a id="eventid"></a> `eventId` | `string` | Unique event identifier (UUID) | [packages/codeboltjs/src/types/agentEventQueue.ts:158](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L158) |
| <a id="eventtype"></a> `eventType` | [`AgentEventType`](../enumerations/AgentEventType) | Type of event | [packages/codeboltjs/src/types/agentEventQueue.ts:170](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L170) |
| <a id="expiresat"></a> `expiresAt?` | `string` | Optional expiration time (ISO string) | [packages/codeboltjs/src/types/agentEventQueue.ts:182](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L182) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `any`\> | Additional metadata | [packages/codeboltjs/src/types/agentEventQueue.ts:188](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L188) |
| <a id="payload"></a> `payload` | [`AgentEventPayload`](../type-aliases/AgentEventPayload) | Event payload (discriminated by type) | [packages/codeboltjs/src/types/agentEventQueue.ts:174](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L174) |
| <a id="priority"></a> `priority` | [`AgentEventPriority`](../enumerations/AgentEventPriority) | Event priority | [packages/codeboltjs/src/types/agentEventQueue.ts:172](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L172) |
| <a id="retrycount"></a> `retryCount` | `number` | Number of delivery retry attempts | [packages/codeboltjs/src/types/agentEventQueue.ts:186](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L186) |
| <a id="sourceagentid"></a> `sourceAgentId?` | `string` | Source agent ID (for inter-agent messages) | [packages/codeboltjs/src/types/agentEventQueue.ts:166](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L166) |
| <a id="sourcethreadid"></a> `sourceThreadId?` | `string` | Source thread ID | [packages/codeboltjs/src/types/agentEventQueue.ts:168](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L168) |
| <a id="status"></a> `status` | [`AgentEventStatus`](../enumerations/AgentEventStatus) | Current status of the event | [packages/codeboltjs/src/types/agentEventQueue.ts:184](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L184) |
| <a id="targetagentid"></a> `targetAgentId` | `string` | Target agent ID | [packages/codeboltjs/src/types/agentEventQueue.ts:160](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L160) |
| <a id="targetagentinstanceid"></a> `targetAgentInstanceId?` | `string` | Specific target agent instance ID (optional) | [packages/codeboltjs/src/types/agentEventQueue.ts:162](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L162) |
| <a id="targetthreadid"></a> `targetThreadId?` | `string` | Target thread ID (optional) | [packages/codeboltjs/src/types/agentEventQueue.ts:164](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L164) |
