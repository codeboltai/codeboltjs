[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / BrowserNavigationOptions

# Interface: BrowserNavigationOptions

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:846](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L846)

## Extends

- [`BrowserOperationOptions`](BrowserOperationOptions.md)

## Indexable

\[`key`: `string`\]: `any`

Additional operation-specific options

## Properties

### instanceId?

> `optional` **instanceId**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:841](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L841)

Browser instance ID (optional - uses active instance if not provided)

#### Inherited from

[`BrowserOperationOptions`](BrowserOperationOptions.md).[`instanceId`](BrowserOperationOptions.md#instanceid)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:852](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L852)

Timeout in milliseconds

***

### url

> **url**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:848](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L848)

URL to navigate to

***

### waitForLoad?

> `optional` **waitForLoad**: `boolean`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:850](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L850)

Wait for page load (default: true)
