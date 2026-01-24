# codebolt.thread - Thread Management

Thread service for managing conversation threads. This module provides a comprehensive API for creating, updating, retrieving, and managing threads, including thread status, messages, and file changes.

## Response Types

All thread responses include a `type` field indicating the specific response type, along with common fields:

```typescript
{
  type: string;       // Response type identifier
  success: boolean;   // Whether the operation succeeded
  error?: string;     // Error details if operation failed
}
```

### ThreadResponse

Represents a complete thread object returned by most operations:

```typescript
{
  id: number;                        // Database ID
  threadId: string;                  // Unique thread identifier
  projectId?: number;                // Associated project ID
  projectPath?: string;              // Project file path
  projectName?: string;              // Project name
  name: string;                      // Thread name
  description?: string;              // Thread description
  status: 'created' | 'planned' | 'pending' | 'in_progress' | 'waiting_user' | 'review' | 'completed' | 'cancelled' | 'failed' | 'active';
  completed: boolean;                // Whether thread is completed
  isRemoteTask: boolean;             // Whether this is a remote task
  environment?: Record<string, any>; // Environment configuration
  isKanbanTask: boolean;             // Whether thread appears in Kanban
  threadType: 'scheduled' | 'interactive';
  executionType: 'scheduled' | 'immediate' | 'manual' | 'conditional';
  environmentType: 'local' | 'remote';
  groupId: string;                   // Thread group identifier
  startOption: 'immediately' | 'manual' | 'based_on_group' | 'ontaskfinish';
  dependsOnThreadId?: string;       // ID of dependent thread
  dependsOnThreadName?: string;      // Name of dependent thread
  assignedTo?: string;               // Agent assigned to thread
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress?: {
    totalSteps: number;
    completedSteps: number;
    percentage: number;
  };
  activeStepId?: string;             // Currently active step
  flowData?: any;                    // Flow configuration data
  tags?: string[];                   // Thread tags
  errorMessage?: string;             // Error message if failed
  cancellationReason?: string;       // Reason for cancellation
  createdAt: Date;
  updatedAt: Date;
  statusUpdatedAt?: Date;
  completedAt?: Date;
  stepActivatedAt?: Date;
  steps?: ThreadStepResponse[];      // Thread steps
  messages?: ThreadMessageResponse[]; // Thread messages
  attachedMemories?: ThreadMemoryResponse[]; // Attached memories
}
```

### ThreadMessageResponse

Represents a message within a thread:

```typescript
{
  id: number;                              // Database ID
  messageId: string;                       // Unique message identifier
  threadId: string;                        // Parent thread ID
  stepId?: string;                         // Associated step ID
  message: string;                         // Message content
  messageType: 'info' | 'error' | 'warning' | 'success' | 'steering' | 'instruction' | 'feedback';
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  userId?: string;                         // User who sent the message
  agentId?: string;                        // Agent who sent the message
}
```

### ThreadStepResponse

Represents a step within a thread:

```typescript
{
  id: number;                              // Database ID
  stepId: string;                          // Unique step identifier
  type: string;                            // Step type
  userMessage: string;                     // User message for step
  value?: string;                          // Step value
  metaData: any;                          // Step metadata
  isMainTask: boolean;                     // Whether this is the main task
  position?: { x: number; y: number };     // Visual position
  condition?: string;                      // Step condition
  agentId?: string;                        // Agent assigned to step
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped' | 'cancelled';
  flowData?: any;                          // Flow data
  errorMessage?: string;                   // Error message if failed
  result?: any;                            // Step result
  threadId: string;                        // Parent thread ID
  createdAt: Date;
  updatedAt: Date;
  activatedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}
```

## Methods

### `createThread(options)`

Creates a new thread with comprehensive configuration options.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options | object | Yes | Thread creation parameters |
| options.threadId | string | Yes | Unique thread identifier |
| options.name | string | Yes | Thread name |
| options.dueDate | Date \| null | No | Thread due date |
| options.isRemoteTask | boolean | No | Whether this is a remote task |
| options.environment | string \| null | No | Environment configuration |
| options.isKanbanTask | boolean | No | Whether thread appears in Kanban |
| options.taskType | 'scheduled' \| 'interactive' | No | Thread type |
| options.executionType | 'scheduled' \| 'immediate' \| 'manual' \| 'conditional' | No | Execution type |
| options.environmentType | 'local' \| 'remote' | No | Environment type |
| options.groupId | string | No | Thread group identifier |
| options.isGrouped | boolean | No | Whether thread is grouped |
| options.startOption | 'immediately' \| 'manual' \| 'based_on_group' \| 'ontaskfinish' | No | When to start |
| options.dependsOnTaskId | string | No | ID of dependent task |
| options.dependsOnTaskName | string | No | Name of dependent task |
| options.steps | Step[] | No | Thread steps |
| options.userMessage | string | No | User message |
| options.selectedAgent | any | No | Selected agent |
| options.mentionedAgents | any[] | No | Mentioned agents |
| options.mentionedMCPs | any[] | No | Mentioned MCPs |
| options.remixPrompt | string | No | Remix prompt |
| options.remoteProvider | { id: string; name?: string } | No | Remote provider config |
| options.activeStepId | string | No | Active step ID |
| options.currentStep | any | No | Current step data |
| options.messageId | string | No | Message ID |
| options.selection | { selectedText?: string } | No | Text selection |
| options.processId | string | No | Process ID |
| options.stepId | string | No | Step ID |

