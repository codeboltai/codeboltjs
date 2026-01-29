[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / BrowserScreenshotOptions

# Interface: BrowserScreenshotOptions

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:855](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L855)

## Extends

- [`BrowserOperationOptions`](BrowserOperationOptions.md)

## Indexable

\[`key`: `string`\]: `any`

Additional operation-specific options

## Properties

### format?

> `optional` **format**: `"png"` \| `"jpeg"`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:861](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L861)

Image format

***

### fullPage?

> `optional` **fullPage**: `boolean`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:857](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L857)

Take full page screenshot

***

### instanceId?

> `optional` **instanceId**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:841](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L841)

Browser instance ID (optional - uses active instance if not provided)

#### Inherited from

[`BrowserOperationOptions`](BrowserOperationOptions.md).[`instanceId`](BrowserOperationOptions.md#instanceid)

***

### quality?

> `optional` **quality**: `number`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:859](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L859)

Image quality (0-100)
