---
title: AgentMessagePayload
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: AgentMessagePayload

Defined in: packages/codeboltjs/src/types/agentEventQueue.ts:61

Payload for inter-agent messages

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="content"></a> `content` | `string` | Message content | [packages/codeboltjs/src/types/agentEventQueue.ts:64](packages/codeboltjs/src/types/agentEventQueue.ts#L64) |
| <a id="messagetype"></a> `messageType?` | `"text"` \| `"json"` \| `"command"` | Type of message content | [packages/codeboltjs/src/types/agentEventQueue.ts:66](packages/codeboltjs/src/types/agentEventQueue.ts#L66) |
| <a id="replyto"></a> `replyTo?` | `string` | Reference to a previous eventId for replies | [packages/codeboltjs/src/types/agentEventQueue.ts:68](packages/codeboltjs/src/types/agentEventQueue.ts#L68) |
| <a id="type"></a> `type` | `"agentMessage"` | - | [packages/codeboltjs/src/types/agentEventQueue.ts:62](packages/codeboltjs/src/types/agentEventQueue.ts#L62) |
