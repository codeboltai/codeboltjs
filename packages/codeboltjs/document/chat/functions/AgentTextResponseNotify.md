[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / AgentTextResponseNotify

# Function: AgentTextResponseNotify()

> **AgentTextResponseNotify**(`content`, `isError`, `toolUseId?`, `data?`): `void`

Defined in: [notificationfunctions/chat.ts:71](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/chat.ts#L71)

Sends an agent text response

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

### data?

Optional additional data including message, timestamp, agentId, and conversationId

Requirements: 3.2 - WHEN I call `codebolt.notify.chat.AgentTextResponseNotify()` THEN the system SHALL send an AgentTextResponseNotification via WebSocket

#### agentId?

`string`

#### conversationId?

`string`

#### message

`string`

#### timestamp?

`string`

## Returns

`void`
