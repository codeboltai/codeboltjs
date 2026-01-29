[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / ConversationEntry

# Interface: ConversationEntry

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:199](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L199)

Conversation history entry for agent interactions

## Properties

### content

> **content**: `string` \| `object`[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:201](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L201)

***

### role

> **role**: `"user"` \| `"assistant"` \| `"tool"` \| `"system"`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:200](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L200)

***

### tool\_call\_id?

> `optional` **tool\_call\_id**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:202](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L202)

***

### tool\_calls?

> `optional` **tool\_calls**: [`ToolCall`](ToolCall.md)[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:203](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L203)