**Response:**
```typescript
{
  type: 'createThreadResponse';
  success: boolean;
  thread?: ThreadResponse;  // Created thread (null on failure)
  error?: string;
}
```

```typescript
const result = await codebolt.thread.createThread({
  threadId: 'thread-123',
  name: 'Feature Implementation',
  userMessage: 'Implement the new feature',
  selectedAgent: { id: 'agent-1' }
});
if (result.success && result.thread) {
  console.log(`Created thread: ${result.thread.name}`);
}
```

---

### `createAndStartThread(options)`

Creates and immediately starts a new thread.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options | object | Yes | Thread creation and start parameters |
| options.title | string | No | Thread title |
| options.description | string | No | Thread description |
| options.taskId | string | No | Task identifier |
| options.agentId | string | No | Agent identifier |
| options.status | string | No | Initial status |
| options.tags | string[] | No | Thread tags |
| options.metadata | Record<string, any> | No | Thread metadata |
| options.userMessage | string | No | User message |
| options.selectedAgent | any | No | Selected agent |
| options.mentionedAgents | any[] | No | Mentioned agents |
| options.mentionedMCPs | any[] | No | Mentioned MCPs |
| options.remixPrompt | string | No | Remix prompt |
| options.isRemoteTask | boolean | No | Whether this is a remote task |
| options.remoteProvider | { id: string; name?: string } | No | Remote provider config |
| options.activeStepId | string | No | Active step ID |
| options.currentStep | any | No | Current step data |
| options.steps | any[] | No | Thread steps |
| options.messageId | string | No | Message ID |
| options.selection | { selectedText?: string } | No | Text selection |
| options.environment | any | No | Environment configuration |
| options.groupId | string | No | Thread group identifier |
| options.processId | string | No | Process ID |
| options.stepId | string | No | Step ID |

**Response:**
```typescript
{
  type: 'startThreadResponse';
  success: boolean;
  thread?: ThreadResponse;  // Started thread (null on failure)
  threadId: string;         // Thread ID
  activityId?: string;      // Activity ID
  error?: string;
}
```

```typescript
const result = await codebolt.thread.createAndStartThread({
  title: 'Quick Task',
  userMessage: 'Complete this task immediately',
  agentId: 'agent-1'
});
if (result.success && result.thread) {
  console.log(`Started thread: ${result.threadId}`);
}
```

---

### `createThreadInBackground(options)`

Creates a thread in the background and resolves when the agent starts or fails. Automatically adds the thread to the appropriate map.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options | object | Yes | Thread creation parameters (same as createAndStartThread) |

**Response:**
```typescript
// Agent started successfully:
{
  type: 'ThreadAgentStarted';
  success: boolean;
  threadId: string;
  agentId: string;
  instanceId?: string;
  error?: string;
}

// Agent failed to start:
{
  type: 'ThreadAgentStartFailed';
  success: boolean;
  threadId: string;
  agentId?: string;
  error: string;
}
```

```typescript
const result = await codebolt.thread.createThreadInBackground({
  title: 'Background Task',
  userMessage: 'Run in background',
  groupId: 'group-1'
});
if (result.type === 'ThreadAgentStarted') {
  console.log(`Agent started: ${result.agentId}`);
} else {
  console.error(`Agent failed: ${result.error}`);
}
```

---

### `getThreadList(options?)`

Retrieves a list of threads with optional filtering.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options | object | No | Filter options (default: {}) |
| options.threadId | string | No | Filter by specific thread ID |
| options.status | 'completed' \| 'pending' \| 'processing' \| 'all' | No | Filter by status |
| options.startedByUser | string | No | Filter by user who started |
| options.limit | number | No | Maximum results to return |
| options.offset | number | No | Results offset for pagination |

**Response:**
```typescript
{
  type: 'listThreadsResponse';
  success: boolean;
  threads: ThreadResponse[];   // Array of threads
  totalCount: number;          // Total matching threads
  limit?: number;              // Applied limit
  offset?: number;             // Applied offset
  status?: string;             // Applied status filter
  taskId?: string;             // Applied task filter
  agentId?: string;            // Applied agent filter
  error?: string;
}
```

