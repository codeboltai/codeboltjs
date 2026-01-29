[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / DeepRequired

# Type Alias: DeepRequired\<T\>

> **DeepRequired**\<`T`\> = `{ [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P] }`

Defined in: [packages/codeboltjs/src/types/commonTypes.ts:269](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/commonTypes.ts#L269)

Makes all properties of T required recursively

## Type Parameters

### T

`T`
