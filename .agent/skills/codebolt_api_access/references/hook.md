# codebolt.hook - Hook Management

Provides hook management for triggering actions based on system events such as file changes, git operations, terminal commands, and custom events.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseResponse {
  success: boolean;  // Whether the operation succeeded
  message?: string;  // Optional status message
  error?: string;    // Error details if operation failed
}
```

### HookCondition

Used in hook configurations to define conditions that must be met before a hook triggers:

```typescript
interface HookCondition {
  field: string;  // Field to evaluate (e.g., 'path', 'content')
  operator: 'eq' | 'neq' | 'contains' | 'startsWith' | 'endsWith' | 'matches';
  value: string;  // Value to compare against
}
```

### HookTrigger

Type of event that triggers the hook:

```typescript
type HookTrigger =
  | 'file.created'      // When a file is created
  | 'file.modified'     // When a file is modified
  | 'file.deleted'      // When a file is deleted
  | 'git.commit'        // When a git commit is made
  | 'git.push'          // When code is pushed
  | 'git.pull'          // When code is pulled
  | 'terminal.command'  // When a terminal command is executed
  | 'agent.start'       // When an agent starts
  | 'agent.end'         // When an agent ends
  | 'message.received'  // When a message is received
  | 'custom';           // Custom trigger type
```

### HookAction

Action to perform when the hook is triggered:

```typescript
type HookAction =
  | 'notify'   // Send a notification
  | 'execute'  // Execute a command
  | 'log'      // Log the event
  | 'webhook'  // Send webhook request
  | 'agent';   // Trigger an agent
```

## Methods

### `initialize(projectPath)`

Initialize the hook manager for a project. Sets up the hook system to monitor events in the specified project directory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectPath | string | Yes | Path to the project directory |

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

```typescript
const result = await codebolt.hook.initialize('/path/to/project');
if (result.success) {
  console.log('Hook manager initialized');
}
```

---

### `create(config)`

Create a new hook with the specified configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| config | HookConfig | Yes | Hook configuration object |

**HookConfig:**
```typescript
{
  id?: string;
  name: string;
  description?: string;
  trigger: HookTrigger;
  triggerConfig?: {
    pattern?: string;
    path?: string;
    command?: string;
    eventType?: string;
  };
  action: HookAction;
  actionConfig?: {
    message?: string;
    command?: string;
    url?: string;
    agentId?: string;
    payload?: Record<string, any>;
  };
  enabled?: boolean;
  priority?: number;
  conditions?: HookCondition[];
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    id: string;
    name: string;
    description?: string;
    trigger: HookTrigger;
    triggerConfig?: object;
    action: HookAction;
    actionConfig?: object;
    enabled: boolean;
    priority?: number;
    conditions?: HookCondition[];
    createdAt: string;
    updatedAt: string;
    lastTriggeredAt?: string;
    triggerCount: number;
  };
  message?: string;
  error?: string;
}
```

```typescript
const result = await codebolt.hook.create({
  name: 'Log file changes',
  description: 'Logs when files are modified',
  trigger: 'file.modified',
  triggerConfig: { path: '/src' },
  action: 'log',
  actionConfig: { message: 'File modified' },
  enabled: true
});
if (result.success) {
  console.log('Hook created:', result.data?.id);
}
```

---

### `update(hookId, config)`

Update an existing hook with new configuration values. Only the fields specified in config are updated.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| hookId | string | Yes | ID of the hook to update |
| config | Partial<HookConfig> | Yes | Partial hook configuration with fields to update |

**Response:**
```typescript
{
  success: boolean;
  data?: {
    id: string;
    name: string;
    description?: string;
    trigger: HookTrigger;
    triggerConfig?: object;
    action: HookAction;
    actionConfig?: object;
    enabled: boolean;
    priority?: number;
    conditions?: HookCondition[];
    createdAt: string;
    updatedAt: string;
    lastTriggeredAt?: string;
    triggerCount: number;
  };
  message?: string;
  error?: string;
}
```

```typescript
const result = await codebolt.hook.update('hook-123', {
  enabled: false,
  description: 'Updated description'
});
if (result.success) {
  console.log('Hook updated');
}
```

---

### `delete(hookId)`

Delete a hook by its ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| hookId | string | Yes | ID of the hook to delete |

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

```typescript
const result = await codebolt.hook.delete('hook-123');
if (result.success) {
  console.log('Hook deleted');
}
```

---

### `list()`

List all hooks configured in the system.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | - | - | No parameters required |

**Response:**
```typescript
{
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    description?: string;
    trigger: HookTrigger;
    triggerConfig?: object;
    action: HookAction;
    actionConfig?: object;
    enabled: boolean;
    priority?: number;
    conditions?: HookCondition[];
    createdAt: string;
    updatedAt: string;
    lastTriggeredAt?: string;
    triggerCount: number;
  }>;
  message?: string;
  error?: string;
}
```

```typescript
const result = await codebolt.hook.list();
if (result.success && result.data) {
  result.data.forEach(hook => {
    console.log(`${hook.name}: ${hook.enabled ? 'enabled' : 'disabled'}`);
  });
}
```

---

### `get(hookId)`

Get details of a specific hook by its ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| hookId | string | Yes | ID of the hook to retrieve |

**Response:**
```typescript
{
  success: boolean;
  data?: {
    id: string;
    name: string;
    description?: string;
    trigger: HookTrigger;
    triggerConfig?: object;
    action: HookAction;
    actionConfig?: object;
    enabled: boolean;
    priority?: number;
    conditions?: HookCondition[];
    createdAt: string;
    updatedAt: string;
    lastTriggeredAt?: string;
    triggerCount: number;
  };
  message?: string;
  error?: string;
}
```

```typescript
const result = await codebolt.hook.get('hook-123');
if (result.success && result.data) {
  console.log('Hook:', result.data.name);
  console.log('Triggered', result.data.triggerCount, 'times');
}
```

---

### `enable(hookId)`

Enable a hook so it can trigger on events.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| hookId | string | Yes | ID of the hook to enable |

**Response:**
```typescript
{
  success: boolean;
  data?: {
    id: string;
    name: string;
    description?: string;
    trigger: HookTrigger;
    triggerConfig?: object;
    action: HookAction;
    actionConfig?: object;
    enabled: boolean;
    priority?: number;
    conditions?: HookCondition[];
    createdAt: string;
    updatedAt: string;
    lastTriggeredAt?: string;
    triggerCount: number;
  };
  message?: string;
  error?: string;
}
```

```typescript
const result = await codebolt.hook.enable('hook-123');
if (result.success) {
  console.log('Hook enabled');
}
```

---

### `disable(hookId)`

Disable a hook so it no longer triggers on events.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| hookId | string | Yes | ID of the hook to disable |

**Response:**
```typescript
{
  success: boolean;
  data?: {
    id: string;
    name: string;
    description?: string;
    trigger: HookTrigger;
    triggerConfig?: object;
    action: HookAction;
    actionConfig?: object;
    enabled: boolean;
    priority?: number;
    conditions?: HookCondition[];
    createdAt: string;
    updatedAt: string;
    lastTriggeredAt?: string;
    triggerCount: number;
  };
  message?: string;
  error?: string;
}
```

```typescript
const result = await codebolt.hook.disable('hook-123');
if (result.success) {
  console.log('Hook disabled');
}
```

## Examples

### Monitor File Changes with Webhook Notification

Create a hook that sends a webhook notification when files in the `src` directory are modified:

```typescript
await codebolt.hook.initialize('/my/project');

