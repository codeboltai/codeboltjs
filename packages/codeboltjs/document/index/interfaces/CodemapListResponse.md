[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / CodemapListResponse

# Interface: CodemapListResponse

Defined in: [packages/codeboltjs/src/types/codemap.ts:75](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/codemap.ts#L75)

## Extends

- `CodemapBaseResponse`

## Properties

### code?

> `optional` **code**: `string`

Defined in: [packages/codeboltjs/src/types/codemap.ts:66](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/codemap.ts#L66)

#### Inherited from

`CodemapBaseResponse.code`

***

### data?

> `optional` **data**: `object`

Defined in: [packages/codeboltjs/src/types/codemap.ts:76](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/codemap.ts#L76)

#### codemaps

> **codemaps**: [`CodemapInfo`](CodemapInfo.md)[]

#### count

> **count**: `number`

***

### error?

> `optional` **error**: `object`

Defined in: [packages/codeboltjs/src/types/codemap.ts:68](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/codemap.ts#L68)

#### code

> **code**: `string`

#### details?

> `optional` **details**: `any`

#### message

> **message**: `string`

#### Inherited from

`CodemapBaseResponse.error`

***

### message?

> `optional` **message**: `string`

Defined in: [packages/codeboltjs/src/types/codemap.ts:67](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/codemap.ts#L67)

#### Inherited from

`CodemapBaseResponse.message`

***

### success

> **success**: `boolean`

Defined in: [packages/codeboltjs/src/types/codemap.ts:65](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/codemap.ts#L65)

#### Inherited from

`CodemapBaseResponse.success`
