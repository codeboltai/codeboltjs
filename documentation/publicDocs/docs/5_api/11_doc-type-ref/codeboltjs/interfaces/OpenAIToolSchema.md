---
title: OpenAIToolSchema
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: OpenAIToolSchema

Defined in: [packages/codeboltjs/src/tools/types.ts:8](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/tools/types.ts#L8)

OpenAI tool schema format - primary format for LLM tool calls

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="function"></a> `function` | \{ `description`: `string`; `name`: `string`; `parameters`: \{ `additionalProperties?`: `boolean`; `properties`: `Record`\<`string`, `any`\>; `required?`: `string`[]; `type`: `"object"`; \}; \} | [packages/codeboltjs/src/tools/types.ts:10](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/tools/types.ts#L10) |
| `function.description` | `string` | [packages/codeboltjs/src/tools/types.ts:12](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/tools/types.ts#L12) |
| `function.name` | `string` | [packages/codeboltjs/src/tools/types.ts:11](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/tools/types.ts#L11) |
| `function.parameters` | \{ `additionalProperties?`: `boolean`; `properties`: `Record`\<`string`, `any`\>; `required?`: `string`[]; `type`: `"object"`; \} | [packages/codeboltjs/src/tools/types.ts:13](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/tools/types.ts#L13) |
| `function.parameters.additionalProperties?` | `boolean` | [packages/codeboltjs/src/tools/types.ts:17](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/tools/types.ts#L17) |
| `function.parameters.properties` | `Record`\<`string`, `any`\> | [packages/codeboltjs/src/tools/types.ts:15](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/tools/types.ts#L15) |
| `function.parameters.required?` | `string`[] | [packages/codeboltjs/src/tools/types.ts:16](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/tools/types.ts#L16) |
| `function.parameters.type` | `"object"` | [packages/codeboltjs/src/tools/types.ts:14](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/tools/types.ts#L14) |
| <a id="type"></a> `type` | `"function"` | [packages/codeboltjs/src/tools/types.ts:9](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/tools/types.ts#L9) |
