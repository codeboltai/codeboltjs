[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / ToolCall

# Interface: ToolCall

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:71](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L71)

Represents a tool call in OpenAI format

## Properties

### function

> **function**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:77](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L77)

Function call details

#### arguments

> **arguments**: `string`

Arguments for the function call as JSON string

#### name

> **name**: `string`

Name of the function to call

***

### id

> **id**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:73](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L73)

Unique identifier for this tool call

***

### type

> **type**: `"function"`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:75](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L75)

The type of tool call
