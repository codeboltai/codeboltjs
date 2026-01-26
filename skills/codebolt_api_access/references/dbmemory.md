# codebolt.dbmemory - In-Memory Database Module

The dbmemory module provides methods for storing and retrieving data in an in-memory database via WebSocket. It allows you to persist key-value pairs that can be accessed throughout your session.

## Response Types

### MemoryValue

The type of values that can be stored in memory:

```typescript
type MemoryValue = string | number | boolean | Record<string, unknown> | unknown[] | null;
```

### MemoryEntry

Full memory entry information (included in get response):

```typescript
interface MemoryEntry {
  key: string;              // Memory key
  value: MemoryValue;       // Stored value
  expiresAt?: string;       // Expiration timestamp
  createdAt: string;        // Creation timestamp
  updatedAt: string;        // Last update timestamp
  metadata?: Record<string, unknown>;  // Additional metadata
}
```

### MemoryOperationResult

Operation result details:

```typescript
interface MemoryOperationResult {
  key: string;              // Operation key
  success: boolean;         // Operation success
  message?: string;         // Operation message
  timestamp: string;        // Operation timestamp
  metadata?: Record<string, unknown>;  // Additional metadata
}
```

## Methods

### `addKnowledge(key, value)`

Stores a key-value pair in the in-memory database.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| key | string | Yes | The key under which to store the value |
| value | MemoryValue | Yes | The value to store (string, number, boolean, object, array, or null) |

**Response:**
```typescript
{
  success?: boolean;        // Whether the operation succeeded
  message?: string;         // Optional status message
  error?: string;           // Error details if operation failed
  requestId?: string;       // Request identifier
  timestamp?: string;       // Response timestamp
  key?: string;             // The key that was set
  value?: MemoryValue;      // The value that was stored
  result?: {
    key: string;            // Operation key
    success: boolean;       // Operation success
    message?: string;       // Operation message
    timestamp: string;      // Operation timestamp
    metadata?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}
```

```typescript
const result = await codebolt.dbmemory.addKnowledge('user_id', 12345);
if (result.success) {
  console.log('Value stored:', result.value);
}
```

---

### `getKnowledge(key)`

Retrieves a value from the in-memory database by key.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| key | string | Yes | The key of the value to retrieve |

**Response:**
```typescript
{
  success?: boolean;        // Whether the operation succeeded
  message?: string;         // Optional status message
  error?: string;           // Error details if operation failed
  requestId?: string;       // Request identifier
  timestamp?: string;       // Response timestamp
  key?: string;             // The retrieved key
  value?: MemoryValue;      // The retrieved value
  entry?: {
    key: string;            // Memory key
    value: MemoryValue;     // Stored value
    expiresAt?: string;     // Expiration timestamp
    createdAt: string;      // Creation timestamp
    updatedAt: string;      // Last update timestamp
    metadata?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}
```

```typescript
const result = await codebolt.dbmemory.getKnowledge('user_id');
if (result.success && result.value !== undefined) {
  console.log('Retrieved value:', result.value);
} else {
  console.log('Key not found or error:', result.error);
}
```

## Examples

### Storing and Retrieving Simple Values

```typescript
// Store a simple string value
await codebolt.dbmemory.addKnowledge('username', 'john_doe');

// Store a number
await codebolt.dbmemory.addKnowledge('login_attempts', 3);

// Retrieve the values
const userResult = await codebolt.dbmemory.getKnowledge('username');
const attemptsResult = await codebolt.dbmemory.getKnowledge('login_attempts');

console.log(userResult.value);  // 'john_doe'
console.log(attemptsResult.value);  // 3
```

### Storing Complex Objects

```typescript
// Store a user object
const userData = {
  id: 123,
  name: 'Jane Doe',
  email: 'jane@example.com',
  preferences: {
    theme: 'dark',
    notifications: true
  }
};

await codebolt.dbmemory.addKnowledge('user:123', userData);

// Retrieve the user data
const result = await codebolt.dbmemory.getKnowledge('user:123');
if (result.success && result.value) {
  const user = result.value as typeof userData;
  console.log('User email:', user.email);
}
```

### Storing Arrays and Lists

```typescript
// Store a list of tags
const tags = ['typescript', 'react', 'nodejs'];
await codebolt.dbmemory.addKnowledge('project:tags', tags);

// Store task list
const tasks = [
  { id: 1, text: 'Setup project', done: true },
  { id: 2, text: 'Write tests', done: false },
  { id: 3, text: 'Deploy', done: false }
];
await codebolt.dbmemory.addKnowledge('todo_list', tasks);

// Retrieve and use
const result = await codebolt.dbmemory.getKnowledge('todo_list');
if (result.success && result.value) {
  const tasks = result.value as typeof tasks;
  const pendingTasks = tasks.filter(t => !t.done);
  console.log('Pending tasks:', pendingTasks.length);
}
```

### Error Handling

```typescript
// Safe retrieval with error handling
async function getUserPreference(key: string, defaultValue = 'default') {
  try {
    const result = await codebolt.dbmemory.getKnowledge(key);
    if (result.success && result.value !== undefined) {
      return result.value;
    }
    console.warn('Using default value:', result.error || 'Key not found');
    return defaultValue;
  } catch (error) {
    console.error('Failed to retrieve preference:', error);
    return defaultValue;
  }
}

const theme = await getUserPreference('user:theme', 'light');
