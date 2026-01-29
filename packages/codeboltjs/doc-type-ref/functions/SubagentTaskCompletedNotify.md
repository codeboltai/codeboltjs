---
title: SubagentTaskCompletedNotify
---

[**@codebolt/codeboltjs**](../index)

***

# Function: SubagentTaskCompletedNotify()

```ts
function SubagentTaskCompletedNotify(
   parentAgentId: string, 
   subagentId: string, 
   taskId: string, 
   result: any, 
   status: string, 
   toolUseId?: string): void;
```

Defined in: [packages/codeboltjs/src/notificationfunctions/agent.ts:111](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/notificationfunctions/agent.ts#L111)

Notifies that a subagent task has been completed

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `parentAgentId` | `string` | The parent agent ID |
| `subagentId` | `string` | The subagent ID |
| `taskId` | `string` | The task ID |
| `result` | `any` | The task result |
| `status` | `string` | The task status |
| `toolUseId?` | `string` | Optional custom toolUseId, will be generated if not provided Requirements: 1.3 - WHEN I call `codebolt.notify.agent.SubagentTaskCompletedNotify()` THEN the system SHALL send a SubagentTaskCompletedNotification via WebSocket |

## Returns

`void`
