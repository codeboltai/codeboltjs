[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / LLMInferenceParams

# Interface: LLMInferenceParams

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:133](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L133)

LLM inference request parameters

## Properties

### llmrole

> **llmrole**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:141](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L141)

The LLM role to determine which model to use

***

### max\_tokens?

> `optional` **max\_tokens**: `number`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:143](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L143)

Maximum number of tokens to generate

***

### messages

> **messages**: [`Message`](Message.md)[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:135](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L135)

Array of messages in the conversation

***

### stream?

> `optional` **stream**: `boolean`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:147](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L147)

Whether to stream the response

***

### temperature?

> `optional` **temperature**: `number`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:145](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L145)

Temperature for response generation

***

### tool\_choice?

> `optional` **tool\_choice**: \{ `function`: \{ `name`: `string`; \}; `type`: `"function"`; \} \| `"auto"` \| `"none"` \| `"required"`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:139](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L139)

How the model should use tools

***

### tools?

> `optional` **tools**: [`Tool`](Tool.md)[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:137](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L137)

Available tools for the model to use
