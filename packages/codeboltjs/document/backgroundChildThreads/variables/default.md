[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [packages/codeboltjs/src/modules/backgroundChildThreads.ts:71](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/backgroundChildThreads.ts#L71)

Background Child Threads module for tracking and managing background agent threads.
This module provides APIs for tracking running background agents and their completion.

## Type Declaration

### addRunningAgent()

> **addRunningAgent**: (`threadId`, `data`, `groupId?`) => `void`

Adds a running background agent to tracking.

#### Parameters

##### threadId

`string`

The thread ID

##### data

[`BackgroundAgentData`](../interfaces/BackgroundAgentData.md)

The agent data

##### groupId?

`string`

Optional group ID

#### Returns

`void`

### checkForBackgroundAgentCompletion()

> **checkForBackgroundAgentCompletion**: () => `null` \| [`BackgroundAgentCompletion`](../interfaces/BackgroundAgentCompletion.md)[]

Checks if any background agent has completed.

#### Returns

`null` \| [`BackgroundAgentCompletion`](../interfaces/BackgroundAgentCompletion.md)[]

The completion data if available, or null

### checkForBackgroundGroupedAgentCompletion()

> **checkForBackgroundGroupedAgentCompletion**: () => `null` \| [`BackgroundAgentCompletion`](../interfaces/BackgroundAgentCompletion.md)

Checks if any grouped background agent has completed.

#### Returns

`null` \| [`BackgroundAgentCompletion`](../interfaces/BackgroundAgentCompletion.md)

The completion data if available, or null

### getRunningAgentCount()

> **getRunningAgentCount**: () => `number`

Gets the number of currently running background agents.

#### Returns

`number`

The count

### onBackgroundAgentCompletion()

> **onBackgroundAgentCompletion**: () => `Promise`\<`null` \| [`BackgroundAgentCompletion`](../interfaces/BackgroundAgentCompletion.md)[]\>

Waits for background agent completion.

#### Returns

`Promise`\<`null` \| [`BackgroundAgentCompletion`](../interfaces/BackgroundAgentCompletion.md)[]\>

A promise that resolves with the completion data

### onBackgroundGroupedAgentCompletion()

> **onBackgroundGroupedAgentCompletion**: () => `Promise`\<`null` \| [`BackgroundAgentCompletion`](../interfaces/BackgroundAgentCompletion.md)\>

Waits for grouped background agent completion.

#### Returns

`Promise`\<`null` \| [`BackgroundAgentCompletion`](../interfaces/BackgroundAgentCompletion.md)\>

A promise that resolves with the completion data

### waitForAnyExternalEvent()

> **waitForAnyExternalEvent**: () => `Promise`\<[`BackgroundExternalEvent`](../interfaces/BackgroundExternalEvent.md)\>

Waits for any external event (background agent completion, grouped agent completion, or agent event).
Returns the first event that occurs.

#### Returns

`Promise`\<[`BackgroundExternalEvent`](../interfaces/BackgroundExternalEvent.md)\>

A promise that resolves with the event type and data
