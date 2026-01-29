[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / SubagentTaskCompletedNotify

# Function: SubagentTaskCompletedNotify()

> **SubagentTaskCompletedNotify**(`parentAgentId`, `subagentId`, `taskId`, `result`, `status`, `toolUseId?`): `void`

Defined in: [packages/codeboltjs/src/notificationfunctions/agent.ts:111](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/agent.ts#L111)

Notifies that a subagent task has been completed

## Parameters

### parentAgentId

`string`

The parent agent ID

### subagentId

`string`

The subagent ID

### taskId

`string`

The task ID

### result

`any`

The task result

### status

`string`

The task status

### toolUseId?

`string`

Optional custom toolUseId, will be generated if not provided

Requirements: 1.3 - WHEN I call `codebolt.notify.agent.SubagentTaskCompletedNotify()` THEN the system SHALL send a SubagentTaskCompletedNotification via WebSocket

## Returns

`void`
