---
title: UnifiedMessageOutput
---

[**@codebolt/agent**](../../README)

***

# Interface: UnifiedMessageOutput

Defined in: [packages/agent/src/unified/types/types.ts:64](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L64)

Output from unified message processing

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="context"></a> `context` | `Record`\<`string`, `any`\> | Updated context | [packages/agent/src/unified/types/types.ts:70](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L70) |
| <a id="messages"></a> `messages` | [`OpenAIMessage`](OpenAIMessage)[] | Processed messages ready for LLM | [packages/agent/src/unified/types/types.ts:66](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L66) |
| <a id="toolchoice"></a> `toolChoice` | `"auto"` \| `"none"` \| `"required"` | Tool choice strategy | [packages/agent/src/unified/types/types.ts:72](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L72) |
| <a id="tools"></a> `tools` | [`OpenAITool`](OpenAITool)[] | Available tools | [packages/agent/src/unified/types/types.ts:68](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L68) |
