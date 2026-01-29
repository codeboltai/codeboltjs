[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / DeepPartial

# Type Alias: DeepPartial\<T\>

> **DeepPartial**\<`T`\> = `{ [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }`

Defined in: [packages/codeboltjs/src/types/commonTypes.ts:262](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/commonTypes.ts#L262)

Makes all properties of T optional recursively

## Type Parameters

### T

`T`
