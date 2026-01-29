---
title: ToolFrameworkResult
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: ToolFrameworkResult

Defined in: [packages/codeboltjs/src/tools/types.ts:152](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/types.ts#L152)

Result of a tool execution

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="error"></a> `error?` | \{ `message`: `string`; `type?`: [`ToolErrorType`](../enumerations/ToolErrorType); \} | If this property is present, the tool call is considered a failure. | [packages/codeboltjs/src/tools/types.ts:168](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/types.ts#L168) |
| `error.message` | `string` | - | [packages/codeboltjs/src/tools/types.ts:169](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/types.ts#L169) |
| `error.type?` | [`ToolErrorType`](../enumerations/ToolErrorType) | - | [packages/codeboltjs/src/tools/types.ts:170](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/types.ts#L170) |
| <a id="llmcontent"></a> `llmContent` | `PartListUnion` | Content meant to be included in LLM history. This should represent the factual outcome of the tool execution. | [packages/codeboltjs/src/tools/types.ts:157](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/types.ts#L157) |
| <a id="returndisplay"></a> `returnDisplay` | `ToolResultDisplay` | Markdown string for user display. This provides a user-friendly summary or visualization of the result. | [packages/codeboltjs/src/tools/types.ts:163](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/types.ts#L163) |
