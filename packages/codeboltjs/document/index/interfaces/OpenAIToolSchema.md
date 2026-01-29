[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / OpenAIToolSchema

# Interface: OpenAIToolSchema

Defined in: [packages/codeboltjs/src/tools/types.ts:8](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L8)

OpenAI tool schema format - primary format for LLM tool calls

## Properties

### function

> **function**: `object`

Defined in: [packages/codeboltjs/src/tools/types.ts:10](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L10)

#### description

> **description**: `string`

#### name

> **name**: `string`

#### parameters

> **parameters**: `object`

##### parameters.additionalProperties?

> `optional` **additionalProperties**: `boolean`

##### parameters.properties

> **properties**: `Record`\<`string`, `any`\>

##### parameters.required?

> `optional` **required**: `string`[]

##### parameters.type

> **type**: `"object"`

***

### type

> **type**: `"function"`

Defined in: [packages/codeboltjs/src/tools/types.ts:9](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L9)
