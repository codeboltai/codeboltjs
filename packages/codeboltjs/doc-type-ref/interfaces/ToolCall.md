---
title: ToolCall
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: ToolCall

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:71](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L71)

Represents a tool call in OpenAI format

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="function"></a> `function` | \{ `arguments`: `string`; `name`: `string`; \} | Function call details | [packages/codeboltjs/src/types/libFunctionTypes.ts:77](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L77) |
| `function.arguments` | `string` | Arguments for the function call as JSON string | [packages/codeboltjs/src/types/libFunctionTypes.ts:81](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L81) |
| `function.name` | `string` | Name of the function to call | [packages/codeboltjs/src/types/libFunctionTypes.ts:79](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L79) |
| <a id="id"></a> `id` | `string` | Unique identifier for this tool call | [packages/codeboltjs/src/types/libFunctionTypes.ts:73](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L73) |
| <a id="type"></a> `type` | `"function"` | The type of tool call | [packages/codeboltjs/src/types/libFunctionTypes.ts:75](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L75) |
