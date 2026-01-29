[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / GetChatHistoryRequestNotify

# Function: GetChatHistoryRequestNotify()

> **GetChatHistoryRequestNotify**(`data?`, `toolUseId?`): `void`

Defined in: [notificationfunctions/chat.ts:105](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/chat.ts#L105)

Requests chat history

## Parameters

### data?

Optional data including sessionId

#### sessionId?

`string`

### toolUseId?

`string`

Optional custom toolUseId, will be generated if not provided

Requirements: 3.3 - WHEN I call `codebolt.notify.chat.GetChatHistoryRequestNotify()` THEN the system SHALL send a GetChatHistoryRequestNotification via WebSocket

## Returns

`void`
