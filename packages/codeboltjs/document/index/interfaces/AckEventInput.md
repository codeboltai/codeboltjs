[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / AckEventInput

# Interface: AckEventInput

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:256](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L256)

Input for acknowledging an event

## Properties

### errorMessage?

> `optional` **errorMessage**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:262](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L262)

Error message if processing failed

***

### eventId

> **eventId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:258](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L258)

ID of the event to acknowledge

***

### success

> **success**: `boolean`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:260](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L260)

Whether processing was successful
