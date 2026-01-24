# codebolt.task - Task Management Module

Provides comprehensive task and step management capabilities including creating, updating, deleting, querying, and executing tasks. Tasks can be assigned to agents, tracked with status, and organized in groups with dependencies.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseTaskResponse {
  type: string;       // Response type identifier
  success: boolean;    // Whether the operation succeeded
  error?: string;      // Error details if operation failed
}
```

### Task

Represents a complete task with all its properties:

```typescript
interface Task {
  taskId: string;                    // Unique task identifier
  name: string;                      // Task name
  description?: string;              // Task description
  status: TaskStatus;                // Current status
  completed: boolean;                // Whether task is completed
  priority: TaskPriority;           // Task priority level
  groupId: string;                   // Group identifier
  projectId?: number;                // Project ID
  projectPath?: string;              // Project path
  projectName?: string;              // Project name
  dueDate?: Date | string;           // Due date
  assignedTo?: string;               // Agent ID assigned to task
  dependsOnTaskId?: string;          // Task this one depends on
  dependsOnTaskName?: string;        // Name of dependency task
  parentTaskId?: string;             // Parent task ID for subtasks
  order?: number;                    // Order in list
  tags?: string[];                   // Task tags
  flowData?: any;                    // Flow/workflow data
  errorMessage?: string;             // Error message if failed
  cancellationReason?: string;       // Reason for cancellation
  statusUpdatedAt?: Date | string;   // Last status update
  completedAt?: Date | string;       // Completion time
  createdAt?: Date | string;         // Creation time
  updatedAt?: Date | string;         // Last update time
  mentionedFiles?: string[];         // Referenced files
  mentionedFolders?: string[];       // Referenced folders
  mentionedMultiFile?: string[];     // Multi-file selections
  mentionedMCPs?: string[];          // Mentioned MCPs
  uploadedImages?: string[];         // Uploaded image paths
  mentionedAgents?: any[];           // Mentioned agents
  mentionedDocs?: any[];             // Mentioned documents
  controlFiles?: any[];              // Control files
  links?: string[];                  // Associated links
  selectedAgent?: any;              // Selected agent metadata
  selection?: any;                  // Selection data
  children?: any[];                  // Child tasks
  messages?: any[];                  // Task messages
}
```

### TaskStatus

Enum of possible task statuses: `'created' | 'planned' | 'pending' | 'in_progress' | 'waiting_user' | 'review' | 'completed' | 'cancelled' | 'failed' | 'active'`

### TaskPriority

Enum of task priority levels: `'low' | 'medium' | 'high' | 'urgent'`

## Methods

### `createTask(options)`

Creates a new task with the specified properties.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options | CreateTaskOptions | Yes | Task creation options |
| options.threadId | string | Yes | Thread identifier |
| options.name | string | Yes | Task name |
| options.description | string | No | Task description |
| options.status | string | No | Initial status (default: 'pending') |
| options.groupId | string | No | Group identifier |
| options.parentTaskId | string | No | Parent task for subtasks |
| options.projectId | number | No | Project ID |
| options.projectPath | string | No | Project path |
| options.projectName | string | No | Project name |
| options.dueDate | Date | No | Due date |
| options.dependsOnTaskId | string | No | Task ID this depends on |
| options.dependsOnTaskName | string | No | Name of dependency task |
| options.assignedTo | string | No | Agent ID to assign |
| options.priority | TaskPriority | No | Priority level |
| options.tags | string[] | No | Task tags |
| options.mentionedFiles | string[] | No | Referenced files |
| options.mentionedFolders | string[] | No | Referenced folders |
| options.mentionedMultiFile | string[] | No | Multi-file selections |
| options.mentionedMCPs | string[] | No | Mentioned MCPs |
| options.uploadedImages | string[] | No | Uploaded image paths |
| options.mentionedAgents | any[] | No | Mentioned agents |
| options.mentionedDocs | any[] | No | Mentioned documents |
| options.controlFiles | any[] | No | Control files |
| options.links | string[] | No | Associated links |
| options.selectedAgent | any | No | Selected agent metadata |
| options.selection | any | No | Selection data |
| options.isRemoteTask | boolean | No | Whether remote task |
| options.environment | string | No | Environment name |
| options.isKanbanTask | boolean | No | Whether kanban task |
| options.taskType | TaskType | No | 'scheduled' or 'interactive' |
| options.executionType | ExecutionType | No | 'scheduled', 'immediate', 'manual', 'conditional' |
| options.environmentType | EnvironmentType | No | 'local' or 'remote' |
| options.startOption | StartOption | No | 'immediately', 'manual', 'based_on_group', 'ontaskfinish' |
| options.flowData | any | No | Flow/workflow data |
| options.order | number | No | Order in list |
| options.steps | Step[] | No | Task steps |

**Response:**
```typescript
{
  type: 'createTaskResponse';
  success: boolean;
  task?: Task | null;  // Created task or null on failure
  error?: string;
}
```

```typescript
const result = await codebolt.task.createTask({
  threadId: 'thread-123',
  name: 'Implement user authentication',
  description: 'Add login and registration features',
  priority: 'high',
  status: 'pending',
  assignedTo: 'agent-456'
});

