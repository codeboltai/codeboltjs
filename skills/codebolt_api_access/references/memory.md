# codebolt.memory - Memory Storage Module

Provides persistent memory storage with support for JSON, Markdown, and Todo formats. Memory items are stored and retrieved through the WebSocket connection, allowing agents to persist and recall data across sessions.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseMemoryResponse {
  requestId: string;  // Unique request identifier
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### SaveMemoryResponse

Returned when saving a new memory item.

```typescript
interface SaveMemoryResponse extends BaseMemoryResponse {
  type: 'saveMemoryResponse';
  memoryId?: string;  // ID of the created memory item
  data?: unknown;     // The saved data
}
```

### UpdateMemoryResponse

Returned when updating an existing memory item.

```typescript
interface UpdateMemoryResponse extends BaseMemoryResponse {
  type: 'updateMemoryResponse';
  memoryId?: string;  // ID of the updated memory item
  data?: unknown;     // The updated data
}
```

### DeleteMemoryResponse

Returned when deleting a memory item.

```typescript
interface DeleteMemoryResponse extends BaseMemoryResponse {
  type: 'deleteMemoryResponse';
}
```

### ListMemoryResponse

Returned when listing memory items.

```typescript
interface ListMemoryResponse extends BaseMemoryResponse {
  type: 'listMemoryResponse';
  items?: unknown[];  // Array of memory items
}
```

### TodoItem

Used for todo format memory items:

```typescript
interface TodoItem {
  id?: string;                            // Todo item ID (optional for create)
  title: string;                          // Todo title
  status?: 'pending' | 'processing' | 'completed';  // Todo status
  priority?: 'low' | 'medium' | 'high';  // Todo priority
  tags?: string[];                        // Todo tags
  createdAt?: string;                     // Creation timestamp
  updatedAt?: string;                     // Update timestamp
}
```

### TodoData

Used for todo save operations (can be single item or array):

```typescript
type TodoData = TodoItem | TodoItem[];
```

## Methods

### JSON Format Methods

---

#### `codebolt.memory.json.save(json)`

Saves a JSON object to memory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| json | any | Yes | JSON data to save |

**Response:**
```typescript
{
  requestId: string;
  type: 'saveMemoryResponse';
  success: boolean;
  message?: string;
  error?: string;
  memoryId?: string;
  data?: unknown;
}
```

```typescript
const result = await codebolt.memory.json.save({ name: 'Project Alpha', status: 'active' });
if (result.success) {
  console.log('Memory saved with ID:', result.memoryId);
}
```

---

#### `codebolt.memory.json.update(memoryId, json)`

Updates an existing JSON memory item.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| memoryId | string | Yes | ID of the memory item to update |
| json | any | Yes | New JSON data |

**Response:**
```typescript
{
  requestId: string;
  type: 'updateMemoryResponse';
  success: boolean;
  message?: string;
  error?: string;
  memoryId?: string;
  data?: unknown;
}
```

```typescript
const result = await codebolt.memory.json.update('mem-123', { name: 'Project Beta', status: 'completed' });
if (result.success) {
  console.log('Memory updated:', result.memoryId);
}
```

---

#### `codebolt.memory.json.delete(memoryId)`

Deletes a JSON memory item.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| memoryId | string | Yes | ID of the memory item to delete |

**Response:**
```typescript
{
  requestId: string;
  type: 'deleteMemoryResponse';
  success: boolean;
  message?: string;
  error?: string;
}
```

```typescript
const result = await codebolt.memory.json.delete('mem-123');
if (result.success) {
  console.log('Memory deleted successfully');
}
```

---

#### `codebolt.memory.json.list(filters?)`

Lists JSON memory items with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filters | Record<string, unknown> | No | Filter criteria (default: {}) |

**Response:**
```typescript
{
  requestId: string;
  type: 'listMemoryResponse';
  success: boolean;
  message?: string;
  error?: string;
  items?: unknown[];
}
```

```typescript
const result = await codebolt.memory.json.list({ status: 'active' });
if (result.success && result.items) {
  console.log('Found items:', result.items.length);
}
```

### Todo Format Methods

---

#### `codebolt.memory.todo.save(todo, metadata?)`

Saves a todo item or array of todo items to memory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| todo | TodoData | Yes | Todo item or array of todo items |
| metadata | Record<string, unknown> | No | Optional metadata (default: {}) |

**Response:**
```typescript
{
  requestId: string;
  type: 'saveMemoryResponse';
  success: boolean;
  message?: string;
  error?: string;
  memoryId?: string;
  data?: TodoItem | TodoItem[];
}
```

```typescript
const result = await codebolt.memory.todo.save({
  title: 'Complete documentation',
  status: 'pending',
  priority: 'high',
  tags: ['docs']
});
if (result.success) {
  console.log('Todo saved with ID:', result.memoryId);
}
```

---

#### `codebolt.memory.todo.update(memoryId, todo)`

Updates an existing todo memory item.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| memoryId | string | Yes | ID of the memory item to update |
| todo | TodoItem | Yes | Updated todo item data |

**Response:**
```typescript
{
  requestId: string;
  type: 'updateMemoryResponse';
  success: boolean;
  message?: string;
  error?: string;
  memoryId?: string;
  data?: TodoItem;
}
```

```typescript
const result = await codebolt.memory.todo.update('mem-456', {
  title: 'Complete documentation',
  status: 'completed',
  priority: 'medium'
});
if (result.success) {
  console.log('Todo updated:', result.memoryId);
}
```

---

#### `codebolt.memory.todo.delete(memoryId)`

Deletes a todo memory item.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| memoryId | string | Yes | ID of the memory item to delete |

**Response:**
```typescript
{
  requestId: string;
  type: 'deleteMemoryResponse';
  success: boolean;
  message?: string;
  error?: string;
}
```

```typescript
const result = await codebolt.memory.todo.delete('mem-456');
if (result.success) {
  console.log('Todo deleted successfully');
}
```

---

#### `codebolt.memory.todo.list(filters?)`

Lists todo memory items with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filters | Record<string, unknown> | No | Filter criteria (default: {}) |

**Response:**
```typescript
{
  requestId: string;
  type: 'listMemoryResponse';
  success: boolean;
  message?: string;
  error?: string;
  items?: TodoItem[];
}
```

```typescript
const result = await codebolt.memory.todo.list({ status: 'pending' });
if (result.success && result.items) {
  console.log('Pending todos:', result.items.length);
}
```

### Markdown Format Methods

---

#### `codebolt.memory.markdown.save(markdown, metadata?)`

Saves markdown content to memory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| markdown | string | Yes | Markdown content to save |
| metadata | Record<string, unknown> | No | Optional metadata (default: {}) |

**Response:**
```typescript
{
  requestId: string;
  type: 'saveMemoryResponse';
  success: boolean;
  message?: string;
  error?: string;
  memoryId?: string;
  data?: string;
}
```

```typescript
const result = await codebolt.memory.markdown.save('# Documentation\n\nThis is a note.');
if (result.success) {
  console.log('Markdown saved with ID:', result.memoryId);
}
```

---

#### `codebolt.memory.markdown.update(memoryId, markdown, metadata?)`

Updates an existing markdown memory item.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| memoryId | string | Yes | ID of the memory item to update |
| markdown | string | Yes | New markdown content |
| metadata | Record<string, unknown> | No | Optional metadata (default: {}) |

**Response:**
```typescript
{
  requestId: string;
  type: 'updateMemoryResponse';
  success: boolean;
  message?: string;
  error?: string;
  memoryId?: string;
  data?: string;
}
```

```typescript
const result = await codebolt.memory.markdown.update('mem-789', '# Updated Documentation\n\nNew content.');
if (result.success) {
  console.log('Markdown updated:', result.memoryId);
}
```

---

#### `codebolt.memory.markdown.delete(memoryId)`

Deletes a markdown memory item.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| memoryId | string | Yes | ID of the memory item to delete |

**Response:**
```typescript
{
  requestId: string;
  type: 'deleteMemoryResponse';
  success: boolean;
  message?: string;
  error?: string;
}
```

```typescript
const result = await codebolt.memory.markdown.delete('mem-789');
if (result.success) {
  console.log('Markdown deleted successfully');
}
```

---

#### `codebolt.memory.markdown.list(filters?)`

Lists markdown memory items with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filters | Record<string, unknown> | No | Filter criteria (default: {}) |

**Response:**
```typescript
{
  requestId: string;
  type: 'listMemoryResponse';
  success: boolean;
  message?: string;
  error?: string;
  items?: string[];
}
```

```typescript
const result = await codebolt.memory.markdown.list({ tag: 'documentation' });
if (result.success && result.items) {
  console.log('Markdown notes:', result.items.length);
}
```

## Examples

### Saving and Retrieving Project Configuration

```typescript
const config = {
  projectName: 'WebApp',
  version: '1.0.0',
  features: ['auth', 'database', 'api'],
  settings: { theme: 'dark', language: 'en' }
};

const saved = await codebolt.memory.json.save(config);
if (saved.success && saved.memoryId) {
  const items = await codebolt.memory.json.list();
  if (items.success && items.items) {
    const projectConfig = items.items.find(item => item.memoryId === saved.memoryId);
    console.log('Retrieved config:', projectConfig);
  }
}
```

### Managing Todo Items

```typescript
const todo1 = await codebolt.memory.todo.save({
  title: 'Implement authentication',
  status: 'pending',
  priority: 'high',
  tags: ['backend', 'security']
});

const todo2 = await codebolt.memory.todo.save({
  title: 'Create database schema',
  status: 'processing',
  priority: 'high',
  tags: ['database']
});

const pendingTodos = await codebolt.memory.todo.list({ status: 'pending' });
if (pendingTodos.success && pendingTodos.items) {
  console.log('Pending tasks:', pendingTodos.items.length);
}

await codebolt.memory.todo.update(todo2.memoryId, {
  ...todo2,
  status: 'completed'
});
```

### Storing Meeting Notes in Markdown

```typescript
const meetingNotes = `
# Team Meeting - 2024-01-15

## Attendees
- Alice
- Bob
- Charlie

## Action Items
1. Review PR #123
2. Update documentation
3. Schedule follow-up
`;

const saved = await codebolt.memory.markdown.save(meetingNotes, {
  date: '2024-01-15',
  type: 'meeting-notes',
  attendees: ['Alice', 'Bob', 'Charlie']
});

if (saved.success) {
  console.log('Meeting notes saved:', saved.memoryId);
}

const allMeetings = await codebolt.memory.markdown.list({ type: 'meeting-notes' });
if (allMeetings.success && allMeetings.items) {
  console.log('Total meetings:', allMeetings.items.length);
}
```

### Creating a Bulk Todo List

```typescript
const todoList = [
  {
    title: 'Setup project structure',
    status: 'completed',
    priority: 'high',
    tags: ['setup']
  },
  {
    title: 'Write unit tests',
    status: 'pending',
    priority: 'medium',
    tags: ['testing']
  },
  {
    title: 'Deploy to production',
    status: 'pending',
    priority: 'high',
    tags: ['deployment']
  }
];

const result = await codebolt.memory.todo.save(todoList);
if (result.success) {
  const highPriority = await codebolt.memory.todo.list({ priority: 'high' });
  if (highPriority.success && highPriority.items) {
    console.log('High priority tasks:', highPriority.items);
  }
}
```
