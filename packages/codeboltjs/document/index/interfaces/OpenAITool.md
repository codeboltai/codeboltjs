[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / OpenAITool

# Interface: OpenAITool

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:178](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L178)

OpenAI-compatible tool format

## Properties

### function

> **function**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:180](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L180)

#### description

> **description**: `string`

#### name

> **name**: `string`

#### parameters

> **parameters**: `object`

##### parameters.additionalProperties?

> `optional` **additionalProperties**: `boolean`

##### parameters.properties

> **properties**: `Record`\<`string`, \{ `description`: `string`; `type`: `string`; \}\>

##### parameters.required?

> `optional` **required**: `string`[]

##### parameters.type

> **type**: `"object"`

#### strict?

> `optional` **strict**: `boolean`

***

### type

> **type**: `"function"`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:179](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L179)
