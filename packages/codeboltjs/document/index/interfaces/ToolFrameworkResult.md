[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / ToolFrameworkResult

# Interface: ToolFrameworkResult

Defined in: [packages/codeboltjs/src/tools/types.ts:152](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L152)

Result of a tool execution

## Properties

### error?

> `optional` **error**: `object`

Defined in: [packages/codeboltjs/src/tools/types.ts:168](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L168)

If this property is present, the tool call is considered a failure.

#### message

> **message**: `string`

#### type?

> `optional` **type**: [`ToolErrorType`](../enumerations/ToolErrorType.md)

***

### llmContent

> **llmContent**: `PartListUnion`

Defined in: [packages/codeboltjs/src/tools/types.ts:157](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L157)

Content meant to be included in LLM history.
This should represent the factual outcome of the tool execution.

***

### returnDisplay

> **returnDisplay**: `ToolResultDisplay`

Defined in: [packages/codeboltjs/src/tools/types.ts:163](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L163)

Markdown string for user display.
This provides a user-friendly summary or visualization of the result.
