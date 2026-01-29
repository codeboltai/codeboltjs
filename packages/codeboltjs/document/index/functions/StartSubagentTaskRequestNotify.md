[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / StartSubagentTaskRequestNotify

# Function: StartSubagentTaskRequestNotify()

> **StartSubagentTaskRequestNotify**(`parentAgentId`, `subagentId`, `task`, `priority?`, `dependencies?`, `toolUseId?`): `void`

Defined in: [packages/codeboltjs/src/notificationfunctions/agent.ts:35](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/agent.ts#L35)

Sends a request to start a subagent task

## Parameters

### parentAgentId

`string`

The parent agent ID

### subagentId

`string`

The subagent ID

### task

`string`

The task description

### priority?

`string`

Optional task priority

### dependencies?

`string`[]

Optional array of dependencies

### toolUseId?

`string`

Optional custom toolUseId, will be generated if not provided

Requirements: 1.1 - WHEN I call `codebolt.notify.agent.StartSubagentTaskRequestNotify()` THEN the system SHALL send a StartSubagentTaskRequestNotification via WebSocket

## Returns

`void`
