[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / ToolResult

# Interface: ToolResult

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:209](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L209)

Result from a tool execution

## Properties

### content

> **content**: `string` \| `Record`\<`string`, `unknown`\>

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:215](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L215)

The content returned by the tool

***

### role

> **role**: `"tool"`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:211](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L211)

Always 'tool' for tool execution results

***

### tool\_call\_id

> **tool\_call\_id**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:213](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L213)

ID that links this result to the original tool call

***

### userMessage?

> `optional` **userMessage**: `string` \| `Record`\<`string`, `unknown`\>

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:217](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L217)

Optional user message to be added after tool execution
