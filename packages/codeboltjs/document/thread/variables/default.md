[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [packages/codeboltjs/src/modules/thread.ts:46](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/thread.ts#L46)

Thread service for managing conversation threads.
This module provides a comprehensive API for thread management using thread-specific types.

## Type Declaration

### createAndStartThread()

> **createAndStartThread**: (`options`) => `Promise`\<\{ `activityId?`: `string`; `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"startThreadResponse"`; \}\>

Creates and immediately starts a new thread.

#### Parameters

##### options

The thread creation and start parameters

###### activeStepId?

`string`

###### agentId?

`string`

###### currentStep?

`any`

###### description?

`string`

###### environment?

`any`

###### groupId?

`string`

###### isGrouped?

`boolean`

###### isRemoteTask?

`boolean`

###### mentionedAgents?

`any`[]

###### mentionedMCPs?

`any`[]

###### messageId?

`string`

###### metadata?

`Record`\<`string`, `any`\>

###### processId?

`string`

###### remixPrompt?

`string`

###### remoteProvider?

\{ `id?`: `string`; `name?`: `string`; \}

###### remoteProvider.id?

`string`

###### remoteProvider.name?

`string`

###### selectedAgent?

`any`

###### selection?

\{ `selectedText?`: `string`; \}

###### selection.selectedText?

`string`

###### status?

`string`

###### stepId?

`string`

###### steps?

`any`[]

###### tags?

`string`[]

###### taskId?

`string`

###### title?

`string`

###### userMessage?

`string`

#### Returns

`Promise`\<\{ `activityId?`: `string`; `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"startThreadResponse"`; \}\>

A promise that resolves with the thread start response

### createThread()

> **createThread**: (`options`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `type?`: `"createThreadResponse"`; \}\>

Creates a new thread with comprehensive options.

#### Parameters

##### options

The thread creation parameters

###### activeStepId?

`string`

###### currentStep?

`any`

###### dependsOnTaskId?

`string`

###### dependsOnTaskName?

`string`

###### dueDate?

`Date`

###### environment?

`string`

###### environmentType?

`"local"` \| `"remote"`

###### executionType?

`"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`

###### groupId?

`string`

###### isGrouped?

`boolean`

###### isKanbanTask?

`boolean`

###### isRemoteTask?

`boolean`

###### mentionedAgents?

`any`[]

###### mentionedMCPs?

`any`[]

###### messageId?

`string`

###### name?

`string`

###### processId?

`string`

###### remixPrompt?

`string`

###### remoteProvider?

\{ `id?`: `string`; `name?`: `string`; \}

###### remoteProvider.id?

`string`

###### remoteProvider.name?

`string`

###### selectedAgent?

`any`

###### selection?

\{ `selectedText?`: `string`; \}

###### selection.selectedText?

`string`

###### startOption?

`"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`

###### stepId?

`string`

###### steps?

`object`[]

###### taskType?

`"scheduled"` \| `"interactive"`

###### threadId?

`string`

###### userMessage?

`string`

#### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `type?`: `"createThreadResponse"`; \}\>

A promise that resolves with the thread creation response

### createThreadInBackground()

> **createThreadInBackground**: (`options`) => `Promise`\<\{ `agentId?`: `string`; `error?`: `string`; `instanceId?`: `string`; `success?`: `boolean`; `threadId?`: `string`; `type?`: `"ThreadAgentStarted"`; \} \| \{ `agentId?`: `string`; `error?`: `string`; `success?`: `boolean`; `threadId?`: `string`; `type?`: `"ThreadAgentStartFailed"`; \}\>

Creates a thread in the background and resolves when the agent starts or fails.

#### Parameters

##### options

The thread creation and start parameters

###### activeStepId?

`string`

###### agentId?

`string`

###### currentStep?

`any`

###### description?

`string`

###### environment?

`any`

###### groupId?

`string`

###### isGrouped?

`boolean`

###### isRemoteTask?

`boolean`

###### mentionedAgents?

`any`[]

###### mentionedMCPs?

`any`[]

###### messageId?

`string`

###### metadata?

`Record`\<`string`, `any`\>

###### processId?

`string`

###### remixPrompt?

`string`

###### remoteProvider?

\{ `id?`: `string`; `name?`: `string`; \}

###### remoteProvider.id?

`string`

###### remoteProvider.name?

`string`

###### selectedAgent?

`any`

###### selection?

\{ `selectedText?`: `string`; \}

###### selection.selectedText?

`string`

###### status?

`string`

###### stepId?

`string`

###### steps?

`any`[]

###### tags?

`string`[]

###### taskId?

`string`

###### title?

`string`

###### userMessage?

`string`

#### Returns

`Promise`\<\{ `agentId?`: `string`; `error?`: `string`; `instanceId?`: `string`; `success?`: `boolean`; `threadId?`: `string`; `type?`: `"ThreadAgentStarted"`; \} \| \{ `agentId?`: `string`; `error?`: `string`; `success?`: `boolean`; `threadId?`: `string`; `type?`: `"ThreadAgentStartFailed"`; \}\>

A promise that resolves with ThreadAgentStarted or ThreadAgentStartFailed response

### deleteThread()

> **deleteThread**: (`threadId`) => `Promise`\<\{ `deleted?`: `boolean`; `error?`: `string`; `success?`: `boolean`; `threadId?`: `string`; `type?`: `"deleteThreadResponse"`; \}\>

Deletes a thread.

#### Parameters

##### threadId

`string`

The thread ID to delete

#### Returns

`Promise`\<\{ `deleted?`: `boolean`; `error?`: `string`; `success?`: `boolean`; `threadId?`: `string`; `type?`: `"deleteThreadResponse"`; \}\>

A promise that resolves with the thread deletion response

### getThreadDetail()

> **getThreadDetail**: (`options`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"getThreadResponse"`; \}\>

Retrieves detailed information about a specific thread.

#### Parameters

##### options

The thread detail options

###### includeMessages?

`boolean`

###### includeSteps?

`boolean`

###### taskId?

`string`

#### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"getThreadResponse"`; \}\>

A promise that resolves with the thread detail response

### getThreadFileChanges()

> **getThreadFileChanges**: (`threadId`) => `Promise`\<[`ThreadFileChangesResponse`](../interfaces/ThreadFileChangesResponse.md)\>

Retrieves file changes associated with a specific thread.

#### Parameters

##### threadId

`string`

The thread ID

#### Returns

`Promise`\<[`ThreadFileChangesResponse`](../interfaces/ThreadFileChangesResponse.md)\>

A promise that resolves with the file changes

### getThreadFileChangesSummary()

> **getThreadFileChangesSummary**: (`threadId`) => `Promise`\<[`ThreadFileChangesSummaryResponse`](../interfaces/ThreadFileChangesSummaryResponse.md)\>

Retrieves file changes summary for ChangesSummaryPanel.
Returns data in the format: { title, changes, files }

#### Parameters

##### threadId

`string`

The thread ID

#### Returns

`Promise`\<[`ThreadFileChangesSummaryResponse`](../interfaces/ThreadFileChangesSummaryResponse.md)\>

A promise that resolves with the file changes summary

### getThreadList()

> **getThreadList**: (`options`) => `Promise`\<\{ `agentId?`: `string`; `error?`: `string`; `limit?`: `number`; `offset?`: `number`; `status?`: `string`; `success?`: `boolean`; `taskId?`: `string`; `threads?`: `object`[]; `totalCount?`: `number`; `type?`: `"listThreadsResponse"`; \}\>

Retrieves a list of threads with optional filtering.

#### Parameters

##### options

Optional filters for threads

###### limit?

`number`

###### offset?

`number`

###### startedByUser?

`string`

###### status?

`"pending"` \| `"completed"` \| `"processing"` \| `"all"`

###### threadId?

`string`

#### Returns

`Promise`\<\{ `agentId?`: `string`; `error?`: `string`; `limit?`: `number`; `offset?`: `number`; `status?`: `string`; `success?`: `boolean`; `taskId?`: `string`; `threads?`: `object`[]; `totalCount?`: `number`; `type?`: `"listThreadsResponse"`; \}\>

A promise that resolves with the thread list response

### getThreadMessages()

> **getThreadMessages**: (`options`) => `Promise`\<\{ `error?`: `string`; `limit?`: `number`; `messages?`: `object`[]; `offset?`: `number`; `success?`: `boolean`; `threadId?`: `string`; `totalCount?`: `number`; `type?`: `"getThreadMessagesResponse"`; \}\>

Retrieves messages for a specific thread.

#### Parameters

##### options

The thread messages options

###### limit?

`number`

###### messageType?

`"info"` \| `"error"` \| `"warning"` \| `"success"` \| `"feedback"` \| `"steering"` \| `"instruction"`

###### offset?

`number`

###### stepId?

`string`

###### taskId?

`string`

#### Returns

`Promise`\<\{ `error?`: `string`; `limit?`: `number`; `messages?`: `object`[]; `offset?`: `number`; `success?`: `boolean`; `threadId?`: `string`; `totalCount?`: `number`; `type?`: `"getThreadMessagesResponse"`; \}\>

A promise that resolves with the thread messages response

### startThread()

> **startThread**: (`threadId`) => `Promise`\<\{ `activityId?`: `string`; `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"startThreadResponse"`; \}\>

Starts a thread.

#### Parameters

##### threadId

`string`

The thread ID to start

#### Returns

`Promise`\<\{ `activityId?`: `string`; `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"startThreadResponse"`; \}\>

A promise that resolves with the thread start response

### updateThread()

> **updateThread**: (`threadId`, `updates`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"updateThreadResponse"`; \}\>

Updates an existing thread.

#### Parameters

##### threadId

`string`

The thread ID to update

##### updates

The thread update parameters

###### activeStepId?

`string`

###### completed?

`boolean`

###### currentStep?

`any`

###### dependsOnTaskId?

`string`

###### dependsOnTaskName?

`string`

###### dueDate?

`Date`

###### environment?

`string`

###### environmentType?

`"local"` \| `"remote"`

###### executionType?

`"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`

###### groupId?

`string`

###### isGrouped?

`boolean`

###### isKanbanTask?

`boolean`

###### isRemoteTask?

`boolean`

###### mentionedAgents?

`any`[]

###### mentionedMCPs?

`any`[]

###### messageId?

`string`

###### name?

`string`

###### processId?

`string`

###### remixPrompt?

`string`

###### remoteProvider?

\{ `id?`: `string`; `name?`: `string`; \}

###### remoteProvider.id?

`string`

###### remoteProvider.name?

`string`

###### selectedAgent?

`any`

###### selection?

\{ `selectedText?`: `string`; \}

###### selection.selectedText?

`string`

###### startOption?

`"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`

###### stepId?

`string`

###### steps?

`object`[]

###### taskType?

`"scheduled"` \| `"interactive"`

###### userMessage?

`string`

#### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"updateThreadResponse"`; \}\>

A promise that resolves with the thread update response

### updateThreadStatus()

> **updateThreadStatus**: (`threadId`, `status`) => `Promise`\<\{ `error?`: `string`; `status?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"updateThreadStatusResponse"`; \}\>

Updates the status of a thread.

#### Parameters

##### threadId

`string`

The thread ID

##### status

`string`

The new status

#### Returns

`Promise`\<\{ `error?`: `string`; `status?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"updateThreadStatusResponse"`; \}\>

A promise that resolves with the thread status update response
