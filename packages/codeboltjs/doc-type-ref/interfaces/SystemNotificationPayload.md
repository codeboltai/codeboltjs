---
title: SystemNotificationPayload
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: SystemNotificationPayload

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:95](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L95)

Payload for system notifications

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="actionrequired"></a> `actionRequired?` | `boolean` | Whether the agent needs to take action | [packages/codeboltjs/src/types/agentEventQueue.ts:104](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L104) |
| <a id="actiontype"></a> `actionType?` | `string` | Action to take if actionRequired is true | [packages/codeboltjs/src/types/agentEventQueue.ts:106](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L106) |
| <a id="message"></a> `message` | `string` | Notification message | [packages/codeboltjs/src/types/agentEventQueue.ts:102](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L102) |
| <a id="notificationtype"></a> `notificationType` | `"info"` \| `"error"` \| `"warning"` \| `"success"` | Type of notification | [packages/codeboltjs/src/types/agentEventQueue.ts:98](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L98) |
| <a id="title"></a> `title` | `string` | Notification title | [packages/codeboltjs/src/types/agentEventQueue.ts:100](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L100) |
| <a id="type"></a> `type` | `"systemNotification"` | - | [packages/codeboltjs/src/types/agentEventQueue.ts:96](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L96) |
