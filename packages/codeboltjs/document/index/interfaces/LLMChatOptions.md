[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / LLMChatOptions

# Interface: LLMChatOptions

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1375](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1375)

## Properties

### maxTokens?

> `optional` **maxTokens**: `number`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1383](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1383)

Maximum tokens to generate

***

### messages

> **messages**: [`Message`](Message.md)[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1377](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1377)

Messages in the conversation

***

### model?

> `optional` **model**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1379](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1379)

Model to use

***

### stream?

> `optional` **stream**: `boolean`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1385](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1385)

Whether to stream response

***

### temperature?

> `optional` **temperature**: `number`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1381](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1381)

Temperature (0-1)

***

### toolChoice?

> `optional` **toolChoice**: `"auto"` \| `"none"` \| `"required"`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1389](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1389)

Tool choice strategy

***

### tools?

> `optional` **tools**: [`Tool`](Tool.md)[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1387](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1387)

Available tools
