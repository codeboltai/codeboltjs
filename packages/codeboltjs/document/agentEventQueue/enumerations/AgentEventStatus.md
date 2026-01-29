[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / AgentEventStatus

# Enumeration: AgentEventStatus

Defined in: [types/agentEventQueue.ts:29](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L29)

Status of an event in the queue

## Enumeration Members

### ACKNOWLEDGED

> **ACKNOWLEDGED**: `"acked"`

Defined in: [types/agentEventQueue.ts:35](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L35)

Acknowledgement received, can be archived

***

### DELIVERED

> **DELIVERED**: `"delivered"`

Defined in: [types/agentEventQueue.ts:33](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L33)

Sent via WebSocket, awaiting acknowledgement

***

### EXPIRED

> **EXPIRED**: `"expired"`

Defined in: [types/agentEventQueue.ts:41](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L41)

Event expired before delivery

***

### FAILED

> **FAILED**: `"failed"`

Defined in: [types/agentEventQueue.ts:39](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L39)

Delivery failed

***

### PENDING

> **PENDING**: `"pending"`

Defined in: [types/agentEventQueue.ts:31](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L31)

In queue, awaiting delivery

***

### PULLED

> **PULLED**: `"pulled"`

Defined in: [types/agentEventQueue.ts:37](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L37)

Retrieved via pull mode (auto-removed)
