[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / APIResponse

# Interface: APIResponse\<T\>

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1716](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1716)

Standard API response wrapper

## Type Parameters

### T

`T` = `unknown`

## Properties

### code?

> `optional` **code**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1724](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1724)

Error code if unsuccessful

***

### data?

> `optional` **data**: `T`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1720](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1720)

Response data

***

### error?

> `optional` **error**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1722](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1722)

Error message if unsuccessful

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1726](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1726)

Additional metadata

***

### success

> **success**: `boolean`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1718](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1718)

Whether the operation was successful
