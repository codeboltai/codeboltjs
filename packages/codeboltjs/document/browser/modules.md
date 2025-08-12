[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• `Const` **default**: `Object`

A module for interacting with a browser through WebSockets.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `click` | (`elementid`: `string`) => `Promise`\<`any`\> | - |
| `close` | () => `void` | - |
| `enter` | () => `Promise`\<`any`\> | - |
| `extractText` | () => `Promise`\<`ExtractTextResponse`\> | - |
| `getBrowserInfo` | () => `Promise`\<`any`\> | - |
| `getContent` | () => `Promise`\<`GetContentResponse`\> | - |
| `getHTML` | () => `Promise`\<`HtmlReceived`\> | - |
| `getMarkdown` | () => `Promise`\<`GetMarkdownResponse`\> | - |
| `getPDF` | () => `void` | - |
| `getSnapShot` | () => `Promise`\<`any`\> | - |
| `getUrl` | () => `Promise`\<`UrlResponse`\> | - |
| `goToPage` | (`url`: `string`) => `Promise`\<`GoToPageResponse`\> | - |
| `newPage` | () => `Promise`\<`any`\> | - |
| `pdfToText` | () => `void` | - |
| `screenshot` | () => `Promise`\<`any`\> | - |
| `scroll` | (`direction`: `string`, `pixels`: `string`) => `Promise`\<`any`\> | - |
| `search` | (`elementid`: `string`, `query`: `string`) => `Promise`\<`any`\> | - |
| `type` | (`elementid`: `string`, `text`: `string`) => `Promise`\<`any`\> | - |

#### Defined in

[browser.ts:6](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/browser.ts#L6)
