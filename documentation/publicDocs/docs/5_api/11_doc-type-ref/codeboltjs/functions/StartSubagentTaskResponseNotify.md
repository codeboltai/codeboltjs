---
title: StartSubagentTaskResponseNotify
---

[**@codebolt/codeboltjs**](../README)

***

# Function: StartSubagentTaskResponseNotify()

```ts
function StartSubagentTaskResponseNotify(
   content: any, 
   isError: boolean, 
   toolUseId?: string): void;
```

Defined in: [packages/codeboltjs/src/notificationfunctions/agent.ts:75](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/notificationfunctions/agent.ts#L75)

Sends a response to a subagent task request

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `content` | `any` | `undefined` | The response content (string or any object) |
| `isError` | `boolean` | `false` | Whether this is an error response (default: false) |
| `toolUseId?` | `string` | `undefined` | Optional custom toolUseId, will be generated if not provided Requirements: 1.2 - WHEN I call `codebolt.notify.agent.StartSubagentTaskResponseNotify()` THEN the system SHALL send a StartSubagentTaskResponseNotification via WebSocket |

## Returns

`void`
