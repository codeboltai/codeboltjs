[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / AsyncOperationOptions

# Interface: AsyncOperationOptions

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1761](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1761)

Common options for async operations

## Properties

### onProgress()?

> `optional` **onProgress**: (`progress`) => `void`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1770](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1770)

Progress callback

#### Parameters

##### progress

`number`

#### Returns

`void`

***

### retry?

> `optional` **retry**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1765](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1765)

Retry configuration

#### attempts?

> `optional` **attempts**: `number`

#### delay?

> `optional` **delay**: `number`

***

### signal?

> `optional` **signal**: `AbortSignal`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1772](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1772)

Cancellation signal

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1763](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1763)

Operation timeout in milliseconds
