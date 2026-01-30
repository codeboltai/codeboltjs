---
title: TaskUpdatePayload
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: TaskUpdatePayload

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:112](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L112)

Payload for task update notifications

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="action"></a> `action` | `"completed"` \| `"failed"` \| `"cancelled"` \| `"created"` \| `"updated"` | Action that occurred | [packages/codeboltjs/src/types/agentEventQueue.ts:117](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L117) |
| <a id="errormessage"></a> `errorMessage?` | `string` | Error message if failed | [packages/codeboltjs/src/types/agentEventQueue.ts:125](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L125) |
| <a id="progress"></a> `progress?` | `number` | Progress percentage (0-100) | [packages/codeboltjs/src/types/agentEventQueue.ts:123](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L123) |
| <a id="status"></a> `status?` | `string` | Current status of the task | [packages/codeboltjs/src/types/agentEventQueue.ts:121](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L121) |
| <a id="taskid"></a> `taskId` | `string` | ID of the task | [packages/codeboltjs/src/types/agentEventQueue.ts:115](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L115) |
| <a id="tasktitle"></a> `taskTitle?` | `string` | Title of the task | [packages/codeboltjs/src/types/agentEventQueue.ts:119](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L119) |
| <a id="type"></a> `type` | `"taskUpdate"` | - | [packages/codeboltjs/src/types/agentEventQueue.ts:113](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L113) |
