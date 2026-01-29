[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / WebSearchResponseNotify

# Function: WebSearchResponseNotify()

> **WebSearchResponseNotify**(`content`, `isError`, `toolUseId?`, `data?`): `void`

Defined in: [notificationfunctions/browser.ts:153](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/browser.ts#L153)

Sends a web search response notification

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

Optional response data including results, totalResults, and searchTime

Requirements: 2.4 - WHEN I call `codebolt.notify.browser.WebSearchResponseNotify()` THEN the system SHALL send a WebSearchResponseNotification via WebSocket

#### results

`object`[]

#### searchTime?

`number`

#### totalResults?

`number`

## Returns

`void`
