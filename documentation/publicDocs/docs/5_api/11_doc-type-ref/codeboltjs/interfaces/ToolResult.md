---
title: ToolResult
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: ToolResult

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:209](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L209)

Result from a tool execution

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="content"></a> `content` | `string` \| `Record`\<`string`, `unknown`\> | The content returned by the tool | [packages/codeboltjs/src/types/libFunctionTypes.ts:215](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L215) |
| <a id="role"></a> `role` | `"tool"` | Always 'tool' for tool execution results | [packages/codeboltjs/src/types/libFunctionTypes.ts:211](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L211) |
| <a id="tool_call_id"></a> `tool_call_id` | `string` | ID that links this result to the original tool call | [packages/codeboltjs/src/types/libFunctionTypes.ts:213](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L213) |
| <a id="usermessage"></a> `userMessage?` | `string` \| `Record`\<`string`, `unknown`\> | Optional user message to be added after tool execution | [packages/codeboltjs/src/types/libFunctionTypes.ts:217](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L217) |
