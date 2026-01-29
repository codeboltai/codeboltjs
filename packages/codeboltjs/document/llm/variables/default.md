[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [llm.ts:11](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/llm.ts#L11)

A module for interacting with language learning models (LLMs) via WebSocket.

## Type Declaration

### getModelConfig()

> **getModelConfig**: (`modelId?`) => `Promise`\<\{ `config`: `null` \| `LLMModelConfig`; `error?`: `string`; `success`: `boolean`; \}\>

Gets the model configuration for a specific model or the default application model.
If modelId is provided, returns configuration for that specific model.
If modelId is not provided, returns the default application LLM configuration.

#### Parameters

##### modelId?

`string`

Optional model identifier. If not provided, returns default model config.

#### Returns

`Promise`\<\{ `config`: `null` \| `LLMModelConfig`; `error?`: `string`; `success`: `boolean`; \}\>

A promise that resolves with the model configuration including provider and model details.

### inference()

> **inference**: (`params`) => `Promise`\<\{ `completion`: `LLMCompletion`; \}\>

Sends an inference request to the LLM using OpenAI message format with tools support.
The model is selected based on the provided `llmrole`. If the specific model
for the role is not found, it falls back to the default model for the current agent,
and ultimately to the default application-wide LLM if necessary.

#### Parameters

##### params

`LLMInferenceParams`

The inference parameters including:
  - messages: Array of conversation messages
  - tools: Available tools for the model to use
  - tool_choice: How the model should use tools
  - full: Whether to return full response
  - max_tokens: Maximum number of tokens to generate
  - temperature: Temperature for response generation
  - stream: Whether to stream the response

#### Returns

`Promise`\<\{ `completion`: `LLMCompletion`; \}\>

A promise that resolves with the LLM's response
