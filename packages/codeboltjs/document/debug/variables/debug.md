[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / debug

# Variable: debug

> `const` **debug**: `object`

Defined in: [debug.ts:13](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/debug.ts#L13)

## Type Declaration

### debug()

> **debug**: (`log`, `type`) => `Promise`\<`DebugAddLogResponse`\>

Sends a log message to the debug websocket and waits for a response.

#### Parameters

##### log

`string`

The log message to send.

##### type

[`logType`](../enumerations/logType.md)

The type of the log message (info, error, warning).

#### Returns

`Promise`\<`DebugAddLogResponse`\>

A promise that resolves with the response from the debug event.

### openDebugBrowser()

> **openDebugBrowser**: (`url`, `port`) => `Promise`\<`OpenDebugBrowserResponse`\>

Requests to open a debug browser at the specified URL and port.

#### Parameters

##### url

`string`

The URL where the debug browser should be opened.

##### port

`number`

The port on which the debug browser will listen.

#### Returns

`Promise`\<`OpenDebugBrowserResponse`\>

A promise that resolves with the response from the open debug browser event.
