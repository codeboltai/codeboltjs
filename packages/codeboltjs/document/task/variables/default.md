[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [packages/codeboltjs/src/modules/task.ts:33](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/task.ts#L33)

Enhanced task service with comprehensive task and step management.
This module provides a modern API for task management based on the new task service schemas.

## Type Declaration

### assignAgentToTask()

> **assignAgentToTask**: (`taskId`, `agentId`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `type?`: `"updateTaskResponse"`; \}\>

Assigns an agent to a task.

#### Parameters

##### taskId

`string`

The task ID

##### agentId

`string`

The agent ID to assign

#### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `type?`: `"updateTaskResponse"`; \}\>

### createTask()

> **createTask**: (`options`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `type?`: `"createTaskResponse"`; \}\>

Creates a new task.

#### Parameters

##### options

The task creation parameters

###### assignedTo?

`string`

###### controlFiles?

`any`[]

###### dependsOnTaskId?

`string`

###### dependsOnTaskName?

`string`

###### description?

`string`

###### dueDate?

`Date`

###### environment?

`string`

###### environmentType?

`"local"` \| `"remote"`

###### executionType?

`"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`

###### flowData?

`any`

###### groupId?

`string`

###### isKanbanTask?

`boolean`

###### isRemoteTask?

`boolean`

###### links?

`string`[]

###### mentionedAgents?

`any`[]

###### mentionedDocs?

`any`[]

###### mentionedFiles?

`string`[]

###### mentionedFolders?

`string`[]

###### mentionedMCPs?

`string`[]

###### mentionedMultiFile?

`string`[]

###### name?

`string`

###### order?

`number`

###### parentTaskId?

`string`

###### priority?

`"low"` \| `"medium"` \| `"high"` \| `"urgent"`

###### projectId?

`number`

###### projectName?

`string`

###### projectPath?

`string`

###### selectedAgent?

`any`

###### selection?

`any`

###### startOption?

`"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`

###### status?

`string`

###### steps?

`object`[]

###### tags?

`string`[]

###### taskType?

`"scheduled"` \| `"interactive"`

###### threadId?

`string`

###### uploadedImages?

`string`[]

#### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `type?`: `"createTaskResponse"`; \}\>

### deleteTask()

> **deleteTask**: (`taskId`) => `Promise`\<\{ `deleted?`: `boolean`; `error?`: `string`; `success?`: `boolean`; `taskId?`: `string`; `type?`: `"deleteTaskResponse"`; \}\>

Deletes a task.

#### Parameters

##### taskId

`string`

The task ID to delete

#### Returns

`Promise`\<\{ `deleted?`: `boolean`; `error?`: `string`; `success?`: `boolean`; `taskId?`: `string`; `type?`: `"deleteTaskResponse"`; \}\>

### executeTaskWithAgent()

> **executeTaskWithAgent**: (`taskId`, `agentId`) => `Promise`\<\{ `activityId?`: `string`; `agentId?`: `string`; `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `taskId?`: `string`; `type?`: `"startTaskWithAgentResponse"`; \}\>

Executes a task with a specific agent.
Assigns the agent and then starts the task.

#### Parameters

##### taskId

`string`

The task ID

##### agentId

`string`

The agent ID

#### Returns

`Promise`\<\{ `activityId?`: `string`; `agentId?`: `string`; `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `taskId?`: `string`; `type?`: `"startTaskWithAgentResponse"`; \}\>

### getTaskDetail()

> **getTaskDetail**: (`options`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `taskId?`: `string`; `type?`: `"getTaskResponse"`; \}\>

Retrieves detailed information about a specific task.

#### Parameters

##### options

The task detail options

###### includeMessages?

`boolean`

###### includeSteps?

`boolean`

###### taskId?

`string`

#### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `taskId?`: `string`; `type?`: `"getTaskResponse"`; \}\>

### getTaskList()

> **getTaskList**: (`options`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `tasks?`: `object`[]; `totalCount?`: `number`; `type?`: `"listTasksResponse"`; \}\>

Retrieves a list of tasks.

#### Parameters

##### options

Optional filters for tasks

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

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `tasks?`: `object`[]; `totalCount?`: `number`; `type?`: `"listTasksResponse"`; \}\>

### getTaskStatus()

> **getTaskStatus**: (`taskId`) => `Promise`\<`undefined` \| `string`\>

Gets the status of a task.

#### Parameters

##### taskId

`string`

The task ID

#### Returns

`Promise`\<`undefined` \| `string`\>

The task status

### getTaskSummary()

> **getTaskSummary**: (`taskId`) => `Promise`\<`undefined` \| `string`\>

Gets the summary (description) of a task.

#### Parameters

##### taskId

`string`

The task ID

#### Returns

`Promise`\<`undefined` \| `string`\>

The task description

### updateTask()

> **updateTask**: (`taskId`, `updates`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `type?`: `"updateTaskResponse"`; \}\>

Updates an existing task.

#### Parameters

##### taskId

`string`

The task ID to update

##### updates

The task update parameters

###### assignedTo?

`string`

###### completed?

`boolean`

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

###### isKanbanTask?

`boolean`

###### isRemoteTask?

`boolean`

###### name?

`string`

###### selectedAgent?

`any`

###### startOption?

`"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`

###### steps?

`object`[]

###### taskType?

`"scheduled"` \| `"interactive"`

#### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `type?`: `"updateTaskResponse"`; \}\>
