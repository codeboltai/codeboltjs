---
title: UnifiedAgentEvent
---

[**@codebolt/agent**](../../README)

***

# Interface: UnifiedAgentEvent

Defined in: [packages/agent/src/unified/types/types.ts:261](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L261)

Unified Agent Framework

This module provides a unified approach to agent development that combines:
- Message modification using the processor pattern
- Agent step execution with LLM integration
- Response execution with tool handling and conversation management

The framework is designed to be modular, extensible, and easy to use.

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="context"></a> `context?` | `Record`\<`string`, `any`\> | [packages/agent/src/unified/types/types.ts:265](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L265) |
| <a id="data"></a> `data?` | `any` | [packages/agent/src/unified/types/types.ts:263](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L263) |
| <a id="timestamp"></a> `timestamp` | `string` | [packages/agent/src/unified/types/types.ts:264](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L264) |
| <a id="type"></a> `type` | [`UnifiedAgentEventType`](../type-aliases/UnifiedAgentEventType) | [packages/agent/src/unified/types/types.ts:262](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L262) |
