[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / GetChatHistoryResultNotify

# Function: GetChatHistoryResultNotify()

> **GetChatHistoryResultNotify**(`content`, `isError`, `toolUseId?`): `void`

Defined in: [notificationfunctions/chat.ts:130](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/chat.ts#L130)

Sends chat history result

## Parameters

### content

`any`

The chat history content (string or any object)

### isError

`boolean` = `false`

Whether this is an error response (default: false)

### toolUseId?

`string`

Optional custom toolUseId, will be generated if not provided

Requirements: 3.4 - WHEN I call `codebolt.notify.chat.GetChatHistoryResultNotify()` THEN the system SHALL send a GetChatHistoryResultNotification via WebSocket

## Returns

`void`
