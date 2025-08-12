[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Classes

- [FastMCPSession](classes/FastMCPSession.md)
- [ToolBox](classes/ToolBox.md)
- [UnexpectedStateError](classes/UnexpectedStateError.md)
- [UserError](classes/UserError.md)

### Type Aliases

- [SSEServer](modules.md#sseserver)

### Functions

- [imageContent](modules.md#imagecontent)

## Type Aliases

### SSEServer

Ƭ **SSEServer**: `Object`

Type definition for SSE Server that can be closed.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `close` | () => `Promise`\<`void`\> |

#### Defined in

[src/utils/toolBox.ts:39](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L39)

## Functions

### imageContent

▸ **imageContent**(`input`): `Promise`\<`ImageContent`\>

Generates an image content object from a URL, file path, or buffer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | \{ `url`: `string`  } \| \{ `path`: `string`  } \| \{ `buffer`: `Buffer`  } | The input source for the image (URL, file path, or buffer) |

#### Returns

`Promise`\<`ImageContent`\>

Promise with the image content object

#### Defined in

[src/utils/toolBox.ts:65](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L65)
