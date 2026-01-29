[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / UserMessageRequestNotify

# Function: UserMessageRequestNotify()

> **UserMessageRequestNotify**(`message`, `payload?`, `toolUseId?`): `void`

Defined in: [notificationfunctions/chat.ts:36](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/chat.ts#L36)

Sends a user message request

## Parameters

### message

`string`

The user message

### payload?

`any`

Optional payload data

### toolUseId?

`string`

Optional custom toolUseId, will be generated if not provided

Requirements: 3.1 - WHEN I call `codebolt.notify.chat.UserMessageRequestNotify()` THEN the system SHALL send a UserMessageRequestNotification via WebSocket

## Returns

`void`
