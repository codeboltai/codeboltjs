---
title: OpenAITool
---

[**@codebolt/agent**](../../README)

***

# Interface: OpenAITool

Defined in: [packages/agent/src/unified/types/libTypes.ts:90](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L90)

OpenAI-compatible tool format

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="function"></a> `function` | \{ `description`: `string`; `name`: `string`; `parameters`: \{ `additionalProperties?`: `boolean`; `properties`: `Record`\<`string`, `unknown`\>; `required?`: `string`[]; `type`: `"object"`; \}; \} | [packages/agent/src/unified/types/libTypes.ts:92](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L92) |
| `function.description` | `string` | [packages/agent/src/unified/types/libTypes.ts:94](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L94) |
| `function.name` | `string` | [packages/agent/src/unified/types/libTypes.ts:93](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L93) |
| `function.parameters` | \{ `additionalProperties?`: `boolean`; `properties`: `Record`\<`string`, `unknown`\>; `required?`: `string`[]; `type`: `"object"`; \} | [packages/agent/src/unified/types/libTypes.ts:95](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L95) |
| `function.parameters.additionalProperties?` | `boolean` | [packages/agent/src/unified/types/libTypes.ts:99](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L99) |
| `function.parameters.properties` | `Record`\<`string`, `unknown`\> | [packages/agent/src/unified/types/libTypes.ts:97](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L97) |
| `function.parameters.required?` | `string`[] | [packages/agent/src/unified/types/libTypes.ts:98](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L98) |
| `function.parameters.type` | `"object"` | [packages/agent/src/unified/types/libTypes.ts:96](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L96) |
| <a id="type"></a> `type` | `"function"` | [packages/agent/src/unified/types/libTypes.ts:91](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L91) |
