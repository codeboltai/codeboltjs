---
title: SendAgentMessageInput
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: SendAgentMessageInput

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:268](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L268)

Input for sending an inter-agent message

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="content"></a> `content` | `string` | Message content | [packages/codeboltjs/src/types/agentEventQueue.ts:274](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L274) |
| <a id="messagetype"></a> `messageType?` | `"text"` \| `"json"` \| `"command"` | Message type | [packages/codeboltjs/src/types/agentEventQueue.ts:276](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L276) |
| <a id="priority"></a> `priority?` | [`AgentEventPriority`](../enumerations/AgentEventPriority) | Event priority | [packages/codeboltjs/src/types/agentEventQueue.ts:278](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L278) |
| <a id="replyto"></a> `replyTo?` | `string` | Reference to a previous eventId for replies | [packages/codeboltjs/src/types/agentEventQueue.ts:280](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L280) |
| <a id="targetagentid"></a> `targetAgentId` | `string` | Target agent ID | [packages/codeboltjs/src/types/agentEventQueue.ts:270](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L270) |
| <a id="targetthreadid"></a> `targetThreadId?` | `string` | Target thread ID | [packages/codeboltjs/src/types/agentEventQueue.ts:272](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L272) |
