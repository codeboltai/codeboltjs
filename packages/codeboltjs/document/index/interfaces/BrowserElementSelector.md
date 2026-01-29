[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / BrowserElementSelector

# Interface: BrowserElementSelector

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:864](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L864)

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

### selector

> **selector**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:866](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L866)

CSS selector

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:870](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L870)

Timeout for waiting

***

### waitFor?

> `optional` **waitFor**: `boolean`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:868](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L868)

Whether to wait for element
