[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / AgentMessagePayload

# Interface: AgentMessagePayload

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:61](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L61)

Payload for inter-agent messages

## Properties

### content

> **content**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:64](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L64)

Message content

***

### messageType?

> `optional` **messageType**: `"text"` \| `"json"` \| `"command"`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:66](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L66)

Type of message content

***

### replyTo?

> `optional` **replyTo**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:68](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L68)

Reference to a previous eventId for replies

***

### type

> **type**: `"agentMessage"`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:62](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L62)
