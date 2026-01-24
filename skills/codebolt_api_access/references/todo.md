# codebolt.todo - Todo List Management

This module provides functionality to interact with todo lists, including adding, updating, retrieving, and managing todo items. Supports filtering by status, priority, and tags, as well as import/export operations.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseTodoSDKResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
  requestId?: string; // Request identifier
  timestamp?: string; // Response timestamp
}
```

### TodoItem

Represents a single todo item:

```typescript
interface TodoItem {
  id: string;                                    // Todo item ID
  title: string;                                 // Todo title
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  description?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### TodoList

Represents a todo list with items:

```typescript
interface TodoList {
  id: string;
  name: string;
  todos: TodoItem[];
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## Methods

### `addTodo(params)`

Adds a new todo item to the todo list.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | The title of the todo |
| priority | `'high' \| 'medium' \| 'low'` | No | The priority level of the todo |
| tags | `string[]` | No | Tags for categorizing the todo |

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
  todo?: {
    id: string;
    title: string;
    status?: 'pending' | 'processing' | 'completed' | 'cancelled';
    priority?: 'high' | 'medium' | 'low';
    tags?: string[];
    description?: string;
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  id?: string;
}
```

```typescript
const result = await codebolt.todo.addTodo({
  title: 'Review pull request',
  priority: 'high',
  tags: ['code-review', 'urgent']
});
if (result.success) {
  console.log(`Created todo with ID: ${result.id}`);
}
```

---

### `updateTodo(params)`

Updates an existing todo item with new values.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The ID of the todo to update |
| title | string | No | The new title |
| status | `'pending' \| 'processing' \| 'completed' \| 'cancelled'` | No | The new status |
| priority | `'high' \| 'medium' \| 'low'` | No | The new priority |
| tags | `string[]` | No | The new tags |

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
  todo?: {
    id: string;
    title: string;
    status?: 'pending' | 'processing' | 'completed' | 'cancelled';
    priority?: 'high' | 'medium' | 'low';
    tags?: string[];
    description?: string;
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}
```

```typescript
const result = await codebolt.todo.updateTodo({
  id: 'todo-123',
  status: 'completed',
  priority: 'medium'
});
if (result.success) {
  console.log(`Updated todo: ${result.todo?.title}`);
}
```

---

### `getTodoList(params?)`

Retrieves the todo list(s). Can return a single list or multiple lists.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| params | `any` | No | Optional parameters for filtering |

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
  todoList?: {
    id: string;
    name: string;
    todos: TodoItem[];
    archived?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  lists?: Array<{
    id: string;
    name: string;
    todos: TodoItem[];
    archived?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }>;
}
```

```typescript
const result = await codebolt.todo.getTodoList();
if (result.success && result.todoList) {
  console.log(`Found ${result.todoList.todos.length} todos`);
}
```

---

### `getAllIncompleteTodos()`

Retrieves all incomplete todo items across all lists.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| - | - | - | No parameters |

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
  todos?: Array<{
    id: string;
    title: string;
    status?: 'pending' | 'processing' | 'completed' | 'cancelled';
    priority?: 'high' | 'medium' | 'low';
    tags?: string[];
    description?: string;
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
}
```

```typescript
const result = await codebolt.todo.getAllIncompleteTodos();
if (result.success && result.todos) {
  result.todos.forEach(todo => {
    console.log(`- ${todo.title} (${todo.priority})`);
  });
}
```

---

### `exportTodos(params?)`

Exports todos in JSON or markdown format, with optional filtering.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| format | `'json' \| 'markdown'` | No | The export format (default: json) |
| listId | string | No | Optional list ID to filter |
| status | `string[]` | No | Optional status filter (e.g., ['pending', 'processing']) |

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
  data?: string;              // Exported data in requested format
  format?: 'json' | 'markdown';
  count?: number;             // Number of todos exported
}
```

```typescript
const result = await codebolt.todo.exportTodos({
  format: 'markdown',
  status: ['pending']
});
if (result.success) {
  console.log(result.data);
}
```

---

### `importTodos(params)`

Imports todos from JSON or markdown format data.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| data | string | Yes | The import data (JSON or markdown string) |
| format | `'json' \| 'markdown'` | No | The format of the import data (default: json) |
| mergeStrategy | `'replace' \| 'merge'` | No | How to handle existing todos: 'replace' clears all, 'merge' combines (default: merge) |
| listId | string | No | Optional target list ID |

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
  count?: number;             // Number of todos imported
  todos?: Array<{
    id: string;
    title: string;
    status?: 'pending' | 'processing' | 'completed' | 'cancelled';
    priority?: 'high' | 'medium' | 'low';
    tags?: string[];
    description?: string;
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  result?: {
    added?: number;           // Number of new todos added
    updated?: number;         // Number of existing todos updated
    skipped?: number;         // Number of todos skipped
    errors?: string[];        // Any errors that occurred
  };
}
```

```typescript
const result = await codebolt.todo.importTodos({
  data: '[{"title": "New task", "priority": "high"}]',
  format: 'json',
  mergeStrategy: 'merge'
});
if (result.success) {
  console.log(`Imported ${result.count} todos`);
  console.log(`Added: ${result.result?.added}, Updated: ${result.result?.updated}`);
}
```

## Examples

### Creating and Managing a Todo Workflow

```typescript
// Add a new high-priority todo
const todo1 = await codebolt.todo.addTodo({
  title: 'Implement authentication',
  priority: 'high',
  tags: ['backend', 'security']
});

// Update the todo to processing status
if (todo1.success) {
  await codebolt.todo.updateTodo({
    id: todo1.id,
    status: 'processing'
  });
}

// Complete the todo
await codebolt.todo.updateTodo({
  id: todo1.id,
  status: 'completed'
});
```

### Filtering and Exporting Incomplete Tasks

```typescript
// Get all incomplete todos
const incomplete = await codebolt.todo.getAllIncompleteTodos();
if (incomplete.success && incomplete.todos) {
  // Export pending tasks as markdown
  const exported = await codebolt.todo.exportTodos({
    format: 'markdown',
    status: ['pending']
  });
  
  if (exported.success) {
    console.log('Pending tasks:\n' + exported.data);
  }
}
```

### Bulk Import from JSON

```typescript
const todoData = JSON.stringify([
  { title: 'Setup CI/CD pipeline', priority: 'high', tags: ['devops'] },
  { title: 'Write unit tests', priority: 'medium', tags: ['testing'] },
  { title: 'Update documentation', priority: 'low', tags: ['docs'] }
]);

const importResult = await codebolt.todo.importTodos({
  data: todoData,
  format: 'json',
  mergeStrategy: 'merge'
});

if (importResult.success) {
  console.log(`Successfully imported ${importResult.result?.added} tasks`);
}
```

### Retrieving Todo Lists and Filtering

```typescript
// Get the full todo list
const todoList = await codebolt.todo.getTodoList();

if (todoList.success && todoList.todoList) {
  const todos = todoList.todoList.todos;
  
  // Filter by priority and status
  const highPriorityPending = todos.filter(t =>
    t.priority === 'high' && t.status === 'pending'
  );
  
  console.log(`High priority pending tasks: ${highPriorityPending.length}`);
  
  // Update all high-priority pending tasks
  for (const todo of highPriorityPending) {
    await codebolt.todo.updateTodo({
      id: todo.id,
      status: 'processing'
    });
  }
}
```
