---
title: AgentEventQueueResponse
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: AgentEventQueueResponse\<T\>

Defined in: packages/codeboltjs/src/types/agentEventQueue.ts:290

Standard response for Agent Event Queue operations

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `any` |

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `string` | Response code | [packages/codeboltjs/src/types/agentEventQueue.ts:294](packages/codeboltjs/src/types/agentEventQueue.ts#L294) |
| <a id="data"></a> `data?` | `T` | Response data | [packages/codeboltjs/src/types/agentEventQueue.ts:298](packages/codeboltjs/src/types/agentEventQueue.ts#L298) |
| <a id="error"></a> `error?` | \{ `code`: `string`; `details?`: `any`; `message`: `string`; \} | Error details | [packages/codeboltjs/src/types/agentEventQueue.ts:300](packages/codeboltjs/src/types/agentEventQueue.ts#L300) |
| `error.code` | `string` | - | [packages/codeboltjs/src/types/agentEventQueue.ts:301](packages/codeboltjs/src/types/agentEventQueue.ts#L301) |
| `error.details?` | `any` | - | [packages/codeboltjs/src/types/agentEventQueue.ts:303](packages/codeboltjs/src/types/agentEventQueue.ts#L303) |
| `error.message` | `string` | - | [packages/codeboltjs/src/types/agentEventQueue.ts:302](packages/codeboltjs/src/types/agentEventQueue.ts#L302) |
| <a id="message"></a> `message` | `string` | Human-readable message | [packages/codeboltjs/src/types/agentEventQueue.ts:296](packages/codeboltjs/src/types/agentEventQueue.ts#L296) |
| <a id="requestid"></a> `requestId?` | `string` | Request ID for correlation | [packages/codeboltjs/src/types/agentEventQueue.ts:308](packages/codeboltjs/src/types/agentEventQueue.ts#L308) |
| <a id="success"></a> `success` | `boolean` | Whether the operation succeeded | [packages/codeboltjs/src/types/agentEventQueue.ts:292](packages/codeboltjs/src/types/agentEventQueue.ts#L292) |
| <a id="timestamp"></a> `timestamp?` | `string` | Request timestamp | [packages/codeboltjs/src/types/agentEventQueue.ts:306](packages/codeboltjs/src/types/agentEventQueue.ts#L306) |
