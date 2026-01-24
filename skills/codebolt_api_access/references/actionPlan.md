# codebolt.actionPlan - Action Plan Management

Manages action plans, tasks, and groups for automated workflows. Create, update, and execute structured plans with tasks, parallel groups, loops, conditionals, and wait operations.

## Response Types

All responses include common fields:

```typescript
interface BaseResponse {
  success: boolean;       // Whether the operation succeeded
  message: string;        // Status message
  error?: {
    code: string;         // Error code
    details: string;      // Error details
  };
  timestamp: string;       // ISO timestamp
  requestId?: string;     // Request identifier
}
```

### ActionPlanTask

Represents a single task within an action plan:

```typescript
interface ActionPlanTask {
  taskId: string;              // Unique task identifier
  name: string;                // Task name
  description?: string;         // Task description
  status: string;              // Task status (e.g., "pending", "in_progress", "completed", "failed")
  priority?: string;           // Task priority level
  threadId?: string;           // Associated thread ID
  statusUpdatedAt?: string;    // ISO timestamp when status last changed
  updatedAt?: string;          // ISO timestamp when task was last updated
}
```

### ActionPlan

Represents a complete action plan with tasks:

```typescript
interface ActionPlan {
  planId: string;              // Unique plan identifier
  name: string;                // Plan name
  description?: string;        // Plan description
  items: ActionPlanTask[];      // Array of tasks in the plan
  status: string;              // Plan status
  createdAt: string;           // ISO timestamp when plan was created
  updatedAt: string;           // ISO timestamp when plan was last updated
}
```

## Methods

### `getAllPlans()`

Retrieves all action plans.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| None | - | - | No parameters required |

**Response:**
```typescript
{
  success: boolean;
  message: string;
  error?: {
    code: string;
    details: string;
  };
  timestamp: string;
  requestId?: string;
  actionPlans?: ActionPlan[];  // Array of all action plans
}
```

```typescript
const result = await codebolt.actionPlan.getAllPlans();
if (result.success && result.actionPlans) {
  console.log(`Found ${result.actionPlans.length} plans`);
  result.actionPlans.forEach(plan => {
    console.log(`- ${plan.name} (${plan.planId})`);
  });
}
```

---

### `getPlanDetail(planId)`

Retrieves detailed information about a specific action plan.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| planId | string | Yes | The ID of the action plan |

**Response:**
```typescript
{
  success: boolean;
  message: string;
  error?: {
    code: string;
    details: string;
  };
  timestamp: string;
  requestId?: string;
  actionPlan?: ActionPlan;  // Detailed action plan object
}
```

```typescript
const result = await codebolt.actionPlan.getPlanDetail('plan_123');
if (result.success && result.actionPlan) {
  console.log(`Plan: ${result.actionPlan.name}`);
  console.log(`Tasks: ${result.actionPlan.items.length}`);
}
```

---

### `getActionPlanDetail(planId)`

Alternative method to retrieve detailed information about a specific action plan.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| planId | string | Yes | The ID of the action plan |

**Response:**
```typescript
{
  success: boolean;
  message: string;
  error?: {
    code: string;
    details: string;
  };
  timestamp: string;
  requestId?: string;
  actionPlan?: ActionPlan;  // Detailed action plan object
}
```

```typescript
const result = await codebolt.actionPlan.getActionPlanDetail('plan_123');
if (result.success && result.actionPlan) {
  console.log(`Plan: ${result.actionPlan.name}`);
  result.actionPlan.items.forEach(task => {
    console.log(`- ${task.name}: ${task.status}`);
  });
}
```

---

### `createActionPlan(payload)`

Creates a new action plan.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| payload | object | Yes | Action plan creation data |
| payload.name | string | Yes | Plan name |
| payload.description | string | No | Plan description |
| payload.agentId | string | No | Associated agent ID |
| payload.agentName | string | No | Associated agent name |
| payload.status | string | No | Initial plan status |
| payload.planId | string | No | Custom plan ID (auto-generated if omitted) |

