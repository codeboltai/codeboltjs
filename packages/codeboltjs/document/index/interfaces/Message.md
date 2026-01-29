[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / Message

# Interface: Message

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:55](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L55)

Represents a message in the conversation with roles and content.

## Indexable

\[`key`: `string`\]: `unknown`

Additional properties that might be present

## Properties

### content

> **content**: `string` \| `MessageContentBlock`[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:59](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L59)

The content of the message, can be an array of content blocks or a string

***

### role

> **role**: `"user"` \| `"assistant"` \| `"tool"` \| `"system"`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:57](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L57)

The role of the message sender: user, assistant, tool, or system

***

### tool\_call\_id?

> `optional` **tool\_call\_id**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:61](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L61)

Optional ID for tool calls

***

### tool\_calls?

> `optional` **tool\_calls**: [`ToolCall`](ToolCall.md)[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:63](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L63)

Optional tool calls for assistant messages