```typescript
const result = await codebolt.thread.getThreadList({
  status: 'pending',
  limit: 10
});
if (result.success) {
  console.log(`Found ${result.totalCount} threads`);
  result.threads.forEach(thread => {
    console.log(`- ${thread.name}: ${thread.status}`);
  });
}
```

---

### `getThreadDetail(options)`

Retrieves detailed information about a specific thread.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options | object | Yes | Thread detail options |
| options.taskId | string | Yes | Thread ID to retrieve |
| options.includeSteps | boolean | No | Include thread steps |
| options.includeMessages | boolean | No | Include thread messages |

**Response:**
```typescript
{
  type: 'getThreadResponse';
  success: boolean;
  thread?: ThreadResponse;  // Thread details (null on failure)
  threadId: string;         // Thread ID
  error?: string;
}
```

```typescript
const result = await codebolt.thread.getThreadDetail({
  taskId: 'thread-123',
  includeSteps: true,
  includeMessages: true
});
if (result.success && result.thread) {
  console.log(`Thread: ${result.thread.name}`);
  console.log(`Steps: ${result.thread.steps?.length}`);
  console.log(`Messages: ${result.thread.messages?.length}`);
}
```

---

### `startThread(threadId)`

Starts an existing thread.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| threadId | string | Yes | Thread ID to start |

**Response:**
```typescript
{
  type: 'startThreadResponse';
  success: boolean;
  thread?: ThreadResponse;  // Started thread (null on failure)
  threadId: string;         // Thread ID
  activityId?: string;      // Activity ID
  error?: string;
}
```

```typescript
const result = await codebolt.thread.startThread('thread-123');
if (result.success && result.thread) {
  console.log(`Started thread: ${result.threadId}`);
}
```

---

### `updateThread(threadId, updates)`

Updates an existing thread.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| threadId | string | Yes | Thread ID to update |
| updates | object | Yes | Update parameters |
| updates.name | string | No | New thread name |
| updates.dueDate | Date \| null | No | New due date |
| updates.completed | boolean | No | Completion status |
| updates.steps | Step[] | No | Updated steps |
| updates.isRemoteTask | boolean | No | Remote task flag |
| updates.environment | string \| null | No | Environment configuration |
| updates.isKanbanTask | boolean | No | Kanban task flag |
| updates.taskType | 'scheduled' \| 'interactive' | No | Thread type |
| updates.executionType | 'scheduled' \| 'immediate' \| 'manual' \| 'conditional' | No | Execution type |
| updates.environmentType | 'local' \| 'remote' | No | Environment type |
| updates.groupId | string | No | Group identifier |
| updates.startOption | 'immediately' \| 'manual' \| 'based_on_group' \| 'ontaskfinish' | No | Start option |
| updates.dependsOnTaskId | string | No | Dependent task ID |
| updates.dependsOnTaskName | string | No | Dependent task name |
| updates.userMessage | string | No | User message |
| updates.selectedAgent | any | No | Selected agent |
| updates.mentionedAgents | any[] | No | Mentioned agents |
| updates.mentionedMCPs | any[] | No | Mentioned MCPs |
| updates.remixPrompt | string | No | Remix prompt |
| updates.remoteProvider | { id: string; name?: string } | No | Remote provider config |
| updates.activeStepId | string | No | Active step ID |
| updates.currentStep | any | No | Current step data |
| updates.messageId | string | No | Message ID |
| updates.selection | { selectedText?: string } | No | Text selection |
| updates.processId | string | No | Process ID |
| updates.stepId | string | No | Step ID |

**Response:**
```typescript
{
  type: 'updateThreadResponse';
  success: boolean;
  thread?: ThreadResponse;  // Updated thread (null on failure)
  threadId: string;         // Thread ID
  error?: string;
}
```

```typescript
const result = await codebolt.thread.updateThread('thread-123', {
  name: 'Updated Thread Name',
  completed: false,
  priority: 'high'
});
if (result.success && result.thread) {
  console.log(`Updated thread: ${result.thread.name}`);
}
```

---

### `deleteThread(threadId)`

Deletes a thread.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| threadId | string | Yes | Thread ID to delete |

**Response:**
```typescript
{
  type: 'deleteThreadResponse';
  success: boolean;
  threadId: string;  // Thread ID
  deleted: boolean;  // Whether deletion was successful
  error?: string;
}
```

```typescript
const result = await codebolt.thread.deleteThread('thread-123');
if (result.success && result.deleted) {
  console.log(`Deleted thread: ${result.threadId}`);
}
```

---

### `updateThreadStatus(threadId, status)`