**Response:**
```typescript
{
  success: boolean;
  message: string;
  error?: {
    code: string;
    details: string;
  };
  timestamp: string;
  requestId?: string;
  actionPlan?: ActionPlan;  // Created action plan
}
```

```typescript
const result = await codebolt.actionPlan.createActionPlan({
  name: 'Data Migration Plan',
  description: 'Migrate data from legacy system',
  agentId: 'agent_456',
  agentName: 'DataAgent',
  status: 'pending'
});
if (result.success && result.actionPlan) {
  console.log(`Created plan: ${result.actionPlan.planId}`);
}
```

---

### `updateActionPlan(planId, updateData)`

Updates an existing action plan with new data.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| planId | string | Yes | The ID of the action plan to update |
| updateData | any | Yes | Data to update (name, description, status, etc.) |

**Response:**
```typescript
{
  success: boolean;
  message: string;
  error?: {
    code: string;
    details: string;
  };
  timestamp: string;
  requestId?: string;
  actionPlan?: ActionPlan;  // Updated action plan
}
```

```typescript
const result = await codebolt.actionPlan.updateActionPlan('plan_123', {
  name: 'Updated Plan Name',
  status: 'in_progress',
  description: 'Updated description'
});
if (result.success) {
  console.log('Plan updated successfully');
}
```

---

### `addTaskToActionPlan(planId, task)`

Adds a task to an existing action plan.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| planId | string | Yes | The ID of the action plan |
| task | object | Yes | Task data |
| task.name | string | Yes | Task name |
| task.description | string | No | Task description |
| task.priority | string | No | Task priority level |
| task.taskType | string | No | Type of task |

**Response:**
```typescript
{
  success: boolean;
  message: string;
  error?: {
    code: string;
    details: string;
  };
  timestamp: string;
  requestId?: string;
  task?: ActionPlanTask;     // Added task
  actionPlan?: ActionPlan;    // Updated action plan
}
```

```typescript
const result = await codebolt.actionPlan.addTaskToActionPlan('plan_123', {
  name: 'Extract Data',
  description: 'Extract data from source database',
  priority: 'high',
  taskType: 'extraction'
});
if (result.success && result.task) {
  console.log(`Added task: ${result.task.taskId}`);
}
```

---

### `addGroupToActionPlan(planId, group)`

Adds a group (parallel, loop, if, or wait-until) to an action plan.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| planId | string | Yes | The ID of the action plan |
| group | object | Yes | Group configuration |
| group.type | 'parallelGroup' | 'loopGroup' | 'ifGroup' | 'waitUntilGroup' | Yes | Group type |
| group.name | string | No | Group name |
| group.groupItems | object | No | Items for parallel group (type: array) |
| group.loopTasks | any[] | No | Tasks to loop over |
| group.ifTasks | any[] | No | Tasks for conditional execution |
| group.waitTasks | any[] | No | Tasks for wait-until condition |

**Response:**
```typescript
{
  success: boolean;
  message: string;
  error?: {
    code: string;
    details: string;
  };
  timestamp: string;
  requestId?: string;
  task?: ActionPlanTask;     // Added group task
  actionPlan?: ActionPlan;    // Updated action plan
}
```

```typescript
const result = await codebolt.actionPlan.addGroupToActionPlan('plan_123', {
  type: 'parallelGroup',
  name: 'Parallel Data Processing',
  groupItems: {
    taskType: ['extract', 'transform', 'load']
  }
});
if (result.success) {
  console.log('Parallel group added');
}
```

---

### `startTaskStep(planId, taskId)`

Starts or executes a specific task step within an action plan.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| planId | string | Yes | The ID of the action plan |
| taskId | string | Yes | The ID of the task to start |