const hook = await codebolt.hook.create({
  name: 'Notify on source changes',
  description: 'Send webhook when source files change',
  trigger: 'file.modified',
  triggerConfig: {
    path: '/my/project/src',
    pattern: '*.{ts,js,tsx,jsx}'
  },
  action: 'webhook',
  actionConfig: {
    url: 'https://example.com/webhook',
    payload: { event: 'source_changed' }
  },
  enabled: true
});

if (hook.success) {
  console.log('File monitoring hook active');
}
```

### Auto-Run Tests on Git Commits

Create a hook that automatically runs tests when git commits are made:

```typescript
await codebolt.hook.initialize('/my/project');

const testHook = await codebolt.hook.create({
  name: 'Run tests on commit',
  description: 'Execute test suite after each commit',
  trigger: 'git.commit',
  action: 'execute',
  actionConfig: {
    command: 'npm test'
  },
  enabled: true,
  priority: 10
});

if (testHook.success) {
  console.log('Test automation hook configured');
}
```

### Conditional Logging with Pattern Matching

Create a hook that logs terminal commands only when they match a specific pattern:

```typescript
const logHook = await codebolt.hook.create({
  name: 'Log dangerous commands',
  description: 'Log commands that modify production files',
  trigger: 'terminal.command',
  triggerConfig: {},
  action: 'log',
  actionConfig: {
    message: 'Dangerous command executed'
  },
  conditions: [
    {
      field: 'command',
      operator: 'contains',
      value: 'rm -rf'
    }
  ],
  enabled: true
});

if (logHook.success) {
  console.log('Command logging hook created');
}
```

### Manage Hooks Programmatically

List hooks and selectively enable/disable them:

```typescript
const listResult = await codebolt.hook.list();
if (listResult.success && listResult.data) {
  for (const hook of listResult.data) {
    if (hook.name.includes('test')) {
      await codebolt.hook.enable(hook.id);
      console.log(`Enabled: ${hook.name}`);
    } else if (hook.priority && hook.priority < 5) {
      await codebolt.hook.disable(hook.id);
      console.log(`Disabled low priority: ${hook.name}`);
    }
  }
}
```
