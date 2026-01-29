[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / Required

# Type Alias: Required\<T, K\>

> **Required**\<`T`, `K`\> = `T` & `{ [P in K]-?: T[P] }`

Defined in: [packages/codeboltjs/src/types/commonTypes.ts:288](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/commonTypes.ts#L288)

Make specific properties required

## Type Parameters

### T

`T`

### K

`K` *extends* keyof `T`
