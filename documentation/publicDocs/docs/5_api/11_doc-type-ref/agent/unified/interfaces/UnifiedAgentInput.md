---
title: UnifiedAgentInput
---

[**@codebolt/agent**](../../README)

***

# Interface: UnifiedAgentInput

Defined in: [packages/agent/src/unified/types/types.ts:136](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L136)

Complete agent execution input

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="context"></a> `context?` | `Record`\<`string`, `any`\> | Processing context | [packages/agent/src/unified/types/types.ts:142](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L142) |
| <a id="conversationhistory"></a> `conversationHistory?` | [`OpenAIMessage`](OpenAIMessage)[] | Previous conversation history | [packages/agent/src/unified/types/types.ts:144](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L144) |
| <a id="maxiterations"></a> `maxIterations?` | `number` | Maximum iterations for this execution | [packages/agent/src/unified/types/types.ts:146](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L146) |
| <a id="tools"></a> `tools?` | [`OpenAITool`](OpenAITool)[] | Available tools | [packages/agent/src/unified/types/types.ts:140](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L140) |
| <a id="usermessage"></a> `userMessage` | `any` | User message or request | [packages/agent/src/unified/types/types.ts:138](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L138) |
