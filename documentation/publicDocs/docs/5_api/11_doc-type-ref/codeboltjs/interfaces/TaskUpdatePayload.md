---
title: TaskUpdatePayload
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: TaskUpdatePayload

Defined in: packages/codeboltjs/src/types/agentEventQueue.ts:112

Payload for task update notifications

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="action"></a> `action` | `"completed"` \| `"failed"` \| `"cancelled"` \| `"created"` \| `"updated"` | Action that occurred | [packages/codeboltjs/src/types/agentEventQueue.ts:117](packages/codeboltjs/src/types/agentEventQueue.ts#L117) |
| <a id="errormessage"></a> `errorMessage?` | `string` | Error message if failed | [packages/codeboltjs/src/types/agentEventQueue.ts:125](packages/codeboltjs/src/types/agentEventQueue.ts#L125) |
| <a id="progress"></a> `progress?` | `number` | Progress percentage (0-100) | [packages/codeboltjs/src/types/agentEventQueue.ts:123](packages/codeboltjs/src/types/agentEventQueue.ts#L123) |
| <a id="status"></a> `status?` | `string` | Current status of the task | [packages/codeboltjs/src/types/agentEventQueue.ts:121](packages/codeboltjs/src/types/agentEventQueue.ts#L121) |
| <a id="taskid"></a> `taskId` | `string` | ID of the task | [packages/codeboltjs/src/types/agentEventQueue.ts:115](packages/codeboltjs/src/types/agentEventQueue.ts#L115) |
| <a id="tasktitle"></a> `taskTitle?` | `string` | Title of the task | [packages/codeboltjs/src/types/agentEventQueue.ts:119](packages/codeboltjs/src/types/agentEventQueue.ts#L119) |
| <a id="type"></a> `type` | `"taskUpdate"` | - | [packages/codeboltjs/src/types/agentEventQueue.ts:113](packages/codeboltjs/src/types/agentEventQueue.ts#L113) |
