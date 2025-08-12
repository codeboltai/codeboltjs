[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• `Const` **default**: `Object`

A module for controlling a web crawler through WebSocket messages.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `click` | (`id`: `string`) => `Promise`\<`any`\> | - |
| `goToPage` | (`url`: `string`) => `void` | - |
| `screenshot` | () => `void` | - |
| `scroll` | (`direction`: `string`) => `void` | - |
| `start` | () => `void` | - |

#### Defined in

[crawler.ts:6](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/crawler.ts#L6)
