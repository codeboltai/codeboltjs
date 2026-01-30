---
title: AgentEventPayload
---

[**@codebolt/codeboltjs**](../README)

***

# Type Alias: AgentEventPayload

```ts
type AgentEventPayload = 
  | AgentMessagePayload
  | CalendarUpdatePayload
  | SystemNotificationPayload
  | TaskUpdatePayload
  | CustomEventPayload;
```

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:142](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L142)

Union type for all event payloads
