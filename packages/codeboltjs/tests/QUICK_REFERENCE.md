# Test Setup Quick Reference

Quick reference guide for the CodeboltJS test setup utilities.

## Imports

```typescript
// Core imports
import {
    sharedCodebolt,
    waitForConnection,
    setupTestEnvironment,
    teardownTestEnvironment,
} from './setup';

// Test helpers
import {
    runTest,
    withTimeout,
    retryOperation,
    delay,
    createTimeout,
} from './setup';

// Mock utilities
import {
    createMockResponse,
    createMockError,
    mockWebSocketMessage,
    setMockResponse,
    getMockResponse,
    clearMockData,
} from './setup';

// State management
import {
    isConnectionReady,
    waitForConnectionWithRetry,
    resetTestState,
} from './setup';

// Utility exports
import { testUtils, mockUtils, getTestState } from './setup';
```

## Common Patterns

### 1. Basic Test Setup

```typescript
import { sharedCodebolt, waitForConnection } from './setup';

describe('My Tests', () => {
    beforeAll(async () => {
        await waitForConnection();
    });

    test('my test', async () => {
        const codebolt = sharedCodebolt();
        // Test code here...
    });
});
```

### 2. With Timeout Protection

```typescript
import { sharedCodebolt, withTimeout } from './setup';

test('with timeout', async () => {
    const result = await withTimeout(
        async () => {
            const codebolt = sharedCodebolt();
            return await codebolt.fs.readFile('test.txt');
        },
        5000,
        'Operation timed out'
    );
});
```

### 3. With Retry Logic

```typescript
import { retryOperation } from './setup';

test('with retry', async () => {
    const result = await retryOperation(
        async () => {
            // Operation that might fail temporarily
        },
        3,      // max retries
        1000    // base delay
    );
});
```

### 4. With Automatic Setup

```typescript
import { runTest } from './setup';

test('with auto setup', async () => {
    const result = await runTest(async () => {
        const codebolt = sharedCodebolt();
        return await someOperation();
    });
});
```

### 5. With Mock Data

```typescript
import { setMockResponse, getMockResponse, clearMockData } from './setup';

describe('With Mocks', () => {
    beforeEach(() => {
        setMockResponse('test-data', { value: 'test' });
    });

    afterEach(() => {
        clearMockData();
    });

    test('uses mock data', () => {
        const data = getMockResponse('test-data');
        expect(data.value).toBe('test');
    });
});
```

## API Cheat Sheet

### Connection Management

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `sharedCodebolt()` | - | `Codebolt` | Get shared instance |
| `waitForConnection(timeout?)` | `number` | `Promise<void>` | Wait for connection |
| `isConnectionReady()` | - | `boolean` | Check if ready |
| `waitForConnectionWithRetry(maxRetries?, delay?)` | `number, number` | `Promise<void>` | Wait with retry |
| `setupTestEnvironment(config?)` | `TestSetupConfig` | `Promise<void>` | Initialize environment |
| `teardownTestEnvironment()` | - | `Promise<void>` | Cleanup environment |

### Test Helpers

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `runTest(testFn)` | `() => Promise<T>` | `Promise<T>` | Run with auto-setup |
| `withTimeout(fn, timeoutMs, msg?)` | `Function, number, string` | `Promise<T>` | Wrap with timeout |
| `retryOperation(op, maxRetries?, baseDelay?)` | `Function, number, number` | `Promise<T>` | Retry with backoff |
| `delay(ms)` | `number` | `Promise<void>` | Delay execution |
| `createTimeout(ms, msg?)` | `number, string` | `Promise<never>` | Create timeout promise |

### Mock Utilities

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `createMockResponse(data, delay?)` | `T, number` | `Promise<T>` | Create mock response |
| `createMockError(msg, code?)` | `string, string` | `Error` | Create mock error |
| `mockWebSocketMessage(type, data)` | `string, any` | `any` | Create mock message |
| `setMockResponse(key, value)` | `string, any` | `void` | Store mock response |
| `getMockResponse(key)` | `string` | `any \| undefined` | Retrieve mock response |
| `clearMockData()` | - | `void` | Clear all mocks |

### State Management

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `resetTestState()` | - | `void` | Reset test state |
| `getTestState()` | - | `TestState` | Get current state |

## Configuration

### TestSetupConfig

```typescript
interface TestSetupConfig {
    connectionTimeout?: number;  // Default: 30000ms
    debug?: boolean;             // Default: false
    serverUrl?: string;          // Override server URL
    port?: string;               // Override port
}
```

### Example Configuration

```typescript
import { setupTestEnvironment } from './setup';

await setupTestEnvironment({
    connectionTimeout: 60000,
    debug: true,
    serverUrl: 'localhost',
    port: '12345',
});
```

## Environment Variables

```bash
# Required
SOCKET_PORT=12345
CODEBOLT_SERVER_URL=localhost

# Optional
agentId=test-agent
parentId=test-parent
threadToken=test-token
DEBUG_TESTS=true
```

## Common Timeouts

- **Connection timeout**: 30000ms (30 seconds)
- **Test timeout**: 5000ms (5 seconds) - configure in Jest
- **File operations**: 5000ms (5 seconds)
- **LLM operations**: 10000ms (10 seconds)
- **Network operations**: 5000ms (5 seconds)

## Best Practices

1. **Always wait for connection** before tests
2. **Use timeouts** to prevent hanging tests
3. **Clear mock data** between tests
4. **Use descriptive test names**
5. **Test error cases** along with success cases
6. **Keep tests isolated** - don't rely on execution order
7. **Use retry logic** for flaky network operations

## Troubleshooting

### Connection Issues

```typescript
// Enable debug logging
await setupTestEnvironment({ debug: true });

// Increase timeout
await setupTestEnvironment({ connectionTimeout: 60000 });
```

### Timeout Errors

```typescript
// Increase Jest timeout in jest.config.js
testTimeout: 60000

// Use withTimeout wrapper
const result = await withTimeout(
    operation,
    10000,
    'Custom timeout message'
);
```

### Mock Data Issues

```typescript
// Clear between tests
afterEach(() => {
    clearMockData();
    resetTestState();
});
```

## File Structure

```
tests/
├── setup.ts              # Main test setup file
├── README.md             # Detailed documentation
├── QUICK_REFERENCE.md    # This file
├── example.test.ts       # Example test file
├── fs.test.js            # File system tests
├── chat.test.js          # Chat tests
└── *.test.ts             # Your test files
```

## Further Reading

- See `README.md` for detailed documentation
- See `example.test.ts` for comprehensive examples
- See `setup.ts` for implementation details
