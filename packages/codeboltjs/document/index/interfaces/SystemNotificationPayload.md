[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / SystemNotificationPayload

# Interface: SystemNotificationPayload

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:95](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L95)

Payload for system notifications

## Properties

### actionRequired?

> `optional` **actionRequired**: `boolean`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:104](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L104)

Whether the agent needs to take action

***

### actionType?

> `optional` **actionType**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:106](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L106)

Action to take if actionRequired is true

***

### message

> **message**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:102](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L102)

Notification message

***

### notificationType

> **notificationType**: `"info"` \| `"error"` \| `"warning"` \| `"success"`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:98](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L98)

Type of notification

***

### title

> **title**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:100](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L100)

Notification title

***

### type

> **type**: `"systemNotification"`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:96](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L96)
