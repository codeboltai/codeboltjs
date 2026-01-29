---
title: AgentEventPayload
---

[**@codebolt/codeboltjs**](../index)

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

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:142](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L142)

Union type for all event payloads
