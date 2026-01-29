---
title: ConversationEntry
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: ConversationEntry

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:199](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L199)

Conversation history entry for agent interactions

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="content"></a> `content` | \| `string` \| \{ `text`: `string`; `type`: `string`; \}[] | [packages/codeboltjs/src/types/libFunctionTypes.ts:201](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L201) |
| <a id="role"></a> `role` | `"user"` \| `"assistant"` \| `"tool"` \| `"system"` | [packages/codeboltjs/src/types/libFunctionTypes.ts:200](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L200) |
| <a id="tool_call_id"></a> `tool_call_id?` | `string` | [packages/codeboltjs/src/types/libFunctionTypes.ts:202](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L202) |
| <a id="tool_calls"></a> `tool_calls?` | [`ToolCall`](ToolCall)[] | [packages/codeboltjs/src/types/libFunctionTypes.ts:203](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L203) |
