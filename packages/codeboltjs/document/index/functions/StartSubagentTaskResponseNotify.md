[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / StartSubagentTaskResponseNotify

# Function: StartSubagentTaskResponseNotify()

> **StartSubagentTaskResponseNotify**(`content`, `isError`, `toolUseId?`): `void`

Defined in: [packages/codeboltjs/src/notificationfunctions/agent.ts:75](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/agent.ts#L75)

Sends a response to a subagent task request

## Parameters

### content

`any`

The response content (string or any object)

### isError

`boolean` = `false`

Whether this is an error response (default: false)

### toolUseId?

`string`

Optional custom toolUseId, will be generated if not provided

Requirements: 1.2 - WHEN I call `codebolt.notify.agent.StartSubagentTaskResponseNotify()` THEN the system SHALL send a StartSubagentTaskResponseNotification via WebSocket

## Returns

`void`