if (result.success && result.task) {
  console.log('Task created:', result.task.taskId);
}
```

---

### `updateTask(taskId, updates)`

Updates an existing task with new values.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Task ID to update |
| updates | UpdateTaskOptions | Yes | Task update options |
| updates.name | string | No | New task name |
| updates.dueDate | Date \| null | No | New due date |
| updates.completed | boolean | No | Completion status |
| updates.steps | Step[] | No | Updated task steps |
| updates.isRemoteTask | boolean | No | Remote task flag |
| updates.environment | string | No | Environment name |
| updates.isKanbanTask | boolean | No | Kanban task flag |
| updates.taskType | TaskType | No | 'scheduled' or 'interactive' |
| updates.executionType | ExecutionType | No | Execution type |
| updates.environmentType | EnvironmentType | No | 'local' or 'remote' |
| updates.groupId | string | No | Group ID |
| updates.startOption | StartOption | No | Start option |
| updates.dependsOnTaskId | string | No | Dependency task ID |
| updates.dependsOnTaskName | string | No | Dependency task name |
| updates.assignedTo | string | No | Agent ID to assign |
| updates.selectedAgent | any | No | Selected agent metadata |

**Response:**
```typescript
{
  type: 'updateTaskResponse';
  success: boolean;
  task?: Task | null;  // Updated task or null on failure
  error?: string;
}
```

```typescript
const result = await codebolt.task.updateTask('task-abc', {
  status: 'completed',
  completed: true
});

if (result.success && result.task) {
  console.log('Task updated:', result.task.status);
}
```

---

### `deleteTask(taskId)`

Deletes a task by its ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Task ID to delete |

**Response:**
```typescript
{
  type: 'deleteTaskResponse';
  success: boolean;
  taskId: string;        // ID of deleted task
  deleted: boolean;      // Whether deletion succeeded
  error?: string;
}
```

```typescript
const result = await codebolt.task.deleteTask('task-abc');

if (result.success && result.deleted) {
  console.log('Task deleted:', result.taskId);
}
```

---

### `getTaskList(options?)`

Retrieves a list of tasks with optional filtering.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options | GetTaskListOptions | No | Query options (default: {}) |
| options.threadId | string | No | Filter by thread ID |
| options.status | TaskStatusFilter | No | Filter by status: 'completed', 'pending', 'processing', 'all' |
| options.startedByUser | string | No | Filter by user who started |
| options.limit | number | No | Maximum results |
| options.offset | number | No | Pagination offset |

**Response:**
```typescript
{
  type: 'listTasksResponse';
  success: boolean;
  tasks: Task[];        // Array of tasks
  totalCount: number;   // Total task count
  error?: string;
}
```

```typescript
const result = await codebolt.task.getTaskList({
  status: 'pending',
  limit: 10
});

if (result.success) {
  console.log(`Found ${result.totalCount} tasks`);
  result.tasks.forEach(task => {
    console.log(`- ${task.name} (${task.status})`);
  });
}
```

---

### `getTaskDetail(options)`

Retrieves detailed information about a specific task.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options | GetTaskDetailOptions | Yes | Query options |
| options.taskId | string | Yes | Task ID to retrieve |
| options.includeSteps | boolean | No | Include task steps |
| options.includeMessages | boolean | No | Include task messages |

**Response:**
```typescript
{
  type: 'getTaskResponse';
  success: boolean;
  taskId: string;        // Requested task ID
  task?: Task | null;    // Task details or null if not found
  error?: string;
}
```

```typescript
const result = await codebolt.task.getTaskDetail({
  taskId: 'task-abc',
  includeSteps: true
});

if (result.success && result.task) {
  console.log('Task:', result.task.name);
  console.log('Status:', result.task.status);
  console.log('Description:', result.task.description);
}
```

---

### `assignAgentToTask(taskId, agentId)`

Assigns an agent to a task.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Task ID to assign agent to |
| agentId | string | Yes | Agent ID to assign |

**Response:**
```typescript
{
  type: 'updateTaskResponse';
  success: boolean;
  task?: Task | null;  // Updated task or null on failure
  error?: string;
}
```

```typescript
const result = await codebolt.task.assignAgentToTask('task-abc', 'agent-xyz');

if (result.success && result.task) {
  console.log('Agent assigned:', result.task.assignedTo);
}
```

---

### `executeTaskWithAgent(taskId, agentId)`

Assigns an agent to a task and then starts execution. This combines assignment and starting in one operation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Task ID to execute |
| agentId | string | Yes | Agent ID to execute with |

**Response:**
```typescript
{
  type: 'startTaskWithAgentResponse';
  success: boolean;
  taskId: string;        // Task that was started
  agentId: string;       // Agent executing the task
  activityId?: string;   // Activity ID for tracking
  task?: Task | null;    // Task details or null on failure
  error?: string;
}
```

```typescript
const result = await codebolt.task.executeTaskWithAgent('task-abc', 'agent-xyz');