Updates the status of a thread.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| threadId | string | Yes | Thread ID |
| status | string | Yes | New status value |

**Response:**
```typescript
{
  type: 'updateThreadStatusResponse';
  success: boolean;
  thread?: ThreadResponse;  // Updated thread (null on failure)
  threadId: string;         // Thread ID
  status: string;           // New status
  error?: string;
}
```

```typescript
const result = await codebolt.thread.updateThreadStatus('thread-123', 'completed');
if (result.success && result.thread) {
  console.log(`Thread status updated to: ${result.status}`);
}
```

---

### `getThreadMessages(options)`

Retrieves messages for a specific thread.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options | object | Yes | Thread messages options |
| options.taskId | string | Yes | Thread ID |
| options.stepId | string | No | Filter by step ID |
| options.messageType | 'info' \| 'error' \| 'warning' \| 'success' \| 'steering' \| 'instruction' \| 'feedback' | No | Filter by message type |
| options.limit | number | No | Maximum results |
| options.offset | number | No | Results offset |

**Response:**
```typescript
{
  type: 'getThreadMessagesResponse';
  success: boolean;
  messages: ThreadMessageResponse[];  // Array of messages
  totalCount: number;                  // Total message count
  threadId: string;                    // Thread ID
  limit?: number;                      // Applied limit
  offset?: number;                     // Applied offset
  error?: string;
}
```

```typescript
const result = await codebolt.thread.getThreadMessages({
  taskId: 'thread-123',
  messageType: 'steering',
  limit: 20
});
if (result.success) {
  console.log(`Found ${result.totalCount} messages`);
  result.messages.forEach(msg => {
    console.log(`[${msg.messageType}] ${msg.message}`);
  });
}
```

---

### `getThreadFileChanges(threadId)`

Retrieves file changes associated with a specific thread.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| threadId | string | Yes | Thread ID |

**Response:**
```typescript
{
  // Structure varies based on actual file changes data
  // Typically includes file paths, change types, and diffs
}
```

```typescript
const result = await codebolt.thread.getThreadFileChanges('thread-123');
console.log('File changes:', result);
```

---

### `getThreadFileChangesSummary(threadId)`

Retrieves file changes summary for the ChangesSummaryPanel. Returns data in the format: `{ title, changes, files }`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| threadId | string | Yes | Thread ID |

**Response:**
```typescript
{
  title: string;   // Summary title
  changes: any;    // Change details
  files: any;      // File information
}
```

```typescript
const result = await codebolt.thread.getThreadFileChangesSummary('thread-123');
if (result) {
  console.log(`Summary: ${result.title}`);
  console.log(`Files changed: ${result.files?.length}`);
}
```

## Examples

### Creating and Starting a Thread

```typescript
// Create and start a thread immediately
const result = await codebolt.thread.createAndStartThread({
  title: 'Implement User Authentication',
  description: 'Add login and registration functionality',
  userMessage: 'Implement OAuth2 authentication with Google',
  agentId: 'agent-1',
  tags: ['authentication', 'security'],
  isRemoteTask: false
});

if (result.success) {
  console.log(`Thread ${result.threadId} started with activity ${result.activityId}`);
}
```

### Listing and Managing Threads

```typescript
// Get pending threads
const pendingThreads = await codebolt.thread.getThreadList({
  status: 'pending',
  limit: 10
});

if (pendingThreads.success) {
  for (const thread of pendingThreads.threads) {
    // Update thread status
    await codebolt.thread.updateThreadStatus(thread.threadId, 'in_progress');
    
    // Start the thread
    await codebolt.thread.startThread(thread.threadId);
  }
}
```

### Retrieving Thread Messages with Filtering

```typescript
// Get all steering messages for a thread
const messages = await codebolt.thread.getThreadMessages({
  taskId: 'thread-123',
  messageType: 'steering',
  limit: 50
});

if (messages.success) {
  messages.messages.forEach(msg => {
    if (msg.agentId) {
      console.log(`Agent ${msg.agentId}: ${msg.message}`);
    }
  });
}
```

### Background Thread Creation with Agent Monitoring

```typescript
// Create a thread that runs in the background
const bgResult = await codebolt.thread.createThreadInBackground({
  title: 'Long Running Task',
  userMessage: 'Process large dataset in background',
  groupId: 'batch-process',
  steps: [
    { type: 'data-fetch', userMessage: 'Fetch data' },
    { type: 'data-process', userMessage: 'Process data' }
  ]
});

if (bgResult.type === 'ThreadAgentStarted') {
  console.log(`Background agent started: ${bgResult.agentId}`);
  // The thread is now tracked in the codebolt event system
  // You can monitor progress through events
} else {
  console.error(`Background thread failed: ${bgResult.error}`);
}
```
