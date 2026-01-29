[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / WebFetchRequestNotify

# Function: WebFetchRequestNotify()

> **WebFetchRequestNotify**(`url`, `method?`, `headers?`, `body?`, `timeout?`, `toolUseId?`): `void`

Defined in: [notificationfunctions/browser.ts:36](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/browser.ts#L36)

Sends a web fetch request notification

## Parameters

### url

`string`

The URL to fetch

### method?

`string`

Optional HTTP method

### headers?

`Record`\<`string`, `string`\>

Optional headers object

### body?

`any`

Optional request body

### timeout?

`number`

Optional timeout in milliseconds

### toolUseId?

`string`

Optional custom toolUseId, will be generated if not provided

Requirements: 2.1 - WHEN I call `codebolt.notify.browser.WebFetchRequestNotify()` THEN the system SHALL send a WebFetchRequestNotification via WebSocket

## Returns

`void`
