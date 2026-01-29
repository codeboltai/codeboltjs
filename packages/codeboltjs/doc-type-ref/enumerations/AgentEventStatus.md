---
title: AgentEventStatus
---

[**@codebolt/codeboltjs**](../index)

***

# Enumeration: AgentEventStatus

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:29](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L29)

Status of an event in the queue

## Enumeration Members

| Enumeration Member | Value | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="acknowledged"></a> `ACKNOWLEDGED` | `"acked"` | Acknowledgement received, can be archived | [packages/codeboltjs/src/types/agentEventQueue.ts:35](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L35) |
| <a id="delivered"></a> `DELIVERED` | `"delivered"` | Sent via WebSocket, awaiting acknowledgement | [packages/codeboltjs/src/types/agentEventQueue.ts:33](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L33) |
| <a id="expired"></a> `EXPIRED` | `"expired"` | Event expired before delivery | [packages/codeboltjs/src/types/agentEventQueue.ts:41](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L41) |
| <a id="failed"></a> `FAILED` | `"failed"` | Delivery failed | [packages/codeboltjs/src/types/agentEventQueue.ts:39](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L39) |
| <a id="pending"></a> `PENDING` | `"pending"` | In queue, awaiting delivery | [packages/codeboltjs/src/types/agentEventQueue.ts:31](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L31) |
| <a id="pulled"></a> `PULLED` | `"pulled"` | Retrieved via pull mode (auto-removed) | [packages/codeboltjs/src/types/agentEventQueue.ts:37](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L37) |
