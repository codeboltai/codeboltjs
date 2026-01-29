[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / WebFetchResponseNotify

# Function: WebFetchResponseNotify()

> **WebFetchResponseNotify**(`content`, `isError`, `toolUseId?`, `data?`): `void`

Defined in: [notificationfunctions/browser.ts:77](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/browser.ts#L77)

Sends a web fetch response notification

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

Optional response data including status, statusText, headers, and url

Requirements: 2.2 - WHEN I call `codebolt.notify.browser.WebFetchResponseNotify()` THEN the system SHALL send a WebFetchResponseNotification via WebSocket

#### headers?

`Record`\<`string`, `string`\>

#### status?

`number`

#### statusText?

`string`

#### url?

`string`

## Returns

`void`
