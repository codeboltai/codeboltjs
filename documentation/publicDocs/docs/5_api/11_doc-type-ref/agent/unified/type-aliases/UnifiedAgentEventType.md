---
title: UnifiedAgentEventType
---

[**@codebolt/agent**](../../README)

***

# Type Alias: UnifiedAgentEventType

```ts
type UnifiedAgentEventType = 
  | "message_processed"
  | "step_started"
  | "step_completed"
  | "tool_call_detected"
  | "tool_execution_started"
  | "tool_execution_completed"
  | "response_generated"
  | "conversation_summarized"
  | "agent_completed"
  | "agent_error"
  | "iteration_started"
  | "iteration_completed";
```

Defined in: [packages/agent/src/unified/types/types.ts:247](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L247)

Main unified agent interface
