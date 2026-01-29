[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / OpenAIMessage

# Interface: OpenAIMessage

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:157](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L157)

OpenAI-compatible message format for conversations

## Properties

### content

> **content**: `string` \| `object`[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:161](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L161)

Content of the message

***

### role

> **role**: `"user"` \| `"assistant"` \| `"tool"` \| `"system"`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:159](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L159)

Role of the message sender

***

### tool\_call\_id?

> `optional` **tool\_call\_id**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:163](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L163)

Tool call ID for tool messages

***

### tool\_calls?

> `optional` **tool\_calls**: `object`[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:165](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L165)

Tool calls for assistant messages

#### function

> **function**: `object`

##### function.arguments

> **arguments**: `string`

##### function.name

> **name**: `string`

#### id

> **id**: `string`

#### type

> **type**: `"function"`
