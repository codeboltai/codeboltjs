[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / Tool

# Interface: Tool

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:116](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L116)

Represents a tool definition in OpenAI format

## Properties

### function

> **function**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:120](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L120)

Function definition

#### description?

> `optional` **description**: `string`

Description of what the function does

#### name

> **name**: `string`

Name of the function

#### parameters?

> `optional` **parameters**: `JSONSchema`

JSON schema for the function parameters

***

### type

> **type**: `"function"`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:118](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L118)

The type of tool
