---
title: UnifiedStepInput
---

[**@codebolt/agent**](../../README)

***

# Interface: UnifiedStepInput

Defined in: [packages/agent/src/unified/types/types.ts:78](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L78)

Input for unified agent step processing

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="context"></a> `context?` | `Record`\<`string`, `any`\> | Processing context | [packages/agent/src/unified/types/types.ts:84](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L84) |
| <a id="messages"></a> `messages` | [`OpenAIMessage`](OpenAIMessage)[] | Processed messages | [packages/agent/src/unified/types/types.ts:80](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L80) |
| <a id="toolchoice"></a> `toolChoice?` | `"auto"` \| `"none"` \| `"required"` | Tool choice strategy | [packages/agent/src/unified/types/types.ts:86](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L86) |
| <a id="tools"></a> `tools` | [`OpenAITool`](OpenAITool)[] | Available tools | [packages/agent/src/unified/types/types.ts:82](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L82) |
