---
title: ToolResult
---

[**@codebolt/agent**](../../README)

***

# Interface: ToolResult

Defined in: [packages/agent/src/unified/types/libTypes.ts:107](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L107)

Tool result from execution

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="error"></a> `error?` | `string` | Error message if execution failed | [packages/agent/src/unified/types/libTypes.ts:117](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L117) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Execution metadata | [packages/agent/src/unified/types/libTypes.ts:119](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L119) |
| <a id="result"></a> `result` | `string` | Result of the tool execution | [packages/agent/src/unified/types/libTypes.ts:113](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L113) |
| <a id="success"></a> `success` | `boolean` | Whether the tool execution was successful | [packages/agent/src/unified/types/libTypes.ts:115](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L115) |
| <a id="toolcallid"></a> `toolCallId` | `string` | Tool call ID that this result corresponds to | [packages/agent/src/unified/types/libTypes.ts:109](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L109) |
| <a id="toolname"></a> `toolName` | `string` | Name of the tool that was executed | [packages/agent/src/unified/types/libTypes.ts:111](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L111) |
