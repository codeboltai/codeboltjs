---
title: AddEventInput
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: AddEventInput

Defined in: packages/codeboltjs/src/types/agentEventQueue.ts:198

Input for adding an event to an agent's queue

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="eventtype"></a> `eventType?` | [`AgentEventType`](../enumerations/AgentEventType) | Type of event | [packages/codeboltjs/src/types/agentEventQueue.ts:206](packages/codeboltjs/src/types/agentEventQueue.ts#L206) |
| <a id="expiresat"></a> `expiresAt?` | `string` | Optional expiration time (ISO string) | [packages/codeboltjs/src/types/agentEventQueue.ts:212](packages/codeboltjs/src/types/agentEventQueue.ts#L212) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `any`\> | Additional metadata | [packages/codeboltjs/src/types/agentEventQueue.ts:214](packages/codeboltjs/src/types/agentEventQueue.ts#L214) |
| <a id="payload"></a> `payload` | [`AgentEventPayload`](../type-aliases/AgentEventPayload) | Event payload | [packages/codeboltjs/src/types/agentEventQueue.ts:210](packages/codeboltjs/src/types/agentEventQueue.ts#L210) |
| <a id="priority"></a> `priority?` | [`AgentEventPriority`](../enumerations/AgentEventPriority) | Event priority | [packages/codeboltjs/src/types/agentEventQueue.ts:208](packages/codeboltjs/src/types/agentEventQueue.ts#L208) |
| <a id="targetagentid"></a> `targetAgentId` | `string` | Target agent ID | [packages/codeboltjs/src/types/agentEventQueue.ts:200](packages/codeboltjs/src/types/agentEventQueue.ts#L200) |
| <a id="targetagentinstanceid"></a> `targetAgentInstanceId?` | `string` | Specific target agent instance ID | [packages/codeboltjs/src/types/agentEventQueue.ts:202](packages/codeboltjs/src/types/agentEventQueue.ts#L202) |
| <a id="targetthreadid"></a> `targetThreadId?` | `string` | Target thread ID | [packages/codeboltjs/src/types/agentEventQueue.ts:204](packages/codeboltjs/src/types/agentEventQueue.ts#L204) |