if (result.success) {
  console.log('Task started:', result.taskId);
  console.log('Agent:', result.agentId);
  console.log('Activity ID:', result.activityId);
}
```

---

### `getTaskStatus(taskId)`

Gets the current status of a task.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Task ID to check |

**Response:**
```typescript
string | undefined  // Task status or undefined if not found
```

```typescript
const status = await codebolt.task.getTaskStatus('task-abc');

if (status) {
  console.log('Task status:', status);
}
```

---

### `getTaskSummary(taskId)`

Gets the description (summary) of a task.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Task ID to get summary for |

**Response:**
```typescript
string | undefined  // Task description or undefined if not found
```

```typescript
const summary = await codebolt.task.getTaskSummary('task-abc');

if (summary) {
  console.log('Task summary:', summary);
}
```

---

## Examples

### Creating a Task with Dependencies

```typescript
const result = await codebolt.task.createTask({
  threadId: 'thread-123',
  name: 'Build backend API',
  description: 'Implement REST API endpoints for user management',
  priority: 'high',
  status: 'pending',
  dependsOnTaskId: 'task-database',
  dependsOnTaskName: 'Set up database',
  assignedTo: 'agent-backend',
  dueDate: new Date('2024-12-31'),
  tags: ['backend', 'api', 'user-management'],
  mentionedFiles: ['src/api/user.ts', 'src/models/user.ts']
});

if (result.success && result.task) {
  console.log('Created task:', result.task.taskId);
  console.log('Depends on:', result.task.dependsOnTaskId);
}
```

### Listing and Updating Tasks

```typescript
// Get pending tasks
const listResult = await codebolt.task.getTaskList({
  status: 'pending',
  limit: 5
});

if (listResult.success) {
  console.log(`Found ${listResult.totalCount} pending tasks:`);
  
  for (const task of listResult.tasks) {
    console.log(`- ${task.name} (${task.priority})`);
    
    // Update high priority tasks
    if (task.priority === 'high') {
      const updateResult = await codebolt.task.updateTask(task.taskId, {
        assignedTo: 'agent-priority'
      });
      
      if (updateResult.success) {
        console.log(`  Assigned to priority agent`);
      }
    }
  }
}
```

### Executing a Task with an Agent

```typescript
const taskId = 'task-abc';
const agentId = 'agent-coder';

// Get task details first
const detailResult = await codebolt.task.getTaskDetail({
  taskId
});

if (detailResult.success && detailResult.task) {
  const task = detailResult.task;
  console.log(`Executing: ${task.name}`);
  console.log(`Description: ${task.description}`);
  
  // Execute with agent
  const execResult = await codebolt.task.executeTaskWithAgent(taskId, agentId);
  
  if (execResult.success) {
    console.log(`Task started with activity: ${execResult.activityId}`);
    console.log(`Agent: ${execResult.agentId}`);
    
    // Monitor status
    let status = await codebolt.task.getTaskStatus(taskId);
    console.log(`Current status: ${status}`);
  }
}
```

### Task Workflow with Status Monitoring

```typescript
async function manageTaskWorkflow() {
  // Create main task
  const createResult = await codebolt.task.createTask({
    threadId: 'thread-456',
    name: 'Complete project setup',
    description: 'Set up development environment and dependencies',
    priority: 'medium',
    status: 'pending'
  });
  
  if (!createResult.success || !createResult.task) {
    console.error('Failed to create task:', createResult.error);
    return;
  }
  
  const taskId = createResult.task.taskId;
  console.log('Created task:', taskId);
  
  // Assign and execute
  const execResult = await codebolt.task.executeTaskWithAgent(
    taskId,
    'agent-devops'
  );
  
  if (execResult.success) {
    console.log('Task execution started');
    
    // Monitor progress
    const checkInterval = setInterval(async () => {
      const status = await codebolt.task.getTaskStatus(taskId);
      const summary = await codebolt.task.getTaskSummary(taskId);
      
      console.log(`Status: ${status}`);
      
      if (status === 'completed' || status === 'failed' || status === 'cancelled') {
        clearInterval(checkInterval);
        console.log('Task finished:', status);
      }
    }, 5000);
  }
}

manageTaskWorkflow();
```

### Filtering Tasks by Status and Priority

```typescript
const result = await codebolt.task.getTaskList({
  status: 'pending',
  limit: 20
});

if (result.success) {
  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  
  const sortedTasks = [...result.tasks].sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );
  
  console.log('Task Queue (by priority):');
  sortedTasks.forEach((task, index) => {
    console.log(`${index + 1}. [${task.priority.toUpperCase()}] ${task.name}`);
    console.log(`   ID: ${task.taskId}`);
    console.log(`   Due: ${task.dueDate || 'No due date'}`);
    console.log(`   Assigned: ${task.assignedTo || 'Unassigned'}`);
    console.log('');
  });
}
```
