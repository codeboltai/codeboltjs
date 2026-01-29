[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / WebSearchRequestNotify

# Function: WebSearchRequestNotify()

> **WebSearchRequestNotify**(`query`, `maxResults?`, `searchEngine?`, `filters?`, `toolUseId?`): `void`

Defined in: [notificationfunctions/browser.ts:114](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/browser.ts#L114)

Sends a web search request notification

## Parameters

### query

`string`

The search query string

### maxResults?

`number`

Optional maximum number of results

### searchEngine?

`string`

Optional search engine to use

### filters?

`any`

Optional search filters

### toolUseId?

`string`

Optional custom toolUseId, will be generated if not provided

Requirements: 2.3 - WHEN I call `codebolt.notify.browser.WebSearchRequestNotify()` THEN the system SHALL send a WebSearchRequestNotification via WebSocket

## Returns

`void`