**Response:**
```typescript
{
  type: string;
  action: string;
  response: any;
  success: boolean;
  message: string;
  error?: {
    code: string;
    details: string;
  };
  timestamp: string;
  requestId?: string;
  taskId?: string;  // ID of the started task
}
```

```typescript
const result = await codebolt.actionPlan.startTaskStep('plan_123', 'task_456');
if (result.success) {
  console.log('Task started successfully');
}
```

---

### `startTaskStepWithListener(planId, taskId, onResponse)`

Starts a task step with an event listener for real-time responses. Returns a cleanup function to remove the listener.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| planId | string | Yes | The ID of the action plan |
| taskId | string | Yes | The ID of the task to start |
| onResponse | function | Yes | Callback function for responses |

**Returns:**
```typescript
() => void;  // Cleanup function to remove the event listener
```

```typescript
const cleanup = codebolt.actionPlan.startTaskStepWithListener(
  'plan_123',
  'task_456',
  (response) => {
    console.log('Task update:', response);
    if (response.status === 'completed') {
      console.log('Task finished!');
    }
  }
);

// Later, to stop listening:
cleanup();
```

## Examples

### Creating a Complete Action Plan

```typescript
// Create a new action plan
const plan = await codebolt.actionPlan.createActionPlan({
  name: 'CI/CD Pipeline',
  description: 'Automated build and deployment pipeline',
  status: 'pending'
});

if (plan.success && plan.actionPlan) {
  const planId = plan.actionPlan.planId;

  // Add tasks to the plan
  await codebolt.actionPlan.addTaskToActionPlan(planId, {
    name: 'Run Tests',
    description: 'Execute unit and integration tests',
    priority: 'high'
  });

  await codebolt.actionPlan.addTaskToActionPlan(planId, {
    name: 'Build Application',
    description: 'Build the production bundle',
    priority: 'high'
  });

  await codebolt.actionPlan.addTaskToActionPlan(planId, {
    name: 'Deploy to Production',
    description: 'Deploy to production environment',
    priority: 'medium'
  });

  console.log(`Plan created with ID: ${planId}`);
}
```

### Using Parallel Groups for Concurrent Tasks

```typescript
// Create a plan with parallel processing
const plan = await codebolt.actionPlan.createActionPlan({
  name: 'Data Sync Pipeline'
});

if (plan.success && plan.actionPlan) {
  const planId = plan.actionPlan.planId;

  // Add a parallel group for concurrent data processing
  await codebolt.actionPlan.addGroupToActionPlan(planId, {
    type: 'parallelGroup',
    name: 'Process Multiple Sources',
    groupItems: {
      'source1': [{ name: 'Extract from Database A' }],
      'source2': [{ name: 'Extract from API B' }],
      'source3': [{ name: 'Extract from File C' }]
    }
  });

  console.log('Parallel group added to plan');
}
```

### Using Conditional Groups (If)

```typescript
// Add conditional execution based on environment
const result = await codebolt.actionPlan.addGroupToActionPlan('plan_123', {
  type: 'ifGroup',
  name: 'Environment-Specific Tasks',
  ifTasks: [
    {
      condition: 'environment === "production"',
      tasks: [
        { name: 'Run Production Tests' },
        { name: 'Create Backup' }
      ]
    }
  ]
});

if (result.success) {
  console.log('Conditional group added');
}
```

### Monitoring Task Execution with Listener

```typescript
// Start a task and monitor its progress
const cleanup = codebolt.actionPlan.startTaskStepWithListener(
  'plan_123',
  'task_456',
  (response) => {
    switch (response.status) {
      case 'in_progress':
        console.log('Task is running...');
        break;
      case 'completed':
        console.log('Task completed successfully!');
        cleanup();  // Remove listener on completion
        break;
      case 'failed':
        console.error('Task failed:', response.error);
        cleanup();  // Remove listener on failure
        break;
    }
  }
);

// Timeout after 5 minutes if no response
setTimeout(() => {
  console.log('Timeout: Removing listener');
  cleanup();
}, 300000);
```
